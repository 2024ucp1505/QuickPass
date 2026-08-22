const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('./models/User');
const Classroom = require('./models/Classroom');
const Session = require('./models/Session');
const AttendanceLog = require('./models/AttendanceLog');
const Note = require('./models/Note');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env file');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all existing data
    await User.deleteMany({});
    await Classroom.deleteMany({});
    await Session.deleteMany({});
    await AttendanceLog.deleteMany({});
    await Note.deleteMany({});
    console.log('🗑️  Cleared all existing data');

    // Create Teacher
    const hashedPassword = await bcrypt.hash('password123', 10);
    const teacher = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: 'teacher@quickpass.dev',
      password: hashedPassword,
      role: 'teacher',
      studentId: null,
    });
    console.log(`👩‍🏫 Teacher created: ${teacher.email}`);

    // Create 5 Students
    const studentData = [
      { name: 'Alex Johnson',    email: 'alex@student.dev',    studentId: 'STU001' },
      { name: 'Priya Sharma',    email: 'priya@student.dev',   studentId: 'STU002' },
      { name: 'Carlos Rivera',   email: 'carlos@student.dev',  studentId: 'STU003' },
      { name: 'Emma Wilson',     email: 'emma@student.dev',    studentId: 'STU004' },
      { name: 'David Chen',      email: 'david@student.dev',   studentId: 'STU005' },
    ];

    const students = await Promise.all(
      studentData.map(s => User.create({ ...s, password: hashedPassword, role: 'student' }))
    );
    console.log(`🎓 ${students.length} Students created`);

    // Create Classroom
    const classroom = await Classroom.create({
      teacherId: teacher._id,
      name: 'Introduction to Computer Science',
      courseCode: 'CS101',
      schedule: [
        { day: 'Monday',    startTime: '09:00', endTime: '10:30' },
        { day: 'Wednesday', startTime: '09:00', endTime: '10:30' },
        { day: 'Friday',    startTime: '11:00', endTime: '12:30' },
      ],
      enrolledStudents: students.map(s => s._id),
    });
    console.log(`📚 Classroom created: ${classroom.name} (${classroom.courseCode})`);

    // Create a completed session with attendance logs
    const pastSession = await Session.create({
      classroomId: classroom._id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      startTime: '09:00',
      endTime: '10:30',
      status: 'completed',
    });

    // Mark 4 of 5 students as present for the past session
    await Promise.all(
      students.slice(0, 4).map(student =>
        AttendanceLog.create({
          sessionId: pastSession._id,
          studentId: student._id,
          deviceId: `demo-device-${student.studentId}`,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: 'present',
        })
      )
    );

    // Create a second past session
    const pastSession2 = await Session.create({
      classroomId: classroom._id,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      startTime: '09:00',
      endTime: '10:30',
      status: 'completed',
    });

    // Mark all 5 students present for session 2
    await Promise.all(
      students.map(student =>
        AttendanceLog.create({
          sessionId: pastSession2._id,
          studentId: student._id,
          deviceId: `demo-device-${student.studentId}`,
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: 'present',
        })
      )
    );

    // Create a demo note for the first student
    await Note.create({
      studentId: students[0]._id,
      classroomId: classroom._id,
      title: 'Lecture 1 Notes',
      content: '## Introduction to CS\n\n- What is a computer?\n- Binary representation\n- Basic algorithms\n\n**Key takeaway:** Computers process information using binary (0s and 1s).',
    });

    console.log('\n✨ Seed completed successfully!\n');
    console.log('─────────────────────────────────────────');
    console.log('🔑 Demo Credentials:');
    console.log('   Teacher:  teacher@quickpass.dev / password123');
    console.log('   Student1: alex@student.dev / password123');
    console.log('   Student2: priya@student.dev / password123');
    console.log('   Student3: carlos@student.dev / password123');
    console.log('   Student4: emma@student.dev / password123');
    console.log('   Student5: david@student.dev / password123');
    console.log('─────────────────────────────────────────\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
