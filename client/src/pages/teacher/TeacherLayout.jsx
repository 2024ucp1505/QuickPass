import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard/teacher', icon: '📊', label: 'Overview', end: true },
  { to: '/dashboard/teacher/classrooms', icon: '📚', label: 'Classrooms' },
  { to: '/dashboard/teacher/sessions', icon: '🎯', label: 'Sessions' },
  { to: '/dashboard/teacher/analytics', icon: '📈', label: 'Analytics' },
];

const TeacherLayout = () => {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-12 px-12 py-10 rounded-md text-body transition-all duration-150 cursor-pointer ${
      isActive
        ? 'bg-accent text-white font-semibold'
        : 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-10 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen bg-background">

      {/* ─── Mobile overlay backdrop ───────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar ───────────────────────────────────────────────────── */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-40
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          ${sidebarCollapsed ? 'md:w-[64px]' : 'md:w-[240px]'}
          w-[240px]
          bg-primary text-on-primary flex flex-col
          transition-transform md:transition-all duration-300 shrink-0
        `}
      >
        {/* Logo */}
        <div className="p-20 flex items-center gap-12 border-b border-white border-opacity-10">
          <span className="text-[24px] shrink-0">⚡</span>
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="font-bold text-[16px] leading-none">QuickPass</p>
              <p className="text-[11px] text-white text-opacity-60 mt-2">Teacher Portal</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-12 flex flex-col gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={navLinkClass}
              onClick={() => setMobileOpen(false)}
            >
              <span className="text-[18px] shrink-0">{item.icon}</span>
              {!sidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="p-12 border-t border-white border-opacity-10">
          {!sidebarCollapsed && (
            <div className="mb-8 px-12 py-8 rounded-md bg-white bg-opacity-5">
              <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-white text-opacity-50 truncate">{user?.email}</p>
            </div>
          )}
          <button
            id="logout-btn"
            onClick={logout}
            className="flex items-center gap-12 w-full px-12 py-10 rounded-md text-body text-white text-opacity-70 hover:bg-red-600 hover:text-white transition-all duration-150"
          >
            <span className="text-[18px] shrink-0">🚪</span>
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle — desktop only */}
        <button
          id="sidebar-toggle"
          onClick={() => setSidebarCollapsed((v) => !v)}
          className="hidden md:flex p-12 text-white text-opacity-40 hover:text-white transition-colors duration-150 items-center justify-center border-t border-white border-opacity-5"
        >
          <span className="text-[14px]">{sidebarCollapsed ? '▶' : '◀'}</span>
        </button>
      </aside>

      {/* ─── Main content ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 bg-primary flex items-center gap-12 px-16 py-12 border-b border-white border-opacity-10">
          <button
            id="mobile-hamburger-teacher"
            onClick={() => setMobileOpen(true)}
            className="text-white text-[22px] leading-none"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="text-white font-bold text-[16px]">⚡ QuickPass</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
