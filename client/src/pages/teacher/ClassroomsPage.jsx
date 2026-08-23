import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultScheduleEntry = () => ({ day: 'Monday', startTime: '09:00', endTime: '10:30' });

const ClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', courseCode: '', schedule: [defaultScheduleEntry()] });
  const [saving, setSaving] = useState(false);
  const [enrollModal, setEnrollModal] = useState(null);
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [notifying, setNotifying] = useState(null);

  const fetchClassrooms = () => {
    setLoading(true);
    api.get('/teacher/classrooms')
      .then(res => setClassrooms(res.data))
      .catch(() => toast.error('Failed to load classrooms'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClassrooms(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: '', courseCode: '', schedule: [defaultScheduleEntry()] });
    setShowModal(true);
  };

  const openEdit = (cls) => {
    setEditTarget(cls);
    setForm({ name: cls.name, courseCode: cls.courseCode, schedule: cls.schedule?.length ? cls.schedule : [defaultScheduleEntry()] });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        const res = await api.put(`/teacher/classrooms/${editTarget._id}`, form);
        setClassrooms(cs => cs.map(c => c._id === editTarget._id ? res.data : c));
        toast.success('Classroom updated!');
      } else {
        const res = await api.post('/teacher/classrooms', form);
        setClassrooms(cs => [res.data, ...cs]);
        toast.success('Classroom created!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this classroom? This cannot be undone.')) return;
    try {
      await api.delete(`/teacher/classrooms/${id}`);
      setClassrooms(cs => cs.filter(c => c._id !== id));
      toast.success('Classroom deleted.');
    } catch {
      toast.error('Delete failed.');
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!enrollEmail.trim()) return;
    setEnrolling(true);
    try {
      const res = await api.post(`/teacher/classrooms/${enrollModal._id}/enroll`, { email: enrollEmail });
      setClassrooms(cs => cs.map(c => c._id === enrollModal._id ? res.data : c));
      toast.success('Student enrolled!');
      setEnrollEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleRemoveStudent = async (classroomId, studentId) => {
    try {
      const res = await api.delete(`/teacher/classrooms/${classroomId}/enroll/${studentId}`);
      setClassrooms(cs => cs.map(c => c._id === classroomId ? res.data : c));
      toast.success('Student removed.');
    } catch {
      toast.error('Remove failed.');
    }
  };

  const handleNotify = async (classroomId) => {
    setNotifying(classroomId);
    try {
      const res = await api.post(`/teacher/classrooms/${classroomId}/notify-low-attendance`);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Notification failed.');
    } finally {
      setNotifying(null);
    }
  };

  const addScheduleEntry = () => {
    setForm(f => ({ ...f, schedule: [...f.schedule, defaultScheduleEntry()] }));
  };

  const updateScheduleEntry = (i, field, value) => {
    setForm(f => {
      const s = [...f.schedule];
      s[i] = { ...s[i], [field]: value };
      return { ...f, schedule: s };
    });
  };

  const removeScheduleEntry = (i) => {
    setForm(f => ({ ...f, schedule: f.schedule.filter((_, idx) => idx !== i) }));
  };

  if (loading) return <LoadingSpinner message="Loading classrooms..." />;

  return (
    <div className="animate-fade-in">
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-12">
        <div>
          <h1 className="page-title">Classrooms</h1>
          <p className="page-subtitle">Manage your courses and student enrollment.</p>
        </div>
        <button id="create-classroom-btn" onClick={openCreate} className="btn-primary self-start sm:self-auto">
          ➕ New Classroom
        </button>
      </div>

      {classrooms.length === 0 ? (
        <div className="card text-center py-48">
          <p className="text-[40px] mb-12">📭</p>
          <p className="text-heading mb-8">No classrooms yet</p>
          <button onClick={openCreate} className="btn-primary">Create your first classroom</button>
        </div>
      ) : (
        <div className="flex flex-col gap-16">
          {classrooms.map((cls) => (
            <div key={cls._id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-12 mb-4">
                    <span className="badge-info">{cls.courseCode}</span>
                    <span className="text-label text-text-muted">
                      {cls.enrolledStudents.length} student{cls.enrolledStudents.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <h3 className="text-heading text-primary">{cls.name}</h3>
                  {cls.schedule?.length > 0 && (
                    <div className="flex flex-wrap gap-6 mt-8">
                      {cls.schedule.map((s, i) => (
                        <span key={i} className="badge-neutral">
                          {s.day} {s.startTime}–{s.endTime}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-6 ml-0 sm:ml-12 shrink-0 mt-8 sm:mt-0">
                  <button
                    id={`notify-btn-${cls._id}`}
                    onClick={() => handleNotify(cls._id)}
                    disabled={notifying === cls._id}
                    className="btn-ghost btn-sm"
                    title="Email students below 75%"
                  >
                    {notifying === cls._id ? '⏳' : '📧'} Notify
                  </button>
                  <button
                    id={`enroll-btn-${cls._id}`}
                    onClick={() => { setEnrollModal(cls); setEnrollEmail(''); }}
                    className="btn-secondary btn-sm"
                  >
                    👥 Enroll
                  </button>
                  <button id={`edit-btn-${cls._id}`} onClick={() => openEdit(cls)} className="btn-secondary btn-sm">✏️</button>
                  <button id={`delete-btn-${cls._id}`} onClick={() => handleDelete(cls._id)} className="btn-danger btn-sm">🗑️</button>
                  <button
                    onClick={() => setExpandedId(expandedId === cls._id ? null : cls._id)}
                    className="btn-ghost btn-sm"
                  >
                    {expandedId === cls._id ? '▲' : '▼'}
                  </button>
                </div>
              </div>

              {/* Student list */}
              {expandedId === cls._id && (
                <div className="mt-16 pt-16 border-t border-border animate-fade-in">
                  <p className="text-label text-text-muted font-semibold mb-12">ENROLLED STUDENTS</p>
                  {cls.enrolledStudents.length === 0 ? (
                    <p className="text-body text-text-muted">No students enrolled yet.</p>
                  ) : (
                    <div className="flex flex-col gap-8">
                      {cls.enrolledStudents.map((s) => (
                        <div key={s._id} className="flex items-center justify-between p-12 bg-background rounded-md">
                          <div>
                            <p className="text-body font-medium text-primary">{s.name}</p>
                            <p className="text-label text-text-muted">{s.email} {s.studentId ? `• ${s.studentId}` : ''}</p>
                          </div>
                          <button
                            id={`remove-student-${s._id}`}
                            onClick={() => handleRemoveStudent(cls._id, s._id)}
                            className="text-label text-danger hover:underline font-medium"
                          >
                            Remove
                          </button>
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-heading text-primary mb-24">
              {editTarget ? 'Edit Classroom' : 'New Classroom'}
            </h2>
            <form onSubmit={handleSave} className="flex flex-col gap-16">
              <div className="form-group">
                <label className="label">Course Name</label>
                <input className="input" placeholder="e.g. Introduction to CS" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="label">Course Code</label>
                <input className="input" placeholder="e.g. CS101" value={form.courseCode} onChange={e => setForm(f => ({ ...f, courseCode: e.target.value }))} required />
              </div>
              <div>
                <div className="flex items-center justify-between mb-8">
                  <label className="label mb-0">Schedule</label>
                  <button type="button" onClick={addScheduleEntry} className="btn-ghost btn-sm">+ Add</button>
                </div>
                {form.schedule.map((entry, i) => (
                  <div key={i} className="flex gap-8 mb-8 items-center">
                    <select className="input flex-1" value={entry.day} onChange={e => updateScheduleEntry(i, 'day', e.target.value)}>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <input type="time" className="input w-[100px]" value={entry.startTime} onChange={e => updateScheduleEntry(i, 'startTime', e.target.value)} />
                    <input type="time" className="input w-[100px]" value={entry.endTime} onChange={e => updateScheduleEntry(i, 'endTime', e.target.value)} />
                    {form.schedule.length > 1 && (
                      <button type="button" onClick={() => removeScheduleEntry(i)} className="text-danger text-[18px]">✕</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-12 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editTarget ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {enrollModal && (
        <div className="modal-overlay" onClick={() => setEnrollModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="text-heading text-primary mb-8">Enroll Student</h2>
            <p className="text-body text-text-muted mb-24">Add a student to <strong>{enrollModal.name}</strong> by their email.</p>
            <form onSubmit={handleEnroll} className="flex flex-col gap-16">
              <div className="form-group">
                <label className="label">Student Email</label>
                <input id="enroll-email-input" className="input" type="email" placeholder="student@example.com" value={enrollEmail} onChange={e => setEnrollEmail(e.target.value)} required />
              </div>
              <div className="flex gap-12">
                <button type="button" onClick={() => setEnrollModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={enrolling} className="btn-primary flex-1">
                  {enrolling ? 'Enrolling...' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomsPage;
