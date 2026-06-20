import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../services';
import { mockNotifications } from '../services/mockData';
import {
  LayoutDashboard, Building2, Bell, BookOpen, User,
  Users, Settings, LogOut, GraduationCap, ChevronRight,
} from 'lucide-react';
import Modal from './Modal';
import toast from 'react-hot-toast';

const isDemo = () => localStorage.getItem('demoMode') === 'true';

const studentNav = [
  { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/companies', label: 'Companies', icon: Building2 },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
  { to: '/student/experiences', label: 'Interview Experiences', icon: BookOpen },
  { to: '/student/profile', label: 'Profile', icon: User },
];

const coordinatorNav = [
  { to: '/coordinator/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/coordinator/companies', label: 'Manage Companies', icon: Building2 },
  { to: '/coordinator/notifications', label: 'Notifications', icon: Bell },
  { to: '/coordinator/experiences', label: 'Experience Library', icon: BookOpen },
  { to: '/coordinator/students', label: 'Student Directory', icon: Users },
];

export default function Sidebar({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navItems = role === 'coordinator' ? coordinatorNav : studentNav;
  const isStudent = role === 'student';

  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => {
      if (isDemo()) {
        const count = mockNotifications.filter(n => !n.is_read).length;
        return Promise.resolve({ unreadCount: count });
      }
      return notificationService.getUnreadCount().then(r => r.data);
    },
    enabled: isStudent,
    refetchInterval: isDemo() ? false : 15000,
  });

  const unreadCount = unreadData?.unreadCount ?? 0;

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await logout();
      toast.success('Successfully signed out.');
      navigate('/login');
    } catch {
      toast.error('Logout failed.');
    } finally {
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={18} color="#fff" />
            </div>
            <span className="sidebar-logo-text">PlacementHub</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, marginLeft: 42 }}>
            {role === 'coordinator' ? 'Coordinator Portal' : 'Student Portal'}
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Navigation</div>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Icon className="nav-icon" />
                {label === 'Notifications' && isStudent && unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    background: 'var(--danger)',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: 700,
                    borderRadius: '50%',
                    width: '15px',
                    height: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1.5px solid var(--bg-secondary)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <span style={{ flex: 1 }}>{label}</span>
              <ChevronRight size={14} style={{ opacity: 0.4 }} />
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-item" style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'none', color: 'var(--danger)' }}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Sign Out"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleConfirmLogout}>
              Sign Out
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to sign out of PlacementHub?
        </p>
      </Modal>
    </>
  );
}
