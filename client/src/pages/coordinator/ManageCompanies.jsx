import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { companyService } from '../../services';
import { mockCompanies, mockPagination } from '../../services/mockData';
import CoordinatorLayout from '../../layouts/CoordinatorLayout';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import Modal from '../../components/Modal';
import SkeletonLoader from '../../components/SkeletonLoader';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import CompanyLogo from '../../components/CompanyLogo';

const isDemo = () => localStorage.getItem('demoMode') === 'true';

const PREDEFINED_LOGOS = [
  { label: 'Google (google.svg)', value: 'google.svg' },
  { label: 'Microsoft (microsoft.svg)', value: 'microsoft.svg' },
  { label: 'Amazon (amazon.svg)', value: 'amazon.svg' },
  { label: 'D. E. Shaw (deshaw.svg)', value: 'deshaw.svg' },
  { label: 'Cisco (cisco.svg)', value: 'cisco.svg' },
  { label: 'Infosys (infosys.svg)', value: 'infosys.svg' },
  { label: 'TCS (tcs.svg)', value: 'tcs.svg' },
  { label: 'Wipro (wipro.svg)', value: 'wipro.svg' },
  { label: 'Accenture (accenture.svg)', value: 'accenture.svg' },
  { label: 'Deloitte (deloitte.svg)', value: 'deloitte.svg' },
  { label: 'Cognizant (cognizant.svg)', value: 'cognizant.svg' },
  { label: 'Razorpay (razorpay.svg)', value: 'razorpay.svg' },
  { label: 'Swiggy (swiggy.svg)', value: 'swiggy.svg' },
  { label: 'Zomato (zomato.svg)', value: 'zomato.svg' },
];

// Parse date-only strings (YYYY-MM-DD) as LOCAL midnight to avoid UTC-offset issues
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const s = typeof dateStr === 'string' ? dateStr.split('T')[0] : String(dateStr);
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
const EMPTY_FORM = { name: '', logoUrl: '', roleOffered: '', packageLpa: '', eligibilityCgpa: '', visitDate: '', applicationDeadline: '', description: '', hiringProcess: '', applicationLink: '' };

