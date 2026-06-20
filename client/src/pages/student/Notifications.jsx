import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services';
import { mockNotifications } from '../../services/mockData';
import StudentLayout from '../../layouts/StudentLayout';
import Pagination from '../../components/Pagination';
import { Bell, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const isDemo = () => localStorage.getItem('demoMode') === 'true';

export default function Notifications() {
  const [page, setPage] = useState(1);
  const [readIds, setReadIds] = useState([]);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: isDemo()
      ? () => Promise.resolve({ data: mockNotifications, pagination: { total: mockNotifications.length, totalPages: 1 } })
      : () => notificationService.getAll({ page, limit: 10 }).then(r => r.data),
  });

  const markRead = (id) => {
    if (isDemo()) { setReadIds(prev => [...prev, id]); toast.success('Marked as read'); return; }
    notificationService.markRead(id).then(() => {
      qc.invalidateQueries(['notifications']);
      qc.invalidateQueries(['unreadCount']);
      qc.invalidateQueries(['student-dashboard']);
    });
  };

  const markAllRead = () => {
    if (isDemo()) { setReadIds(mockNotifications.map(n => n.id)); toast.success('All marked as read'); return; }
    notificationService.markAllRead().then(() => {
      qc.invalidateQueries(['notifications']);
      qc.invalidateQueries(['unreadCount']);
      qc.invalidateQueries(['student-dashboard']);
      toast.success('All marked as read');
    });
  };

  const notifications = (data?.data || []).map(n => ({
    ...n,
    is_read: n.is_read || readIds.includes(n.id),
  }));

  return (
    <StudentLayout title="Notifications">
      <div style={{ maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontWeight: 600 }}>Notifications</h2>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Stay updated with placement activities</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={markAllRead}>
            <CheckCheck size={14} /> Mark all read
          </button>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state"><Bell className="empty-state-icon" /><div className="empty-state-title">No notifications</div></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map(n => (
              <div key={n.id} className="glass-card" style={{ padding: 18, cursor: !n.is_read ? 'pointer' : 'default', borderLeft: !n.is_read ? '3px solid var(--accent)' : '3px solid transparent', background: !n.is_read ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-card)' }} onClick={() => !n.is_read && markRead(n.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: !n.is_read ? 700 : 500, fontSize: 14 }}>{n.title}</span>
                      {!n.is_read && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span className={`badge ${n.priority === 'high' ? 'badge-danger' : n.priority === 'low' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: 11 }}>{n.priority}</span>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{format(new Date(n.created_at), 'MMM dd, HH:mm')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />
      </div>
    </StudentLayout>
  );
}
