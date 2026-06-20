import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../../services';
import { mockCompanies, mockPagination } from '../../services/mockData';
import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../layouts/StudentLayout';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import { Building2, Calendar, DollarSign, CheckCircle, XCircle, ArrowRight, Clock } from 'lucide-react';
import { format } from 'date-fns';
import CompanyLogo from '../../components/CompanyLogo';

// Parse date-only strings (YYYY-MM-DD) as LOCAL midnight to avoid UTC-offset issues
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const s = typeof dateStr === 'string' ? dateStr.split('T')[0] : String(dateStr);
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Returns true when the application deadline is before today (local midnight)
function isDeadlinePassed(deadlineStr) {
  if (!deadlineStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(deadlineStr);
  deadline.setHours(23, 59, 59, 999);
  const isOpen = deadline >= today;
  const passed = !isOpen;
  console.log('Current Date:', today);
  console.log('Deadline Date:', deadline);
  console.log('Comparison Result:', isOpen);
  return passed;
}

const isDemo = () => localStorage.getItem('demoMode') === 'true';

export default function Companies() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ minPackage: '', maxPackage: '', role: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['companies', page, search, filters],
    queryFn: isDemo()
      ? () => {
          let list = mockCompanies;
          if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.role_offered.toLowerCase().includes(search.toLowerCase()));
          if (filters.minPackage) list = list.filter(c => c.package_lpa >= parseFloat(filters.minPackage));
          if (filters.maxPackage) list = list.filter(c => c.package_lpa <= parseFloat(filters.maxPackage));
          if (filters.role) list = list.filter(c => c.role_offered.toLowerCase().includes(filters.role.toLowerCase()));
          return Promise.resolve(mockPagination(list));
        }
      : () => companyService.getAll({ page, limit: 9, search, ...filters }).then(r => r.data),
    keepPreviousData: true,
  });

  const companies = data?.data || [];
  const pagination = data?.pagination;
  const isEligible = (company) => {
    if (!user || !user.cgpa || !company.eligibility_cgpa) return false;
    const eligible = parseFloat(user.cgpa) >= parseFloat(company.eligibility_cgpa);
    console.log('[Companies Eligibility Check]', {
      companyName: company.name,
      studentCgpa: user.cgpa,
      requiredCgpa: company.eligibility_cgpa,
      isEligible: eligible
    });
    return eligible;
  };

  return (
    <StudentLayout title="Companies">
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchBar placeholder="Search companies, roles..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        </div>
        <input className="input" placeholder="Min Package (LPA)" type="number" style={{ width: 160 }} value={filters.minPackage} onChange={e => { setFilters({ ...filters, minPackage: e.target.value }); setPage(1); }} />
        <input className="input" placeholder="Max Package (LPA)" type="number" style={{ width: 160 }} value={filters.maxPackage} onChange={e => { setFilters({ ...filters, maxPackage: e.target.value }); setPage(1); }} />
        <input className="input" placeholder="Filter by role" style={{ width: 160 }} value={filters.role} onChange={e => { setFilters({ ...filters, role: e.target.value }); setPage(1); }} />
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height: 200, borderRadius: 16 }} />)}
        </div>
      ) : companies.length === 0 ? (
        <div className="empty-state"><Building2 className="empty-state-icon" /><div className="empty-state-title">No companies found</div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {companies.map(company => (
            <div key={company.id} className="glass-card" style={{ padding: 24, cursor: 'pointer' }} onClick={() => navigate(`/student/companies/${company.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <CompanyLogo logoUrl={company.logo_url} companyName={company.name} size={44} />
                {isEligible(company) ? (
                  <span className="badge badge-success"><CheckCircle size={11} /> Eligible</span>
                ) : (
                  <span className="badge badge-danger"><XCircle size={11} /> Not Eligible</span>
                )}
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{company.name}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>{company.role_offered}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, fontSize: 13, marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                    <DollarSign size={13} /><span style={{ fontWeight: 600, color: 'var(--success)' }}>₹{company.package_lpa} LPA</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)' }}>
                    <Calendar size={13} /><span>{company.visit_date ? format(parseLocalDate(company.visit_date), 'MMM dd, yyyy') : '—'}</span>
                  </div>
                </div>
                {isDeadlinePassed(company.application_deadline) ? (
                  <span className="badge badge-danger" style={{ fontSize: 11, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> Deadline Passed
                  </span>
                ) : (
                  <span className="badge badge-success" style={{ fontSize: 11, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> Open
                  </span>
                )}
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Min CGPA: <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{company.eligibility_cgpa}</span></div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={pagination?.totalPages || 1} onPageChange={setPage} />
    </StudentLayout>
  );
}
