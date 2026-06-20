import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services';
import CoordinatorLayout from '../../layouts/CoordinatorLayout';
import Modal from '../../components/Modal';
import Pagination from '../../components/Pagination';
import SkeletonLoader from '../../components/SkeletonLoader';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const EMPTY = { title: '', message: '', priority: 'medium' };

export default function ManageNotifications() {
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-admin', page],
    queryFn: () => notificationService.getAll({ page, limit: 10 }).then(r => r.data),
  });

  const createMut = useMutation({
    mutationFn: () => notificationService.create(form),
    onSuccess: () => { qc.invalidateQueries(['notifications-admin']); setModal(null); toast.success('Notification created!'); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const updateMut = useMutation({
    mutationFn: () => notificationService.update(modal.data.id, form),
    onSuccess: () => { qc.invalidateQueries(['notifications-admin']); setModal(null); toast.success('Updated!'); },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: () => notificationService.delete(modal.data.id),
    onSuccess: () => { qc.invalidateQueries(['notifications-admin']); setModal(null); toast.success('Deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  const openAdd = () => { setForm(EMPTY); setModal({ mode: 'add' }); };
  const openEdit = (n) => { setForm({ title: n.title, message: n.message, priority: n.priority }); setModal({ mode: 'edit', data: n }); };

  return (
    <CoordinatorLayout title="Manage Notifications">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> New Notification</button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Title</th><th>Message</th><th>Priority</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5}><SkeletonLoader rows={5} cols={5} /></td></tr>
            ) : (data?.data || []).map(n => (
              <tr key={n.id}>
                <td style={{ fontWeight: 500 }}>{n.title}</td>
                <td style={{ color: 'var(--text-secondary)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.message}</td>
                <td><span className={`badge priority-${n.priority}`}>{n.priority}</span></td>
                <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{format(new Date(n.created_at), 'MMM dd, HH:mm')}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(n)}><Edit2 size={13} /></button>
                    <button className="btn btn-danger btn-sm" onClick={() => setModal({ mode: 'delete', data: n })}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />

      <Modal
        isOpen={modal?.mode === 'add' || modal?.mode === 'edit'}
        onClose={() => setModal(null)}
        title={modal?.mode === 'add' ? 'New Notification' : 'Edit Notification'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => modal?.mode === 'add' ? createMut.mutate() : updateMut.mutate()} disabled={createMut.isLoading || updateMut.isLoading}>
              {modal?.mode === 'add' ? 'Create' : 'Save'}
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="input-label">Title *</label>
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Notification title" />
          </div>
          <div>
            <label className="input-label">Priority</label>
            <select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
          </div>
          <div>
            <label className="input-label">Message *</label>
            <textarea className="input" rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Notification message..." style={{ resize: 'vertical' }} />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={modal?.mode === 'delete'}
        onClose={() => setModal(null)}
        title="Delete Notification"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={() => deleteMut.mutate()} disabled={deleteMut.isLoading}>Delete</button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)' }}>Delete notification "<strong style={{ color: 'var(--text-primary)' }}>{modal?.data?.title}</strong>"?</p>
      </Modal>
    </CoordinatorLayout>
  );
}