export default function ManageCompanies() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [localCompanies, setLocalCompanies] = useState(mockCompanies);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['companies-admin', page, search],
    queryFn: isDemo()
      ? () => {
          let list = localCompanies;
          if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
          return Promise.resolve(mockPagination(list));
        }
      : () => companyService.getAll({ page, limit: 10, search }).then(r => r.data),
    keepPreviousData: true,
  });

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const openAdd = () => { setForm(EMPTY_FORM); setModal({ mode: 'add' }); };
  const openEdit = (c) => {
    setForm({ name: c.name, logoUrl: c.logo_url || '', roleOffered: c.role_offered, packageLpa: c.package_lpa, eligibilityCgpa: c.eligibility_cgpa, visitDate: c.visit_date?.split('T')[0], applicationDeadline: c.application_deadline?.split('T')[0], description: c.description || '', hiringProcess: c.hiring_process || '', applicationLink: c.application_link || '' });
    setModal({ mode: 'edit', data: c });
  };

  const handleSave = () => {
    if (isDemo()) {
      if (modal.mode === 'add') {
        setLocalCompanies(prev => [...prev, { id: `demo-${Date.now()}`, name: form.name, logo_url: form.logoUrl, role_offered: form.roleOffered, package_lpa: form.packageLpa, eligibility_cgpa: form.eligibilityCgpa, visit_date: form.visitDate, application_deadline: form.applicationDeadline, description: form.description, hiring_process: form.hiringProcess, application_link: form.applicationLink, is_active: true }]);
        toast.success('Company added! (Demo)');
      } else {
        setLocalCompanies(prev => prev.map(c => c.id === modal.data.id ? { ...c, name: form.name, logo_url: form.logoUrl, role_offered: form.roleOffered, package_lpa: form.packageLpa, eligibility_cgpa: form.eligibilityCgpa, application_link: form.applicationLink } : c));
        toast.success('Company updated! (Demo)');
      }
      setModal(null);
      qc.invalidateQueries(['companies-admin']);
      return;
    }
    // Real API
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    const call = modal.mode === 'add' ? companyService.create(fd) : companyService.update(modal.data.id, fd);
    call.then(() => { qc.invalidateQueries(['companies-admin']); setModal(null); toast.success('Saved!'); }).catch(() => toast.error('Failed'));
  };

  const handleDelete = () => {
    if (isDemo()) {
      setLocalCompanies(prev => prev.filter(c => c.id !== modal.data.id));
      qc.invalidateQueries(['companies-admin']);
      setModal(null);
      toast.success('Deleted (Demo)');
      return;
    }
    companyService.delete(modal.data.id).then(() => { qc.invalidateQueries(['companies-admin']); setModal(null); toast.success('Deleted'); }).catch(() => toast.error('Failed'));
  };

  return (
    <CoordinatorLayout title="Manage Companies">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, maxWidth: 320 }}><SearchBar placeholder="Search companies..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} /></div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Company</button>
      </div>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead><tr><th>Company</th><th>Role</th><th>Package</th><th>Min CGPA</th><th>Visit Date</th><th>Actions</th></tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan={6}><SkeletonLoader rows={5} cols={6} /></td></tr>
              : (data?.data || []).length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No companies found</td></tr>
              : (data?.data || []).map(c => (
                <tr key={c.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><CompanyLogo logoUrl={c.logo_url} companyName={c.name} size={36} /><span style={{ fontWeight: 500 }}>{c.name}</span></div></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.role_offered}</td>
                  <td><span style={{ fontWeight: 600, color: 'var(--success)' }}>₹{c.package_lpa} LPA</span></td>
                  <td>{c.eligibility_cgpa}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{c.visit_date ? format(parseLocalDate(c.visit_date), 'MMM dd, yyyy') : '—'}</td>
                  <td><div style={{ display: 'flex', gap: 8 }}><button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}><Edit2 size={13} /></button><button className="btn btn-danger btn-sm" onClick={() => setModal({ mode: 'delete', data: c })}><Trash2 size={13} /></button></div></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />

      <Modal isOpen={modal?.mode === 'add' || modal?.mode === 'edit'} onClose={() => setModal(null)} title={modal?.mode === 'add' ? 'Add Company' : 'Edit Company'}
        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSave}>{modal?.mode === 'add' ? 'Add Company' : 'Save Changes'}</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div><label className="input-label">Company Name *</label><input className="input" value={form.name} onChange={set('name')} placeholder="Google, Microsoft..." /></div>
          
          {/* Logo Selection and Preview */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: 'rgba(255, 255, 255, 0.03)', padding: 16, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 4 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <label className="input-label" style={{ margin: 0, marginBottom: 4 }}>Company Logo</label>
              <select 
                className="input" 
                value={form.logoUrl === '' ? '' : (PREDEFINED_LOGOS.some(item => item.value === form.logoUrl) ? form.logoUrl : 'custom')} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'custom') {
                    setForm(prev => ({ ...prev, logoUrl: 'custom.png' }));
                  } else {
                    setForm(prev => ({ ...prev, logoUrl: val }));
                  }
                }}
              >
                <option value="">No Logo (Gradient Avatar Fallback)</option>
                {PREDEFINED_LOGOS.map(item => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
                <option value="custom">Custom Filename...</option>
              </select>

              {(form.logoUrl !== '' && !PREDEFINED_LOGOS.some(item => item.value === form.logoUrl)) && (
                <div style={{ marginTop: 8 }}>
                  <input 
                    className="input" 
                    placeholder="e.g. custom-logo.png" 
                    value={form.logoUrl} 
                    onChange={(e) => setForm(prev => ({ ...prev, logoUrl: e.target.value }))} 
                  />
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>PREVIEW</div>
              <CompanyLogo logoUrl={form.logoUrl} companyName={form.name || 'Preview'} size={56} />
            </div>
          </div>
          <div><label className="input-label">Role Offered *</label><input className="input" value={form.roleOffered} onChange={set('roleOffered')} placeholder="Software Engineer" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label className="input-label">Package (LPA) *</label><input className="input" type="number" step="0.5" value={form.packageLpa} onChange={set('packageLpa')} placeholder="12.0" /></div>
            <div><label className="input-label">Eligibility CGPA *</label><input className="input" type="number" step="0.1" min="0" max="10" value={form.eligibilityCgpa} onChange={set('eligibilityCgpa')} placeholder="7.5" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label className="input-label">Visit Date *</label><input className="input" type="date" value={form.visitDate} onChange={set('visitDate')} /></div>
            <div><label className="input-label">Application Deadline *</label><input className="input" type="date" value={form.applicationDeadline} onChange={set('applicationDeadline')} /></div>
          </div>
          <div><label className="input-label">Company Description</label><textarea className="input" rows={3} value={form.description} onChange={set('description')} style={{ resize: 'vertical' }} /></div>
          <div><label className="input-label">Hiring Process</label><textarea className="input" rows={3} value={form.hiringProcess} onChange={set('hiringProcess')} style={{ resize: 'vertical' }} /></div>
          <div><label className="input-label">Application Link</label><input className="input" type="url" value={form.applicationLink} onChange={set('applicationLink')} placeholder="https://careers.company.com (optional)" /></div>
        </div>
      </Modal>

      <Modal isOpen={modal?.mode === 'delete'} onClose={() => setModal(null)} title="Delete Company"
        footer={<><button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></>}>
        <p style={{ color: 'var(--text-secondary)' }}>Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{modal?.data?.name}</strong>?</p>
      </Modal>
    </CoordinatorLayout>
  );
}
