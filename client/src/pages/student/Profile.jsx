import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, companyService } from '../../services';
import StudentLayout from '../../layouts/StudentLayout';
import { User, Mail, Hash, BookOpen, Star, Edit2, Save, X, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile().then(r => r.data.data),
    onSuccess: (data) => setForm({ name: data.name, branch: data.branch, cgpa: data.cgpa }),
  });

  const { data: companies } = useQuery({
    queryKey: ['companies-all'],
    queryFn: () => companyService.getAll({ limit: 100 }).then(r => r.data.data),
  });

  const update = useMutation({
    mutationFn: () => userService.updateProfile(form),
    onSuccess: () => {
      qc.invalidateQueries(['profile']);
      setEditing(false);
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const eligibleCompanies = companies?.filter(c => {
    if (!profile || !profile.cgpa || !c.eligibility_cgpa) return false;
    return parseFloat(profile.cgpa) >= parseFloat(c.eligibility_cgpa);
  }) || [];

  if (isLoading) return (
    <StudentLayout title="Profile">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 700 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    </StudentLayout>
  );

  return (
    <StudentLayout title="My Profile">
      <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff' }}>
                {profile?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{profile?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{profile?.role}</div>
              </div>
            </div>
            {!editing ? (
              <button className="btn btn-secondary btn-sm" onClick={() => { setForm({ name: profile.name, branch: profile.branch, cgpa: profile.cgpa }); setEditing(true); }}>
                <Edit2 size={14} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}><X size={14} /> Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={() => update.mutate()} disabled={update.isLoading}><Save size={14} /> Save</button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { icon: User, label: 'Full Name', key: 'name', editable: true },
              { icon: Hash, label: 'Roll Number', value: profile?.roll_number, editable: false },
              { icon: Mail, label: 'Email', value: profile?.email, editable: false },
              { icon: BookOpen, label: 'Branch', key: 'branch', editable: true, type: 'select' },
            ].map(({ icon: Icon, label, key, value, editable, type }) => (
              <div key={label} style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Icon size={14} color="var(--accent)" />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
                </div>
                {editing && editable ? (
                  type === 'select' ? (
                    <select className="input" style={{ padding: '6px 10px', fontSize: 14 }} value={form?.[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })}>
                      {['CSE','ECE','EEE','ME','CE','IT','AIDS','AIML','Other'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  ) : (
                    <input className="input" style={{ padding: '6px 10px', fontSize: 14 }} value={form?.[key] || ''} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                  )
                ) : (
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{value || profile?.[key] || '—'}</div>
                )}
              </div>
            ))}

            {/* CGPA */}
            <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Star size={14} color="var(--warning)" />
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>CGPA</span>
              </div>
              {editing ? (
                <input className="input" type="number" step="0.01" min="0" max="10" style={{ padding: '6px 10px', fontSize: 14 }} value={form?.cgpa || ''} onChange={e => setForm({ ...form, cgpa: e.target.value })} />
              ) : (
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--accent)' }}>{profile?.cgpa || '—'}</div>
              )}
            </div>
          </div>
        </div>

        {/* Eligibility Checker */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Eligibility Checker ({eligibleCompanies.length} companies)</h3>
          {companies?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No companies available</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
              {(companies || []).map(company => {
                const eligible = profile?.cgpa && company.eligibility_cgpa && parseFloat(profile.cgpa) >= parseFloat(company.eligibility_cgpa);
                return (
                  <div key={company.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{company.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Min CGPA: {company.eligibility_cgpa}</div>
                    </div>
                    {eligible ? (
                      <span className="badge badge-success"><CheckCircle size={11} /> Eligible</span>
                    ) : (
                      <span className="badge badge-danger"><XCircle size={11} /> Not Eligible</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}
