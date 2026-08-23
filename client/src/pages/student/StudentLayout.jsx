import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/dashboard/student', icon: '📊', label: 'Overview', end: true },
  { to: '/dashboard/student/scan', icon: '📷', label: 'Scan QR' },
  { to: '/dashboard/student/attendance', icon: '📅', label: 'My Attendance' },
  { to: '/dashboard/student/notes', icon: '📝', label: 'Notes' },
  { to: '/dashboard/student/schedule', icon: '🗓️', label: 'Schedule' },
];

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background">
      <aside
        className={`${sidebarOpen ? 'w-full md:w-[240px]' : 'w-full md:w-[64px]'} bg-primary text-on-primary flex flex-col transition-all duration-300 shrink-0`}
      >
        <div className="p-20 flex items-center gap-12 border-b border-white border-opacity-10">
          <span className="text-[24px] shrink-0">⚡</span>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-bold text-[16px] leading-none">QuickPass</p>
              <p className="text-[11px] text-white text-opacity-60 mt-2">Student Portal</p>
            </div>
          )}
        </div>

        <nav className={`flex-1 p-12 flex-col gap-4 ${!sidebarOpen ? 'hidden md:flex' : 'flex'}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-12 px-12 py-10 rounded-md text-body transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-accent text-white font-semibold'
                    : 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-10 hover:text-white'
                }`
              }
            >
              <span className="text-[18px] shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={`p-12 border-t border-white border-opacity-10 ${!sidebarOpen ? 'hidden md:block' : 'block'}`}>
          {sidebarOpen && (
            <div className="mb-8 px-12 py-8 rounded-md bg-white bg-opacity-5">
              <p className="text-[13px] font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-white text-opacity-50 truncate">{user?.studentId || user?.email}</p>
            </div>
          )}
          <button
            id="student-logout-btn"
            onClick={logout}
            className="flex items-center gap-12 w-full px-12 py-10 rounded-md text-body text-white text-opacity-70 hover:bg-red-600 hover:text-white transition-all"
          >
            <span className="text-[18px] shrink-0">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>

        <button
          id="student-sidebar-toggle"
          onClick={() => setSidebarOpen(v => !v)}
          className="p-12 text-white text-opacity-40 hover:text-white transition-colors flex items-center justify-center border-t border-white border-opacity-5"
        >
          <span className="text-[14px]">{sidebarOpen ? '◀' : '▶'}</span>
        </button>
      </aside>

      <main className="flex-1 overflow-y-auto p-16 md:p-32 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
