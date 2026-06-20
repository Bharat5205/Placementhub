import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services';
import { mockStudents } from '../../services/mockData';
import CoordinatorLayout from '../../layouts/CoordinatorLayout';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import SkeletonLoader from '../../components/SkeletonLoader';
import { Users } from 'lucide-react';

const isDemo = () => localStorage.getItem('demoMode') === 'true';
const BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'Other'];

export default function StudentDirectory() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [branch, setBranch] = useState('');
  const [minCgpa, setMinCgpa] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, search, branch, minCgpa],
    queryFn: isDemo()
      ? () => {
          let list = mockStudents;
          if (search) list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()) || (s.roll_number || '').toLowerCase().includes(search.toLowerCase()));
          if (branch) list = list.filter(s => s.branch === branch);
          if (minCgpa) list = list.filter(s => s.cgpa >= parseFloat(minCgpa));
          return Promise.resolve({ data: list, pagination: { total: list.length, totalPages: 1 } });
        }
      : () => userService.getStudents({ page, limit: 15, search, branch, minCgpa }).then(r => r.data),
    keepPreviousData: true,
  });

  return (
    <CoordinatorLayout title="Student Directory">
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <SearchBar placeholder="Search by name, email, roll..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        </div>
        <select className="input" style={{ width: 140 }} value={branch} onChange={e => { setBranch(e.target.value); setPage(1); }}>
          <option value="">All Branches</option>
          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <input className="input" type="number" placeholder="Min CGPA" style={{ width: 120 }} value={minCgpa} onChange={e => { setMinCgpa(e.target.value); setPage(1); }} min="0" max="10" step="0.5" />
      </div>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{data?.pagination?.total || 0} students found</span>
      </div>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr><th>Student</th><th>Roll Number</th><th>Branch</th><th>CGPA</th><th>Email</th></tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5}><SkeletonLoader rows={8} cols={5} /></td></tr>
            ) : (data?.data || []).length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 48 }}><Users size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} /><div style={{ color: 'var(--text-muted)' }}>No students found</div></td></tr>
            ) : (
              (data?.data || []).map(student => (
                <tr key={student.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#fff', fontSize: 13, flexShrink: 0 }}>{student.name?.charAt(0).toUpperCase()}</div>
                      <span style={{ fontWeight: 500 }}>{student.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{student.roll_number || '—'}</td>
                  <td><span className="badge badge-muted">{student.branch || '—'}</span></td>
                  <td><span style={{ fontWeight: 600, color: student.cgpa >= 8 ? 'var(--success)' : student.cgpa >= 6 ? 'var(--warning)' : 'var(--text-primary)' }}>{student.cgpa || '—'}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{student.email}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />
    </CoordinatorLayout>
  );
}
