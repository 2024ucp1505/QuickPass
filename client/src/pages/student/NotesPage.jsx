import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

const NotesPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [notes, setNotes] = useState([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [editingNote, setEditingNote] = useState(null); // { _id, title, content } or null for new
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    api.get('/student/my-classrooms')
      .then(res => {
        setClassrooms(res.data);
        if (res.data.length > 0) setSelectedClassroomId(res.data[0]._id);
      })
      .finally(() => setLoadingClassrooms(false));
  }, []);

  useEffect(() => {
    if (!selectedClassroomId) return;
    setLoadingNotes(true);
    api.get(`/student/notes/${selectedClassroomId}`)
      .then(res => setNotes(res.data))
      .catch(() => toast.error('Failed to load notes'))
      .finally(() => setLoadingNotes(false));
  }, [selectedClassroomId]);

  const openNew = () => {
    setEditingNote({ title: '', content: '' });
    setPreview(false);
    setShowEditor(true);
  };

  const openEdit = (note) => {
    setEditingNote({ ...note });
    setPreview(false);
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!editingNote.title.trim()) {
      toast.error('Note title is required.');
      return;
    }
    setSaving(true);
    try {
      if (editingNote._id) {
        const res = await api.put(`/student/notes/${editingNote._id}`, {
          title: editingNote.title,
          content: editingNote.content,
        });
        setNotes(ns => ns.map(n => n._id === editingNote._id ? res.data : n));
        toast.success('Note updated!');
      } else {
        const res = await api.post(`/student/notes/${selectedClassroomId}`, {
          title: editingNote.title,
          content: editingNote.content,
        });
        setNotes(ns => [res.data, ...ns]);
        toast.success('Note created!');
      }
      setShowEditor(false);
      setEditingNote(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Delete this note?')) return;
    try {
      await api.delete(`/student/notes/${noteId}`);
      setNotes(ns => ns.filter(n => n._id !== noteId));
      toast.success('Note deleted.');
    } catch {
      toast.error('Delete failed.');
    }
  };

  if (loadingClassrooms) return <LoadingSpinner message="Loading notes..." />;

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">My Notes</h1>
          <p className="page-subtitle">Markdown-powered notes tied to each classroom.</p>
        </div>
        <button id="new-note-btn" onClick={openNew} className="btn-primary" disabled={!selectedClassroomId}>
          ➕ New Note
        </button>
      </div>

      {/* Classroom selector */}
      <div className="mb-24">
        <div className="flex gap-8 flex-wrap">
          {classrooms.map(cls => (
            <button
              key={cls._id}
              id={`cls-tab-${cls._id}`}
              onClick={() => setSelectedClassroomId(cls._id)}
              className={`px-16 py-8 rounded-md text-label font-semibold transition-all duration-150 ${
                selectedClassroomId === cls._id
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text-secondary border border-border hover:border-accent'
              }`}
            >
              {cls.courseCode}
            </button>
          ))}
        </div>
      </div>

      {loadingNotes && <LoadingSpinner message="Loading notes..." />}

      {!loadingNotes && notes.length === 0 && (
        <div className="card text-center py-48">
          <p className="text-[40px] mb-12">📝</p>
          <p className="text-heading mb-8">No notes yet</p>
          <p className="text-body text-text-muted mb-20">Start taking markdown notes for this course.</p>
          <button onClick={openNew} className="btn-primary">Create First Note</button>
        </div>
      )}

      {!loadingNotes && notes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-16">
          {notes.map((note) => (
            <div key={note._id} className="card cursor-pointer group">
              <div className="flex items-start justify-between mb-8">
                <h3 className="text-heading text-primary group-hover:text-accent transition-colors duration-150 truncate pr-8">
                  {note.title}
                </h3>
                <div className="flex gap-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <button id={`edit-note-${note._id}`} onClick={() => openEdit(note)} className="text-accent hover:underline text-label">Edit</button>
                  <button id={`delete-note-${note._id}`} onClick={() => handleDelete(note._id)} className="text-danger hover:underline text-label">Del</button>
                </div>
              </div>
              <p className="text-label text-text-muted mb-12">{formatDate(note.updatedAt)}</p>
              <div className="text-body text-text-secondary line-clamp-3 prose prose-sm max-w-none">
                <ReactMarkdown>{note.content || '*Empty note*'}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && editingNote && (
        <div className="modal-overlay" onClick={() => setShowEditor(false)}>
          <div
            className="bg-surface rounded-xl shadow-lg w-full max-w-2xl mx-16 animate-slide-up max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-24 border-b border-border flex items-center justify-between">
              <h2 className="text-heading text-primary">
                {editingNote._id ? 'Edit Note' : 'New Note'}
              </h2>
              <div className="flex items-center gap-8">
                <button
                  onClick={() => setPreview(v => !v)}
                  className={`btn-ghost btn-sm ${preview ? 'bg-accent-light' : ''}`}
                >
                  {preview ? '✏️ Edit' : '👁 Preview'}
                </button>
                <button onClick={() => setShowEditor(false)} className="text-text-muted hover:text-primary text-[20px]">✕</button>
              </div>
            </div>

            <div className="p-24 flex flex-col gap-16 overflow-y-auto flex-1">
              <div className="form-group">
                <label className="label">Title</label>
                <input
                  className="input"
                  placeholder="Note title..."
                  value={editingNote.title}
                  onChange={e => setEditingNote(n => ({ ...n, title: e.target.value }))}
                />
              </div>

              {preview ? (
                <div className="min-h-[300px] p-16 bg-background rounded-md border border-border prose prose-sm max-w-none overflow-y-auto">
                  <ReactMarkdown>{editingNote.content || '*Nothing to preview yet.*'}</ReactMarkdown>
                </div>
              ) : (
                <div className="form-group flex-1">
                  <label className="label">Content (Markdown supported)</label>
                  <textarea
                    id="note-content-area"
                    className="input resize-none font-mono text-[13px]"
                    style={{ minHeight: '300px' }}
                    placeholder="# Heading&#10;&#10;- Bullet point&#10;**Bold text**&#10;&#10;Start writing..."
                    value={editingNote.content}
                    onChange={e => setEditingNote(n => ({ ...n, content: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="p-24 border-t border-border flex gap-12">
              <button onClick={() => setShowEditor(false)} className="btn-secondary flex-1">Cancel</button>
              <button id="save-note-btn" onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotesPage;
