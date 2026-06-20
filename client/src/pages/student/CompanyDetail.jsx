import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { companyService, experienceService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import StudentLayout from '../../layouts/StudentLayout';
import { ArrowLeft, Calendar, DollarSign, BookOpen, Download, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import CompanyLogo from '../../components/CompanyLogo';

// ── Parse a "YYYY-MM-DD" (or ISO) date string as LOCAL midnight ───────────────
// new Date('2026-07-10') is UTC midnight → can appear expired early in IST (+5:30).
// Parsing via "YYYY, MM-1, DD" forces local timezone interpretation.
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  // If the date string is date-only (no time component), shift to local midnight
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, day] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, day); // local midnight
  }
  return d;
}

function CompanyExperienceCard({ exp }) {
  const [expanded, setExpanded] = useState(false);

  const getDifficultyBadge = (diff) => {
    const d = (diff || 'Medium').toLowerCase();
    if (d === 'easy') return { label: 'Easy', bg: 'rgba(34, 197, 94, 0.15)', color: '#10b981' };
    if (d === 'hard') return { label: 'Hard', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
    return { label: 'Medium', bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
  };

  const diffBadge = getDifficultyBadge(exp.difficulty_level);

  return (
    <div style={{ padding: 18, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div style={{ fontWeight: 750, fontSize: 15, color: 'var(--text-primary)' }}>
            {exp.title || `${exp.company_name} ${exp.role_offered || 'SDE'} Experience`}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {exp.role_offered || 'Software Engineer'} • Batch {exp.batch_year}
          </div>
        </div>
        <span style={{ fontSize: 11, background: diffBadge.bg, color: diffBadge.color, padding: '3px 8px', borderRadius: 20, fontWeight: 600 }}>
          {diffBadge.label}
        </span>
      </div>
      
      <div style={{ 
        fontSize: 13, 
        color: 'var(--text-secondary)', 
        lineHeight: 1.6, 
        overflow: expanded ? 'visible' : 'hidden', 
        display: expanded ? 'block' : '-webkit-box', 
        WebkitLineClamp: 2, 
        WebkitBoxOrient: 'vertical' 
      }}>
        {exp.experience}
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4, borderTop: '1px solid var(--border)', paddingTop: 12 }} className="fade-in">
          {exp.interview_rounds && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>📋 INTERVIEW ROUNDS</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{exp.interview_rounds}</div>
            </div>
          )}

          {exp.preparation_tips && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>💡 PREPARATION TIPS</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{exp.preparation_tips}</div>
            </div>
          )}

          {exp.resources_links && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                <span>RESOURCES</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {exp.resources_links.split(',').map((link, idx) => {
                  const cleanLink = link.trim();
                  if (!cleanLink) return null;
                  const isUrl = cleanLink.startsWith('http');
                  return (
                    <div key={idx}>
                      {isUrl ? (
                        <a href={cleanLink} target="_blank" rel="noopener noreferrer" style={{ color: '#10b981', textDecoration: 'underline' }}>
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

      <button onClick={() => setExpanded(!expanded)} className="btn btn-secondary btn-sm" style={{ width: 'fit-content', padding: '3px 8px', fontSize: 11 }}>
        {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read full experience</>}
      </button>
    </div>
  );
}

export default function CompanyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => companyService.getById(id).then(r => r.data.data),
  });

  const { data: expData } = useQuery({
    queryKey: ['experiences', id],
    queryFn: () => experienceService.getAll({ companyName: company?.name }).then(r => r.data.data),
    enabled: !!company,
  });



  if (isLoading) return (
    <StudentLayout title="Company Details">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />)}
      </div>
    </StudentLayout>
  );

  if (!company) return (
    <StudentLayout title="Company Details">
      <div className="empty-state"><div className="empty-state-title">Company not found</div></div>
    </StudentLayout>
  );

  // ── Deadline status — compare against TODAY, not visit date ─────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0); // normalize to local midnight for fair comparison

  const deadlineDate = company.application_deadline ? new Date(company.application_deadline) : null;
  if (deadlineDate) {
    deadlineDate.setHours(23, 59, 59, 999);
  }

  const visitDate = company.visit_date ? parseLocalDate(company.visit_date) : null;

  const isOpen = deadlineDate ? deadlineDate >= today : false;
  const isDeadlinePassed = !isOpen;

  // Eligibility calculation and logging
  const isEligible = company && user?.cgpa && company.eligibility_cgpa && parseFloat(user.cgpa) >= parseFloat(company.eligibility_cgpa);
  console.log('[CompanyDetail] Eligibility check:', {
    companyName: company.name,
    studentCgpa: user?.cgpa,
    requiredCgpa: company.eligibility_cgpa,
    isEligible: !!isEligible
  });

  // Debug logging as requested
  console.log('Current Date:', today);
  console.log('Deadline Date:', deadlineDate);
  console.log('Comparison Result:', isOpen);

  return (
    <StudentLayout title={company.name}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: 24 }}>
        <ArrowLeft size={14} /> Back to Companies
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Main Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card" style={{ padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <CompanyLogo logoUrl={company.logo_url} companyName={company.name} size={64} />
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 700 }}>{company.name}</h1>
                  <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{company.role_offered}</p>
                </div>
              </div>
              {isEligible ? (
                <span className="badge badge-success" style={{ fontSize: 13, padding: '6px 14px' }}>
                  <CheckCircle size={14} /> You are Eligible
                </span>
              ) : (
                <span className="badge badge-danger" style={{ fontSize: 13, padding: '6px 14px' }}>
                  <XCircle size={14} /> Not Eligible
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, padding: 20, background: 'var(--bg-secondary)', borderRadius: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--success)' }}>₹{company.package_lpa} LPA</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Package</div>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{company.eligibility_cgpa}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Min. CGPA</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{visitDate ? format(visitDate, 'MMM dd') : '—'}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Visit Date</div>
              </div>
            </div>

            {company.description && (
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontWeight: 600, marginBottom: 8 }}>About the Company</h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{company.description}</p>
              </div>
            )}
          </div>

          {company.hiring_process && (
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Hiring Process</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{company.hiring_process}</p>
            </div>
          )}

          {expData?.length > 0 && (
            <div className="glass-card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Interview Experiences ({expData.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {expData.map(exp => (
                  <CompanyExperienceCard key={exp.id} exp={exp} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Key Dates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Visit Date</span>
                <span style={{ fontWeight: 500 }}>
                  {visitDate ? format(visitDate, 'MMM dd, yyyy') : '—'}
                </span>
              </div>
              <div style={{ height: 1, background: 'var(--border)' }} />

              {/* ── Deadline row — colour driven by isDeadlinePassed ── */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Deadline</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{
                    fontWeight: 600,
                    color: isDeadlinePassed ? 'var(--danger)' : 'var(--success)',
                  }}>
                    {deadlineDate ? format(deadlineDate, 'MMM dd, yyyy') : '—'}
                  </span>
                  {/* Status badge */}
                  {isDeadlinePassed ? (
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: 'var(--danger-light, rgba(239,68,68,0.1))', color: 'var(--danger)',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                      <XCircle size={11} /> Deadline Passed
                    </span>
                  ) : (
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                      background: 'var(--success-light, rgba(34,197,94,0.1))', color: 'var(--success)',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                      <CheckCircle size={11} /> Applications Open
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {company.jd_pdf_url && (
            <a href={company.jd_pdf_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              <Download size={16} /> Download JD
            </a>
          )}

          {company.application_link && (
            <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ fontWeight: 600, margin: 0 }}>Application Portal</h3>
                {isDeadlinePassed ? (
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                    background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                    display: 'inline-flex', alignItems: 'center', gap: 4
                  }}>
                    🔴 Applications Closed
                  </span>
                ) : (
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                    background: 'rgba(34,197,94,0.1)', color: '#22c55e',
                    display: 'inline-flex', alignItems: 'center', gap: 4
                  }}>
                    🟢 Applications Open
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Official company application page:
                <div style={{ 
                  marginTop: 6, 
                  fontFamily: 'monospace', 
                  fontSize: 12, 
                  background: 'var(--bg-secondary)', 
                  padding: '8px 12px', 
                  borderRadius: 6, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  border: '1px solid var(--border)'
                }}>
                  {company.application_link}
                </div>
              </div>

              <a 
                href={isDeadlinePassed ? undefined : company.application_link}
                target={isDeadlinePassed ? undefined : "_blank"}
                rel={isDeadlinePassed ? undefined : "noopener noreferrer"}
                className={`btn ${isDeadlinePassed ? 'btn-disabled' : 'btn-primary'}`}
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  gap: 8,
                  pointerEvents: isDeadlinePassed ? 'none' : 'auto',
                  opacity: isDeadlinePassed ? 0.5 : 1,
                  cursor: isDeadlinePassed ? 'not-allowed' : 'pointer'
                }}
                disabled={isDeadlinePassed}
              >
                Apply Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

