import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAttendanceColor, getProgressColor } from '../../utils/helpers';

const StudentOverview = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/student/my-attendance'),
      api.get('/student/active-sessions'),
    ])
      .then(([atRes, sessRes]) => {
        setAttendance(atRes.data);
        setActiveSessions(sessRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading your overview..." />;

  const avgAttendance = attendance.length > 0
    ? attendance.reduce((acc, a) => acc + a.percentage, 0) / attendance.length
    : 0;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">
          Hey, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="page-subtitle">Track your attendance and stay on top of your classes.</p>
      </div>

      {/* Active session alert */}
      {activeSessions.length > 0 && (
        <div className="mb-24 p-16 bg-accent-light border border-accent border-opacity-30 rounded-lg flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-12">
            <div className="w-10 h-10 rounded-full bg-accent animate-pulse" />
            <div>
              <p className="text-body font-semibold text-accent">
                Active session: {activeSessions[0].classroomId?.name}
              </p>
              <p className="text-label text-text-muted">Tap to mark your attendance now</p>
            </div>
          </div>
          <Link to="/student/scan" id="attend-now-btn" className="btn-primary btn-sm">
            Scan QR Now ▶
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-16 mb-32">
        <div className="stat-card">
          <span className="stat-label">Enrolled Courses</span>
          <div className="stat-value text-gradient">{attendance.length}</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg. Attendance</span>
          <div className={`stat-value ${getAttendanceColor(avgAttendance)}`}>
            {avgAttendance.toFixed(0)}%
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Sessions</span>
          <div className="stat-value text-accent">{activeSessions.length}</div>
        </div>
        <div className="stat-card">
          <span className="stat-label">At Risk Courses</span>
          <div className="stat-value text-danger">
            {attendance.filter(a => a.percentage < 75 && a.totalSessions > 0).length}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-32">
        <h2 className="text-heading text-primary mb-16">Quick Actions</h2>
        <div className="flex flex-wrap gap-12">
          <Link to="/student/scan" id="quick-scan" className="btn-primary">📷 Scan QR Code</Link>
          <Link to="/student/attendance" id="quick-attendance" className="btn-secondary">📅 View Attendance</Link>
          <Link to="/student/notes" id="quick-notes" className="btn-secondary">📝 My Notes</Link>
        </div>
      </div>

      {/* Attendance Cards */}
      <h2 className="text-heading text-primary mb-16">Course Attendance</h2>
      {attendance.length === 0 ? (
        <div className="card text-center py-48">
          <p className="text-[40px] mb-12">📭</p>
          <p className="text-heading mb-8">Not enrolled in any courses</p>
          <p className="text-body text-text-muted">Ask your teacher to enroll you in a classroom.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {attendance.map(({ classroom, totalSessions, presentCount, percentage }) => (
            <div key={classroom._id} className="card">
              <div className="flex items-start justify-between mb-12">
                <div>
                  <span className="badge-info mb-6 inline-block">{classroom.courseCode}</span>
                  <h3 className="text-heading text-primary">{classroom.name}</h3>
                </div>
                <span className={`text-display font-bold ${getAttendanceColor(percentage)}`}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
              <div className="progress-bar mb-8">
                <div
                  className={`progress-fill ${getProgressColor(percentage)}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-label text-text-muted">
                  {presentCount} / {totalSessions} sessions
                </p>
                {percentage < 75 && totalSessions > 0 && (
                  <span className="badge-warning">⚠ Below 75%</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentOverview;
