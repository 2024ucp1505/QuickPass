import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getAttendanceColor, getProgressColor } from '../../utils/helpers';

const AnalyticsPage = () => {
  const [searchParams] = useSearchParams();
  const [classrooms, setClassrooms] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('classroom') || '');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classroomsLoading, setClassroomsLoading] = useState(true);
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    api.get('/teacher/classrooms')
      .then(res => {
        setClassrooms(res.data);
        if (!selectedId && res.data.length > 0) setSelectedId(res.data[0]._id);
      })
      .finally(() => setClassroomsLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    api.get(`/teacher/classrooms/${selectedId}/analytics`)
      .then(res => setAnalytics(res.data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const handleNotify = async () => {
    setNotifying(true);
    try {
      const res = await api.post(`/teacher/classrooms/${selectedId}/notify-low-attendance`);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Notification failed.');
    } finally {
      setNotifying(false);
    }
  };

  if (classroomsLoading) return <LoadingSpinner message="Loading analytics..." />;

  const selectedClassroom = classrooms.find(c => c._id === selectedId);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">View attendance statistics and identify students at risk.</p>
      </div>

      {/* Classroom selector */}
      <div className="flex flex-wrap items-center gap-12 mb-32">
        <select
          id="analytics-classroom-select"
          className="input max-w-xs"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
        >
          <option value="">-- Select classroom --</option>
          {classrooms.map(cls => (
            <option key={cls._id} value={cls._id}>[{cls.courseCode}] {cls.name}</option>
          ))}
        </select>
        {selectedId && (
          <button
            id="send-notifications-btn"
            onClick={handleNotify}
            disabled={notifying}
            className="btn-primary"
          >
            {notifying ? '⏳ Sending...' : '📧 Notify Low-Attendance Students'}
          </button>
        )}
      </div>

      {loading && <LoadingSpinner message="Loading data..." />}

      {analytics && !loading && (
        <>
          {/* Summary Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 mb-32">
            <div className="stat-card">
              <span className="stat-label">Total Sessions</span>
              <div className="stat-value text-gradient">{analytics.totalSessions || analytics.sessions?.length || 0}</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Students</span>
              <div className="stat-value text-gradient">{analytics.studentStats?.length || 0}</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Proxy Flags</span>
              <div className="stat-value text-danger">{analytics.proxyFlags?.length || 0}</div>
            </div>
            <div className="stat-card">
              <span className="stat-label">Below 75%</span>
              <div className="stat-value text-warning">
                {analytics.studentStats?.filter(s => s.percentage < 75).length || 0}
              </div>
            </div>
          </div>

          {/* Student Attendance Table */}
          <div className="card mb-24">
            <h2 className="text-heading text-primary mb-16">Student Attendance</h2>
            {analytics.studentStats?.length === 0 ? (
              <p className="text-body text-text-muted">No data available.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>ID</th>
                      <th>Present</th>
                      <th>Total</th>
                      <th>Attendance %</th>
                      <th>Proxy Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.studentStats?.map(({ student, presentCount, proxyCount, totalSessions, percentage }) => (
                      <tr key={student._id}>
                        <td>
                          <div>
                            <p className="font-semibold text-primary">{student.name}</p>
                            <p className="text-label text-text-muted">{student.email}</p>
                          </div>
                        </td>
                        <td>{student.studentId || '—'}</td>
                        <td>{presentCount}</td>
                        <td>{totalSessions}</td>
                        <td>
                          <div className="flex items-center gap-8 min-w-[120px]">
                            <div className="progress-bar flex-1">
                              <div
                                className={`progress-fill ${getProgressColor(percentage)}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <span className={`text-label font-semibold ${getAttendanceColor(percentage)}`}>
                              {percentage.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td>
                          {proxyCount > 0 ? (
                            <span className="badge-danger">⚠ {proxyCount}</span>
                          ) : (
                            <span className="text-success text-label">✓ Clean</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Proxy Flags */}
          {analytics.proxyFlags?.length > 0 && (
            <div className="card border-l-4 border-danger">
              <h2 className="text-heading text-danger mb-16">⚠️ Proxy Attendance Flags</h2>
              <div className="flex flex-col gap-12">
                {analytics.proxyFlags.map((flag) => (
                  <div key={flag._id} className="p-12 bg-red-50 rounded-md border border-red-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-body font-semibold text-danger">
                          {flag.studentId?.name}
                          {flag.proxyFlag?.suspectedStudentId && (
                            <> ↔ {flag.proxyFlag.suspectedStudentId.name}</>
                          )}
                        </p>
                        <p className="text-label text-text-muted mt-2">
                          Device ID: {flag.proxyFlag?.suspectedDeviceId?.slice(0, 16)}...
                        </p>
                      </div>
                      <span className="badge-danger">Flagged</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
