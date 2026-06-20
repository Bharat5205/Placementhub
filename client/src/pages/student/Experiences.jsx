import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { experienceService, companyService } from '../../services';
import { mockExperiences, mockCompanies } from '../../services/mockData';
import StudentLayout from '../../layouts/StudentLayout';
import SearchBar from '../../components/SearchBar';
import Pagination from '../../components/Pagination';
import { BookOpen, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';
import { format } from 'date-fns';

const isDemo = () => localStorage.getItem('demoMode') === 'true';

function ExperienceCard({ exp }) {
  const [expanded, setExpanded] = useState(false);

  const getDifficultyBadge = (diff) => {
    const d = (diff || 'Medium').toLowerCase();
    if (d === 'easy') return { label: 'Easy', bg: 'rgba(34, 197, 94, 0.15)', color: '#10b981' };
    if (d === 'hard') return { label: 'Hard', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
    return { label: 'Medium', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
  };

  const diffBadge = getDifficultyBadge(exp.difficulty_level);

  return (
    <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h4 style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>{exp.title || `${exp.company_name} Interview Experience`}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--accent)' }}>{exp.company_name}</strong>
            <span>•</span>
            <span>{exp.role_offered || 'Software Engineer'}</span>
            <span>•</span>
            <span style={{ background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: 12, fontSize: 12, border: '1px solid var(--border)' }}>Batch {exp.batch_year}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 12, background: diffBadge.bg, color: diffBadge.color, padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
            {diffBadge.label}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {format(new Date(exp.created_at), 'MMM dd, yyyy')}
          </span>
        </div>
      </div>

      <div style={{ 
        fontSize: 14, 
        color: 'var(--text-secondary)', 
        lineHeight: 1.7, 
        overflow: expanded ? 'visible' : 'hidden', 
        display: expanded ? 'block' : '-webkit-box', 
        WebkitLineClamp: 3, 
        WebkitBoxOrient: 'vertical' 
      }}>
        {exp.experience}
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4, borderTop: '1px solid var(--border)', paddingTop: 16 }} className="fade-in">
          {exp.interview_rounds && (
            <div style={{ padding: 14, background: 'rgba(245, 158, 11, 0.05)', borderRadius: 12, border: '1px solid rgba(245, 158, 11, 0.1)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}>
                📋 INTERVIEW ROUNDS
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{exp.interview_rounds}</div>
            </div>
          )}

          {exp.preparation_tips && (
            <div style={{ padding: 14, background: 'rgba(99, 102, 241, 0.05)', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.1)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>
                💡 PREPARATION TIPS
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{exp.preparation_tips}</div>
            </div>
          )}

          {exp.resources_links && (
            <div style={{ padding: 14, background: 'rgba(16, 185, 129, 0.05)', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.1)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <LinkIcon size={13} />
                <span>RESOURCES & HELPFUL LINKS</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {exp.resources_links.split(',').map((link, idx) => {
                  const cleanLink = link.trim();
                  if (!cleanLink) return null;
                  const isUrl = cleanLink.startsWith('http');
                  return (
                    <div key={idx}>
                      {isUrl ? (
                        <a href={cleanLink} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'underline', wordBreak: 'break-all' }}>
                          {cleanLink}
                        </a>
                      ) : (
                        <span>{cleanLink}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <button onClick={() => setExpanded(!expanded)} className="btn btn-secondary btn-sm" style={{ width: 'fit-content', marginTop: 4 }}>
        {expanded ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Read full experience</>}
      </button>
    </div>
  );
}

const YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => String(YEAR - i));

export default function Experiences() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [companyFilter, setCompanyFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [year, setYear] = useState('');

  // Fetch companies to populate company filter dropdown
  const { data: companiesData } = useQuery({
    queryKey: ['companies-filter'],
    queryFn: isDemo()
      ? () => Promise.resolve({ data: mockCompanies })
      : () => companyService.getAll({ page: 1, limit: 100 }).then(r => r.data),
  });

  const companiesList = companiesData?.data || [];

  // Fetch experiences with query parameters mapping
  const { data, isLoading } = useQuery({
    queryKey: ['experiences', page, search, companyFilter, roleFilter, year],
    queryFn: isDemo()
      ? () => {
          let list = mockExperiences;
          if (search) list = list.filter(e => e.title?.toLowerCase().includes(search.toLowerCase()) || e.experience.toLowerCase().includes(search.toLowerCase()));
          if (companyFilter) list = list.filter(e => e.company_name === companyFilter);
          if (roleFilter) list = list.filter(e => e.role_offered?.toLowerCase().includes(roleFilter.toLowerCase()));
          if (year) list = list.filter(e => e.batch_year === year);
          
          return Promise.resolve({ 
            data: list, 
            pagination: { total: list.length, totalPages: 1 } 
          });
        }
      : () => experienceService.getAll({ 
          page, 
          limit: 5, 
          search, 
          companyName: companyFilter, 
          role: roleFilter, 
          year 
        }).then(r => r.data),
  });

  return (
    <StudentLayout title="Interview Experiences">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <SearchBar placeholder="Search experiences by title or content..." value={search} onChange={(v) => { setSearch(v); setPage(1); }} />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <select className="input" style={{ width: 200, flex: 1, minWidth: 150 }} value={companyFilter} onChange={e => { setCompanyFilter(e.target.value); setPage(1); }}>
            <option value="">All Companies</option>
            {companiesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <input className="input" style={{ width: 200, flex: 1, minWidth: 150 }} placeholder="Filter by role..." value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} />
          <select className="input" style={{ width: 150 }} value={year} onChange={e => { setYear(e.target.value); setPage(1); }}>
            <option value="">All Years</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 160, borderRadius: 16 }} />)}
        </div>
      ) : (data?.data || []).length === 0 ? (
        <div className="empty-state">
          <BookOpen className="empty-state-icon" />
          <div className="empty-state-title">No experiences found</div>
          <div className="empty-state-desc">Try modifying your filters or search query.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(data?.data || []).map(exp => (
            <ExperienceCard key={exp.id} exp={exp} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />
    </StudentLayout>
  );
}
