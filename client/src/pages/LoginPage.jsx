import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(user.role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-16">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-40">
          <div className="inline-flex items-center justify-center w-64 h-64 bg-primary rounded-xl mb-16 shadow-md">
            <span className="text-white text-[28px] font-bold">⚡</span>
          </div>
          <h1 className="text-display text-primary">QuickPass</h1>
          <p className="text-body text-text-muted mt-4">
            Secure Attendance Management Platform
          </p>
        </div>

        <div className="card shadow-card">
          <h2 className="text-heading text-primary mb-24">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-16">
            <div className="form-group">
              <label htmlFor="email" className="label">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-primary btn-lg w-full mt-8"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-8">
                  <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-20 pt-20 border-t border-border text-center">
            <p className="text-body text-text-muted">
              Don't have an account?{' '}
              <Link to="/register" className="text-accent font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Demo credentials hint */}
        <div className="mt-16 p-16 bg-accent-light rounded-lg border border-accent border-opacity-20">
          <p className="text-label text-accent font-semibold mb-8">🎯 Demo Credentials</p>
          <div className="text-label text-text-secondary space-y-4">
            <p><strong>Teacher:</strong> teacher@quickpass.dev / password123</p>
            <p><strong>Student:</strong> alex@student.dev / password123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
