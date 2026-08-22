import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    studentId: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      if (form.role !== 'student') delete payload.studentId;
      const user = await register(payload);
      toast.success(`Account created! Welcome, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-16">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-40">
          <div className="inline-flex items-center justify-center w-64 h-64 bg-primary rounded-xl mb-16 shadow-md">
            <span className="text-white text-[28px] font-bold">⚡</span>
          </div>
          <h1 className="text-display text-primary">QuickPass</h1>
          <p className="text-body text-text-muted mt-4">Create your account</p>
        </div>

        <div className="card shadow-card">
          <h2 className="text-heading text-primary mb-24">Get started</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-16">
            <div className="form-group">
              <label htmlFor="name" className="label">Full Name</label>
              <input id="name" name="name" type="text" className="input" placeholder="Jane Smith" value={form.name} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email" className="label">Email Address</label>
              <input id="reg-email" name="email" type="email" className="input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password" className="label">Password</label>
              <input id="reg-password" name="password" type="password" className="input" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="label">I am a...</label>
              <div className="flex gap-8">
                {['student', 'teacher'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    id={`role-${r}`}
                    onClick={() => setForm((f) => ({ ...f, role: r }))}
                    className={`flex-1 py-10 rounded-md text-body font-semibold border transition-all duration-150 ${
                      form.role === r
                        ? 'bg-accent text-white border-accent'
                        : 'bg-surface text-text-secondary border-border hover:border-accent'
                    }`}
                  >
                    {r === 'student' ? '🎓 Student' : '👩‍🏫 Teacher'}
                  </button>
                ))}
              </div>
            </div>

            {form.role === 'student' && (
              <div className="form-group animate-fade-in">
                <label htmlFor="studentId" className="label">Student ID (optional)</label>
                <input id="studentId" name="studentId" type="text" className="input" placeholder="e.g. STU001" value={form.studentId} onChange={handleChange} />
              </div>
            )}

            <button
              id="register-submit"
              type="submit"
              className="btn-primary btn-lg w-full mt-8"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-8">
                  <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-20 pt-20 border-t border-border text-center">
            <p className="text-body text-text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-accent font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
