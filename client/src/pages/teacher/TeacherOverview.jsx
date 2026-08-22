import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

const TeacherOverview = () => {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teacher/classrooms')
      .then(res => setClassrooms(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = classrooms.reduce((acc, c) => acc + c.enrolledStudents.length, 0);

  if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="page-subtitle">Here's a snapshot of your teaching activity.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-20 mb-32">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total Classrooms</span>
            <span className="text-[28px]">📚</span>
          </div>
          <div className="stat-value text-gradient">{classrooms.length}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total Students</span>
            <span className="text-[28px]">🎓</span>
          </div>
          <div className="stat-value text-gradient">{totalStudents}</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <span className="stat-label">Active Today</span>
            <span className="text-[28px]">✅</span>
          </div>
          <div className="stat-value text-gradient">{classrooms.length > 0 ? '1' : '0'}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-32">
        <h2 className="text-heading text-primary mb-16">Quick Actions</h2>
        <div className="flex flex-wrap gap-12">
          <Link to="/teacher/classrooms" id="quick-create-classroom" className="btn-primary">
            ➕ New Classroom
          </Link>
          <Link to="/teacher/sessions" id="quick-start-session" className="btn-secondary">
            🎯 Start Session
          </Link>
          <Link to="/teacher/analytics" id="quick-analytics" className="btn-secondary">
            📈 View Analytics
          </Link>
        </div>
      </div>

      {/* Classrooms List */}
      <h2 className="text-heading text-primary mb-16">Your Classrooms</h2>
      {classrooms.length === 0 ? (
        <div className="card text-center py-48">
          <p className="text-[40px] mb-12">📭</p>
          <p className="text-heading text-primary mb-8">No classrooms yet</p>
          <p className="text-body text-text-muted mb-20">Create your first classroom to get started.</p>
          <Link to="/teacher/classrooms" className="btn-primary">
            Create Classroom
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-20">
          {classrooms.map((cls) => (
            <div key={cls._id} className="card hover:shadow-card-hover transition-all duration-200 cursor-pointer group">
              <div className="flex items-start justify-between mb-12">
                <div>
                  <span className="badge-info mb-8 inline-block">{cls.courseCode}</span>
                  <h3 className="text-heading text-primary group-hover:text-accent transition-colors duration-150">
                    {cls.name}
                  </h3>
                </div>
                <span className="text-[24px]">📖</span>
              </div>
              <div className="flex items-center gap-16 text-label text-text-muted">
                <span>👥 {cls.enrolledStudents.length} students</span>
                <span>📅 {cls.schedule?.length || 0} classes/wk</span>
              </div>
              <div className="mt-16 flex gap-8">
                <Link
                  to={`/teacher/sessions?classroom=${cls._id}`}
                  id={`start-session-${cls._id}`}
                  className="btn-primary btn-sm flex-1 text-center"
                >
                  Start Session
                </Link>
                <Link
                  to={`/teacher/analytics?classroom=${cls._id}`}
                  id={`view-analytics-${cls._id}`}
                  className="btn-secondary btn-sm flex-1 text-center"
                >
                  Analytics
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherOverview;
