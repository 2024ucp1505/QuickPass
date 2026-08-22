import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate, formatTime, getAttendanceColor, getProgressColor } from '../../utils/helpers';

const AttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.get('/student/my-attendance')
      .then(res => setAttendance(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading attendance..." />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Attendance</h1>
        <p className="page-subtitle">Track your attendance across all enrolled courses.</p>
      </div>

      {attendance.length === 0 ? (
        <div className="card text-center py-48">
          <p className="text-[40px] mb-12">📭</p>
          <p className="text-heading mb-8">No attendance records</p>
          <p className="text-body text-text-muted">You're not enrolled in any classrooms yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-16">
          {attendance.map(({ classroom, totalSessions, presentCount, percentage, logs }) => (
            <div key={classroom._id} className="card">
              {/* Course Header */}
              <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpandedId(expandedId === classroom._id ? null : classroom._id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-12 mb-6">
                    <span className="badge-info">{classroom.courseCode}</span>
                    {percentage < 75 && totalSessions > 0 && (
                      <span className="badge-warning">⚠ Below 75%</span>
                    )}
                  </div>
                  <h3 className="text-heading text-primary mb-12">{classroom.name}</h3>
                  <div className="flex items-center gap-16">
                    <div className="flex-1 max-w-xs">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-label text-text-muted">{presentCount}/{totalSessions} sessions</span>
                        <span className={`text-label font-bold ${getAttendanceColor(percentage)}`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${getProgressColor(percentage)}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-12 ml-12 shrink-0">
                  <span className={`text-display font-bold ${getAttendanceColor(percentage)}`}>
                    {percentage.toFixed(0)}%
                  </span>
                  <span className="text-text-muted">{expandedId === classroom._id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Log details */}
              {expandedId === classroom._id && (
                <div className="mt-20 pt-16 border-t border-border animate-fade-in">
                  <p className="text-label font-semibold text-text-muted mb-12">SESSION HISTORY</p>
                  {logs.length === 0 ? (
                    <p className="text-body text-text-muted">No sessions recorded yet.</p>
                  ) : (
                    <div className="flex flex-col gap-8">
                      {logs.map((log) => (
                        <div key={log._id} className="flex items-center justify-between p-12 bg-background rounded-md">
                          <div>
                            <p className="text-body font-medium text-primary">
                              {log.sessionId?.date ? formatDate(log.sessionId.date) : 'Unknown date'}
                            </p>
                            <p className="text-label text-text-muted">
                              Recorded: {formatTime(log.timestamp)}
                            </p>
                          </div>
                          <span className={
                            log.status === 'present' ? 'badge-success' :
                            log.status === 'flagged_proxy' ? 'badge-danger' :
                            'badge-neutral'
                          }>
                            {log.status === 'present' ? '✓ Present' :
                             log.status === 'flagged_proxy' ? '⚠ Proxy' : '✗ Cancelled'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
