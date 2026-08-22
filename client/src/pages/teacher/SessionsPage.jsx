import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import api from '../../api/axios';
import { initSocket } from '../../api/socket';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatTime } from '../../utils/helpers';

const SessionsPage = () => {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(searchParams.get('classroom') || '');
  const [activeSession, setActiveSession] = useState(null);
  const [qrDataURL, setQrDataURL] = useState('');
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [proxyFlags, setProxyFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const socketRef = useRef(null);

  // Load classrooms
  useEffect(() => {
    api.get('/teacher/classrooms')
      .then(res => {
        setClassrooms(res.data);
        if (!selectedClassroom && res.data.length > 0) {
          setSelectedClassroom(res.data[0]._id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Generate QR image from encrypted payload
  const renderQR = useCallback(async (payload) => {
    try {
      const url = await QRCode.toDataURL(payload, {
        width: 280,
        margin: 2,
        color: { dark: '#0d0f12', light: '#ffffff' },
        errorCorrectionLevel: 'M',
      });
      setQrDataURL(url);
    } catch (err) {
      console.error('QR render error:', err);
    }
  }, []);

  // Socket setup for active session
  useEffect(() => {
    if (!activeSession) return;

    const socket = initSocket(token);
    socketRef.current = socket;

    socket.emit('join_session', { sessionId: activeSession._id });

    socket.on('qr_refresh', ({ payload }) => {
      renderQR(payload);
    });

    socket.on('attendance_marked', (log) => {
      setAttendanceLogs(prev => {
        const exists = prev.find(l => l._id === log._id);
        if (exists) return prev.map(l => l._id === log._id ? log : l);
        return [log, ...prev];
      });
      toast.success(`✅ ${log.studentId?.name || 'A student'} marked attendance`);
    });

    socket.on('attendance_cancelled', ({ studentId }) => {
      setAttendanceLogs(prev =>
        prev.map(l => String(l.studentId?._id) === String(studentId)
          ? { ...l, status: 'cancelled' }
          : l
        )
      );
    });

    socket.on('proxy_flagged', (data) => {
      setProxyFlags(prev => [data, ...prev]);
      toast.error(`⚠️ Proxy detected! Device conflict flagged.`, { duration: 6000 });
    });

    return () => {
      socket.emit('leave_session', { sessionId: activeSession._id });
      socket.off('qr_refresh');
      socket.off('attendance_marked');
      socket.off('attendance_cancelled');
      socket.off('proxy_flagged');
    };
  }, [activeSession, token, renderQR]);

  const handleStartSession = async () => {
    if (!selectedClassroom) {
      toast.error('Please select a classroom first.');
      return;
    }
    setStarting(true);
    try {
      const res = await api.post(`/teacher/classrooms/${selectedClassroom}/sessions/start`);
      setActiveSession(res.data);
      setAttendanceLogs([]);
      setProxyFlags([]);
      toast.success('Session started!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start session.');
    } finally {
      setStarting(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession) return;
    setEnding(true);
    try {
      await api.post(`/teacher/sessions/${activeSession._id}/end`);
      socketRef.current?.emit('leave_session', { sessionId: activeSession._id });
      setActiveSession(null);
      setQrDataURL('');
      toast.success('Session ended.');
    } catch (err) {
      toast.error('Failed to end session.');
    } finally {
      setEnding(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading sessions..." />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Session Management</h1>
        <p className="page-subtitle">Start a session to generate QR codes and track live attendance.</p>
      </div>

      {/* Session Controls */}
      {!activeSession ? (
        <div className="card max-w-lg mb-32">
          <h2 className="text-heading text-primary mb-20">Start New Session</h2>
          <div className="form-group mb-16">
            <label className="label">Select Classroom</label>
            <select
              id="classroom-select"
              className="input"
              value={selectedClassroom}
              onChange={e => setSelectedClassroom(e.target.value)}
            >
              <option value="">-- Choose a classroom --</option>
              {classrooms.map(cls => (
                <option key={cls._id} value={cls._id}>
                  [{cls.courseCode}] {cls.name}
                </option>
              ))}
            </select>
          </div>
          <button
            id="start-session-btn"
            onClick={handleStartSession}
            disabled={starting || !selectedClassroom}
            className="btn-primary w-full"
          >
            {starting ? '⏳ Starting...' : '🚀 Start Session'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-24 mb-32">
          {/* QR Display */}
          <div className="card">
            <div className="flex items-center justify-between mb-20">
              <div>
                <h2 className="text-heading text-primary">Live QR Code</h2>
                <p className="text-body text-text-muted">Refreshes every 10 seconds • AES-256 encrypted</p>
              </div>
              <span className="badge-success">● LIVE</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="qr-container mb-16">
                <div className="qr-pulse-ring" />
                {qrDataURL ? (
                  <img src={qrDataURL} alt="QR Code" className="w-[240px] h-[240px] relative z-10" />
                ) : (
                  <div className="w-[240px] h-[240px] flex items-center justify-center">
                    <LoadingSpinner message="Generating QR..." />
                  </div>
                )}
              </div>
              <p className="text-label text-text-muted mb-20">
                Session started at {formatTime(activeSession.createdAt)}
              </p>
              <button
                id="end-session-btn"
                onClick={handleEndSession}
                disabled={ending}
                className="btn-danger w-full"
              >
                {ending ? 'Ending...' : '⏹ End Session'}
              </button>
            </div>
          </div>

          {/* Live Attendance Feed */}
          <div className="card">
            <div className="flex items-center justify-between mb-16">
              <h2 className="text-heading text-primary">Live Attendance</h2>
              <span className="badge-info">{attendanceLogs.filter(l => l.status === 'present').length} present</span>
            </div>

            {/* Proxy Flags */}
            {proxyFlags.length > 0 && (
              <div className="mb-16 p-12 bg-red-50 border border-danger border-opacity-30 rounded-md">
                <p className="text-label font-semibold text-danger mb-8">⚠️ PROXY ALERTS</p>
                {proxyFlags.map((flag, i) => (
                  <p key={i} className="text-label text-danger">
                    Device conflict detected for session
                  </p>
                ))}
              </div>
            )}

            {attendanceLogs.length === 0 ? (
              <div className="text-center py-32 text-text-muted">
                <p className="text-[32px] mb-8">⏳</p>
                <p className="text-body">Waiting for students to scan...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-8 max-h-[400px] overflow-y-auto pr-4">
                {attendanceLogs.map((log) => (
                  <div
                    key={log._id}
                    className={`flex items-center justify-between p-12 rounded-md border animate-fade-in ${
                      log.status === 'present' ? 'bg-green-50 border-green-200' :
                      log.status === 'flagged_proxy' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-border'
                    }`}
                  >
                    <div>
                      <p className="text-body font-semibold text-primary">
                        {log.studentId?.name || 'Unknown Student'}
                      </p>
                      <p className="text-label text-text-muted">
                        {log.studentId?.email} • {formatTime(log.timestamp)}
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
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
