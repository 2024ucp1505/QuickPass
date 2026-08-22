const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Classroom = require('../models/Classroom');
const Session = require('../models/Session');
const AttendanceLog = require('../models/AttendanceLog');
const User = require('../models/User');
const { generateQRPayload } = require('../utils/crypto');
const { sendLowAttendanceEmail } = require('../utils/email');

const router = express.Router();
router.use(protect, authorize('teacher'));

// ─── Classroom CRUD ─────────────────────────────────────────────────────────

// GET /api/teacher/classrooms
router.get('/classrooms', async (req, res, next) => {
  try {
    const classrooms = await Classroom.find({ teacherId: req.user.id })
      .populate('enrolledStudents', 'name email studentId')
      .sort({ createdAt: -1 });
    res.json(classrooms);
  } catch (err) { next(err); }
});

// POST /api/teacher/classrooms
router.post('/classrooms', async (req, res, next) => {
  try {
    const { name, courseCode, schedule } = req.body;
    if (!name || !courseCode) {
      return res.status(400).json({ message: 'Name and course code are required.' });
    }
    const classroom = await Classroom.create({
      teacherId: req.user.id,
      name,
      courseCode,
      schedule: schedule || [],
    });
    res.status(201).json(classroom);
  } catch (err) { next(err); }
});

// PUT /api/teacher/classrooms/:id
router.put('/classrooms/:id', async (req, res, next) => {
  try {
    const classroom = await Classroom.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate('enrolledStudents', 'name email studentId');
    if (!classroom) return res.status(404).json({ message: 'Classroom not found.' });
    res.json(classroom);
  } catch (err) { next(err); }
});

// DELETE /api/teacher/classrooms/:id
router.delete('/classrooms/:id', async (req, res, next) => {
  try {
    const classroom = await Classroom.findOneAndDelete({ _id: req.params.id, teacherId: req.user.id });
    if (!classroom) return res.status(404).json({ message: 'Classroom not found.' });
    res.json({ message: 'Classroom deleted.' });
  } catch (err) { next(err); }
});

// ─── Student Enrollment ──────────────────────────────────────────────────────

// POST /api/teacher/classrooms/:id/enroll
router.post('/classrooms/:id/enroll', async (req, res, next) => {
  try {
    const { email, studentId } = req.body;
    const query = email ? { email } : { studentId };
    const student = await User.findOne({ ...query, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const classroom = await Classroom.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user.id },
      { $addToSet: { enrolledStudents: student._id } },
      { new: true }
    ).populate('enrolledStudents', 'name email studentId');

    if (!classroom) return res.status(404).json({ message: 'Classroom not found.' });
    res.json(classroom);
  } catch (err) { next(err); }
});

// DELETE /api/teacher/classrooms/:id/enroll/:studentId
router.delete('/classrooms/:id/enroll/:studentId', async (req, res, next) => {
  try {
    const classroom = await Classroom.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user.id },
      { $pull: { enrolledStudents: req.params.studentId } },
      { new: true }
    ).populate('enrolledStudents', 'name email studentId');
    if (!classroom) return res.status(404).json({ message: 'Classroom not found.' });
    res.json(classroom);
  } catch (err) { next(err); }
});

// ─── Sessions ────────────────────────────────────────────────────────────────

// GET /api/teacher/classrooms/:id/sessions
router.get('/classrooms/:id/sessions', async (req, res, next) => {
  try {
    const sessions = await Session.find({ classroomId: req.params.id }).sort({ date: -1 });
    res.json(sessions);
  } catch (err) { next(err); }
});

// POST /api/teacher/classrooms/:id/sessions/start
router.post('/classrooms/:id/sessions/start', async (req, res, next) => {
  try {
    // Close any existing active sessions for this classroom
    await Session.updateMany(
      { classroomId: req.params.id, status: 'active' },
      { status: 'completed', endTime: new Date().toLocaleTimeString('en-US', { hour12: false }) }
    );

    const now = new Date();
    const session = await Session.create({
      classroomId: req.params.id,
      date: now,
      startTime: now.toLocaleTimeString('en-US', { hour12: false }),
      status: 'active',
    });
    res.status(201).json(session);
  } catch (err) { next(err); }
});

