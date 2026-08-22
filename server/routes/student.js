const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { validateQRPayload } = require('../utils/crypto');
const AttendanceLog = require('../models/AttendanceLog');
const Session = require('../models/Session');
const Classroom = require('../models/Classroom');
const Note = require('../models/Note');

const router = express.Router();
router.use(protect, authorize('student'));

// ─── Attendance ──────────────────────────────────────────────────────────────

// POST /api/student/scan
router.post('/scan', async (req, res, next) => {
  try {
    const { encryptedPayload, deviceId } = req.body;

    if (!encryptedPayload || !deviceId) {
      return res.status(400).json({ message: 'QR payload and device ID are required.' });
    }

    // Step 1: Decrypt & validate QR payload (timestamp within 10s)
    let parsed;
    try {
      parsed = validateQRPayload(encryptedPayload);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const { sessionId } = parsed;
    const studentId = req.user.id;

    // Step 2: Verify the session is active
    const session = await Session.findById(sessionId).populate('classroomId');
    if (!session || session.status !== 'active') {
      return res.status(400).json({ message: 'This session is not active.' });
    }

    // Step 3: Check if student is enrolled
    const classroom = await Classroom.findById(session.classroomId);
    if (!classroom.enrolledStudents.map(String).includes(String(studentId))) {
      return res.status(403).json({ message: 'You are not enrolled in this class.' });
    }

    // Step 4: Check for already existing log (student already marked)
    const existingLog = await AttendanceLog.findOne({ sessionId, studentId });
    if (existingLog && existingLog.status === 'present') {
      return res.status(409).json({ message: 'Attendance already marked for this session.' });
    }

    // Step 5: Anti-proxy check — check if this deviceId was used by a DIFFERENT student
    const deviceConflict = await AttendanceLog.findOne({
      sessionId,
      deviceId,
      studentId: { $ne: studentId },
      status: 'present',
    });

    if (deviceConflict) {
      // Flag BOTH the current student and the previous one
      // Mark current attempt as flagged
      const flaggedLog = await AttendanceLog.create({
        sessionId,
        studentId,
        deviceId,
        status: 'flagged_proxy',
        proxyFlag: {
          suspectedDeviceId: deviceId,
          suspectedStudentId: deviceConflict.studentId,
        },
      });

      // Also flag the existing log
      await AttendanceLog.findByIdAndUpdate(deviceConflict._id, {
        status: 'flagged_proxy',
        'proxyFlag.suspectedStudentId': studentId,
        'proxyFlag.suspectedDeviceId': deviceId,
      });

      // Emit real-time proxy alert to teacher via socket (handled in index.js via global io)
      if (global.io) {
        global.io.to(`session_${sessionId}`).emit('proxy_flagged', {
          sessionId,
          flaggedStudentId: studentId,
          suspectedStudentId: deviceConflict.studentId,
          deviceId,
          message: '⚠️ Proxy attendance detected!',
        });
      }

      return res.status(403).json({
        message: '⚠️ Proxy detected: This device was used by another student.',
        flagged: true,
      });
    }

    // Step 6: Mark attendance
    const undoExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    let log;

    if (existingLog) {
      // Re-activate cancelled attendance
      log = await AttendanceLog.findByIdAndUpdate(
        existingLog._id,
        { status: 'present', deviceId, timestamp: new Date(), undoExpiresAt },
        { new: true }
      );
    } else {
      log = await AttendanceLog.create({
        sessionId,
        studentId,
        deviceId,
        status: 'present',
        undoExpiresAt,
      });
    }

    // Step 7: Emit real-time update to teacher's room
    if (global.io) {
      const populatedLog = await AttendanceLog.findById(log._id).populate('studentId', 'name email studentId');
      global.io.to(`session_${sessionId}`).emit('attendance_marked', populatedLog);
    }

    res.status(201).json({
      message: '✅ Attendance marked successfully!',
      log,
      undoExpiresAt,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/student/undo/:logId
router.post('/undo/:logId', async (req, res, next) => {
  try {
    const log = await AttendanceLog.findOne({ _id: req.params.logId, studentId: req.user.id });
    if (!log) return res.status(404).json({ message: 'Attendance log not found.' });
    if (log.status !== 'present') {
      return res.status(400).json({ message: 'Only present logs can be cancelled.' });
    }
    if (!log.undoExpiresAt || new Date() > log.undoExpiresAt) {
      return res.status(400).json({ message: 'Undo period has expired (5 minutes).' });
    }

    log.status = 'cancelled';
    await log.save();

    if (global.io) {
      global.io.to(`session_${log.sessionId}`).emit('attendance_cancelled', {
        sessionId: log.sessionId,
        studentId: req.user.id,
        logId: log._id,
      });
    }

    res.json({ message: 'Attendance cancelled.', log });
  } catch (err) { next(err); }
});

// GET /api/student/my-classrooms
router.get('/my-classrooms', async (req, res, next) => {
  try {
    const classrooms = await Classroom.find({ enrolledStudents: req.user.id })
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });
    res.json(classrooms);
  } catch (err) { next(err); }
});

// GET /api/student/my-attendance
router.get('/my-attendance', async (req, res, next) => {
  try {
    const classrooms = await Classroom.find({ enrolledStudents: req.user.id });

    const stats = await Promise.all(
      classrooms.map(async (classroom) => {
        const sessions = await Session.find({ classroomId: classroom._id });
        const totalSessions = sessions.length;
        const sessionIds = sessions.map(s => s._id);

        const presentCount = await AttendanceLog.countDocuments({
          sessionId: { $in: sessionIds },
          studentId: req.user.id,
          status: 'present',
        });

        const logs = await AttendanceLog.find({
          sessionId: { $in: sessionIds },
          studentId: req.user.id,
        })
          .populate('sessionId')
          .sort({ timestamp: -1 });

        const percentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;
        return { classroom, totalSessions, presentCount, percentage, logs };
      })
    );

    res.json(stats);
  } catch (err) { next(err); }
});

// GET /api/student/active-sessions
router.get('/active-sessions', async (req, res, next) => {
  try {
    const classrooms = await Classroom.find({ enrolledStudents: req.user.id });
    const classroomIds = classrooms.map(c => c._id);

    const sessions = await Session.find({
      classroomId: { $in: classroomIds },
      status: 'active',
    }).populate('classroomId', 'name courseCode');

    res.json(sessions);
  } catch (err) { next(err); }
});

// GET /api/student/schedule
router.get('/schedule', async (req, res, next) => {
  try {
    const classrooms = await Classroom.find({ enrolledStudents: req.user.id })
      .populate('teacherId', 'name');
    res.json(classrooms);
  } catch (err) { next(err); }
});

// ─── Notes ────────────────────────────────────────────────────────────────────

// GET /api/student/notes/:classroomId
router.get('/notes/:classroomId', async (req, res, next) => {
  try {
    const notes = await Note.find({
      studentId: req.user.id,
      classroomId: req.params.classroomId,
    }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) { next(err); }
});

// POST /api/student/notes/:classroomId
router.post('/notes/:classroomId', async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title) return res.status(400).json({ message: 'Note title is required.' });
    const note = await Note.create({
      studentId: req.user.id,
      classroomId: req.params.classroomId,
      title,
      content: content || '',
    });
    res.status(201).json(note);
  } catch (err) { next(err); }
});

// PUT /api/student/notes/:noteId
router.put('/notes/:noteId', async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.noteId, studentId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json(note);
  } catch (err) { next(err); }
});

// DELETE /api/student/notes/:noteId
router.delete('/notes/:noteId', async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.noteId, studentId: req.user.id });
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json({ message: 'Note deleted.' });
  } catch (err) { next(err); }
});

module.exports = router;
