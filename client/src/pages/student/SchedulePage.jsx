import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SchedulePage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('week'); // 'week' | 'list'

  useEffect(() => {
    api.get('/student/schedule')
      .then(res => setClassrooms(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading schedule..." />;

  const today = DAYS_ORDER[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

  // Group by day
  const byDay = DAYS_ORDER.reduce((acc, day) => {
    acc[day] = [];
    classrooms.forEach(cls => {
      cls.schedule?.forEach(s => {
        if (s.day === day) acc[day].push({ ...s, classroom: cls });
      });
    });
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Class Schedule</h1>
          <p className="page-subtitle">Your weekly timetable across all enrolled courses.</p>
        </div>
        <div className="flex gap-8">
          {['week', 'list'].map(v => (
            <button
              key={v}
              id={`view-${v}`}
              onClick={() => setView(v)}
              className={`btn-sm ${view === v ? 'btn-primary' : 'btn-secondary'}`}
            >
              {v === 'week' ? '📅 Week' : '📋 List'}
            </button>
          ))}
        </div>
      </div>

      {classrooms.length === 0 ? (
        <div className="card text-center py-48">
          <p className="text-[40px] mb-12">📭</p>
          <p className="text-heading mb-8">No classes scheduled</p>
          <p className="text-body text-text-muted">Ask your teacher to enroll you in a classroom.</p>
        </div>
      ) : view === 'week' ? (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-12">
          {DAYS_ORDER.map(day => (
            <div key={day} className={`rounded-lg overflow-hidden border ${day === today ? 'border-accent shadow-card' : 'border-border'}`}>
              <div className={`px-12 py-8 text-center ${day === today ? 'bg-accent text-white' : 'bg-background'}`}>
                <p className={`text-label font-semibold ${day === today ? 'text-white' : 'text-text-muted'}`}>
                  {day.slice(0, 3).toUpperCase()}
                </p>
                {day === today && <span className="text-[10px] text-white text-opacity-80">TODAY</span>}
              </div>
              <div className="bg-surface p-8 flex flex-col gap-6 min-h-[120px]">
                {byDay[day].length === 0 ? (
                  <p className="text-[11px] text-text-muted text-center mt-12">Free</p>
                ) : (
                  byDay[day]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((s, i) => (
                      <div key={i} className="p-8 bg-accent-light rounded-sm border-l-2 border-accent">
                        <p className="text-[11px] font-bold text-accent truncate">{s.classroom.courseCode}</p>
                        <p className="text-[10px] text-text-muted">{s.startTime}–{s.endTime}</p>
                      </div>
                    ))
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {DAYS_ORDER.filter(day => byDay[day].length > 0).map(day => (
            <div key={day} className={`card ${day === today ? 'shadow-card border-l-4 border-accent' : ''}`}>
              <div className="flex items-center gap-12 mb-12">
                <h3 className={`text-heading ${day === today ? 'text-accent' : 'text-primary'}`}>{day}</h3>
                {day === today && <span className="badge-info">Today</span>}
              </div>
              <div className="flex flex-col gap-8">
                {byDay[day]
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((s, i) => (
                    <div key={i} className="flex items-center gap-16 p-12 bg-background rounded-md">
                      <div className="text-center min-w-[80px]">
                        <p className="text-label font-bold text-accent">{s.startTime}</p>
                        <p className="text-label text-text-muted">{s.endTime}</p>
                      </div>
                      <div className="w-px h-10 bg-border" />
                      <div>
                        <p className="text-body font-semibold text-primary">{s.classroom.name}</p>
                        <p className="text-label text-text-muted">
                          {s.classroom.courseCode} • {s.classroom.teacherId?.name}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-24 card-flat">
        <p className="text-label font-semibold text-text-muted mb-12">ENROLLED COURSES</p>
        <div className="flex flex-wrap gap-8">
          {classrooms.map(cls => (
            <div key={cls._id} className="flex items-center gap-8 px-12 py-6 bg-background rounded-md">
              <div className="w-8 h-8 rounded-full bg-accent" />
              <span className="text-label text-primary font-medium">{cls.courseCode}</span>
              <span className="text-label text-text-muted">{cls.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