// POST /api/teacher/sessions/:sessionId/end
router.post('/sessions/:sessionId/end', async (req, res, next) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.sessionId,
      {
        status: 'completed',
        endTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
      },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found.' });
    res.json(session);
  } catch (err) { next(err); }
});

// ─── Attendance & Analytics ──────────────────────────────────────────────────

// GET /api/teacher/sessions/:sessionId/attendance
router.get('/sessions/:sessionId/attendance', async (req, res, next) => {
  try {
    const logs = await AttendanceLog.find({ sessionId: req.params.sessionId })
      .populate('studentId', 'name email studentId')
      .populate('proxyFlag.suspectedStudentId', 'name email studentId')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) { next(err); }
});

// GET /api/teacher/classrooms/:id/analytics
router.get('/classrooms/:id/analytics', async (req, res, next) => {
  try {
    const sessions = await Session.find({ classroomId: req.params.id });
    const sessionIds = sessions.map(s => s._id);

    const classroom = await Classroom.findById(req.params.id)
      .populate('enrolledStudents', 'name email studentId');

    if (!classroom) return res.status(404).json({ message: 'Classroom not found.' });

    const totalSessions = sessions.length;
    const studentStats = await Promise.all(
      classroom.enrolledStudents.map(async (student) => {
        const presentCount = await AttendanceLog.countDocuments({
          sessionId: { $in: sessionIds },
          studentId: student._id,
          status: 'present',
        });
        const proxyCount = await AttendanceLog.countDocuments({
          sessionId: { $in: sessionIds },
          studentId: student._id,
          status: 'flagged_proxy',
        });
        const percentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;
        return {
          student,
          presentCount,
          proxyCount,
          totalSessions,
          percentage,
        };
      })
    );

    const proxyFlags = await AttendanceLog.find({
      sessionId: { $in: sessionIds },
      status: 'flagged_proxy',
    })
      .populate('studentId', 'name email studentId')
      .populate('proxyFlag.suspectedStudentId', 'name email')
      .sort({ timestamp: -1 });

    res.json({ sessions, studentStats, proxyFlags });
  } catch (err) { next(err); }
});

// ─── Email Notification ──────────────────────────────────────────────────────

// POST /api/teacher/classrooms/:id/notify-low-attendance
router.post('/classrooms/:id/notify-low-attendance', async (req, res, next) => {
  try {
    const sessions = await Session.find({ classroomId: req.params.id });
    const sessionIds = sessions.map(s => s._id);
    const totalSessions = sessions.length;

    const classroom = await Classroom.findById(req.params.id)
      .populate('enrolledStudents', 'name email studentId');

    if (!classroom) return res.status(404).json({ message: 'Classroom not found.' });

    const results = [];
    for (const student of classroom.enrolledStudents) {
      const presentCount = await AttendanceLog.countDocuments({
        sessionId: { $in: sessionIds },
        studentId: student._id,
        status: 'present',
      });
      const percentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

      if (percentage < 75) {
        const emailResult = await sendLowAttendanceEmail({
          to: student.email,
          studentName: student.name,
          courseName: classroom.name,
          attendancePercent: percentage,
        });
        results.push({ student: student.name, email: student.email, percentage, ...emailResult });
      }
    }

    res.json({
      message: `Notifications processed for ${results.length} student(s).`,
      results,
    });
  } catch (err) { next(err); }
});

// ─── QR Generation (REST fallback) ──────────────────────────────────────────

// GET /api/teacher/sessions/:sessionId/qr
router.get('/sessions/:sessionId/qr', async (req, res, next) => {
  try {
    const payload = generateQRPayload(req.params.sessionId, req.user.id);
    res.json({ payload, expiresIn: 10 });
  } catch (err) { next(err); }
});

module.exports = router;
