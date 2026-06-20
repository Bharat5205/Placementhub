import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services';
import { mockStudentDashboard, mockStudentUser } from '../../services/mockData';
import StudentLayout from '../../layouts/StudentLayout';
import { CardSkeleton } from '../../components/SkeletonLoader';
import { 
  Building2, TrendingUp, CheckCircle, Bell, Calendar, Clock, BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
import CompanyLogo from '../../components/CompanyLogo';

function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const s = typeof dateStr === 'string' ? dateStr.split('T')[0] : String(dateStr);
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

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
  console.log('Comparison Result (isOpen):', isOpen);
  
  return passed;
}

const isDemo = () => localStorage.getItem('demoMode') === 'true';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 24, borderRadius: 16 }}>
      <div className="stat-icon-wrap" style={{ background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 14, flexShrink: 0 }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: isDemo()
      ? () => Promise.resolve(mockStudentDashboard)
      : () => userService.getStudentDashboard().then(r => r.data.data),
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: isDemo()
      ? () => Promise.resolve(mockStudentUser)
      : () => userService.getProfile().then(r => r.data.data),
  });

  // Safe checks for data arrays
  const stats = data?.stats;
  const placementStats = data?.placementStats;
  const upcomingDrives = data?.upcomingDrives || [];
  const closingSoon = data?.closingSoon || [];
  const eligibleCompaniesList = data?.eligibleCompaniesList || [];
  const recentNotifications = data?.recentNotifications || [];

  return (
    <StudentLayout title="Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }} className="fade-in">
        
        {/* Welcome Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(17, 17, 24, 0.6) 100%)', 
          border: '1px solid var(--border)', 
          borderRadius: 20, 
          padding: 28, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20
        }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
              Welcome back, {profile?.name?.split(' ')[0] || 'Student'}! 👋
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14, lineHeight: 1.5 }}>
              Here is your campus placement summary. Explore new opportunities and keep track of deadlines.
            </p>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: 16, 
            background: 'rgba(0,0,0,0.2)', 
            padding: '10px 20px', 
            borderRadius: 14, 
            border: '1px solid var(--border)' 
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>YOUR CGPA</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--success)', marginTop: 2 }}>{profile?.cgpa || '—'}</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }}></div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>BRANCH</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', marginTop: 2 }}>{profile?.branch || '—'}</div>
            </div>
          </div>
        </div>

        {/* 3. Stat Cards */}
        {isLoading ? (
          <CardSkeleton count={3} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
            <StatCard icon={Building2} label="Total Placement Drives" value={stats?.totalCompanies} color="#6366f1" bg="var(--accent-light)" />
            <StatCard icon={TrendingUp} label="Active Drives" value={stats?.upcomingCompanies} color="#f59e0b" bg="var(--warning-light)" />
            <StatCard icon={CheckCircle} label="Eligible Companies" value={stats?.eligibleCompanies} color="#22c55e" bg="var(--success-light)" />
          </div>
        )}

        <div className="dashboard-grid">
          {/* Main Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* 1. Upcoming Drives & 2. Applications Closing Soon Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32 }}>
              
              {/* Upcoming Drives */}
              <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={18} color="var(--accent)" />
                    Upcoming Drives
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--accent-light)', padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>
                    {upcomingDrives.length} drives
                  </span>
                </div>

                {isLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 68 }} />)}
                  </div>
                ) : upcomingDrives.length === 0 ? (
                  <div className="empty-state" style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No upcoming drives at the moment
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {upcomingDrives.map(drive => {
                      const passed = isDeadlinePassed(drive.application_deadline);
                      return (
                        <div 
                          key={drive.id} 
                          onClick={() => navigate(`/student/companies/${drive.id}`)}
                          style={{ 
                            padding: 16, 
                            background: 'var(--bg-secondary)', 
                            borderRadius: 12, 
                            border: '1px solid var(--border)', 
                            cursor: 'pointer',
                          }}
                          className="drive-list-item"
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                              <CompanyLogo logoUrl={drive.logo_url} companyName={drive.name} size={42} />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{drive.name}</div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{drive.role_offered}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                                  Visit Date: {drive.visit_date ? format(parseLocalDate(drive.visit_date), 'MMM dd, yyyy') : '—'}
                                </div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', background: 'var(--success-light)', padding: '4px 10px', borderRadius: 8 }}>
                                ₹{drive.package_lpa} LPA
                              </span>
                              <div style={{ marginTop: 10 }}>
                                {passed ? (
                                  <span style={{ fontSize: 11, color: 'var(--danger)', background: 'var(--danger-light)', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                                    Closed
                                  </span>
                                ) : (
                                  <span style={{ fontSize: 11, color: 'var(--success)', background: 'var(--success-light)', padding: '3px 8px', borderRadius: 6, fontWeight: 600 }}>
                                    Apply
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Applications Closing Soon */}
              <div className="glass-card" style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={18} color="var(--warning)" />
                    Closing Soon
                  </h3>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--warning-light)', padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>
                    Urgent
                  </span>
                </div>

                {isLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 68 }} />)}
                  </div>
                ) : closingSoon.length === 0 ? (
                  <div className="empty-state" style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No pending deadlines
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {closingSoon.map(drive => (
                      <div 
                        key={drive.id} 
                        onClick={() => navigate(`/student/companies/${drive.id}`)}
                        style={{ 
                          padding: 16, 
                          background: 'var(--bg-secondary)', 
                          borderRadius: 12, 
                          border: '1px solid var(--border)', 
                          cursor: 'pointer'
                        }}
                        className="drive-list-item"
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            <CompanyLogo logoUrl={drive.logo_url} companyName={drive.name} size={42} />
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>{drive.name}</div>
                              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{drive.role_offered}</div>
                              <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} />
                                Deadline: {drive.application_deadline ? format(parseLocalDate(drive.application_deadline), 'MMM dd, yyyy') : '—'}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--success)', flexShrink: 0 }}>
                            ₹{drive.package_lpa} LPA
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

               {/* 3. Eligible Companies list */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={18} color="var(--success)" />
                Eligible Companies For You
              </h3>
              {isLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                  {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
                </div>
              ) : eligibleCompaniesList.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No eligible companies matching your CGPA
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                  {eligibleCompaniesList.map(company => (
                    <div 
                      key={company.id}
                      onClick={() => navigate(`/student/companies/${company.id}`)}
                      style={{
                        padding: 22,
                        background: 'var(--bg-secondary)',
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: 16
                      }}
                      className="drive-list-item"
                    >
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <CompanyLogo logoUrl={company.logo_url} companyName={company.name} size={48} />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>{company.name}</div>
                          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{company.role_offered}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 12 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Min CGPA: <strong style={{ color: 'var(--text-primary)' }}>{company.eligibility_cgpa}</strong></span>
                        <span style={{ fontWeight: 700, color: 'var(--success)' }}>₹{company.package_lpa} LPA</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

            {/* 6. Placement Statistics Widget */}
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={18} color="var(--accent)" />
                Placement Analytics
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Highest Package</span>
                  <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: 14 }}>₹{placementStats?.maxPackage || 0} LPA</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Average Package</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: 14 }}>₹{placementStats?.avgPackage || 0} LPA</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Lowest Package</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>₹{placementStats?.minPackage || 0} LPA</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Drives by CTC Category</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {(placementStats?.distribution || []).map((dist, idx) => (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                        <span>{dist.range}</span>
                        <span>{dist.count} companies</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ 
                          height: '100%', 
                          background: 'linear-gradient(90deg, var(--accent), #ec4899)', 
                          width: `${placementStats.totalDrives > 0 ? (dist.count / placementStats.totalDrives) * 100 : 0}%` 
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Recent Notifications */}
            <div className="glass-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bell size={18} color="var(--warning)" />
                  Recent Updates
                </h3>
              </div>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[1, 2].map(i => <div key={i} className="skeleton" style={{ height: 56 }} />)}
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="empty-state" style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No announcements yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recentNotifications.map(n => (
                    <div key={n.id} style={{ 
                      padding: 14, 
                      background: 'var(--bg-secondary)', 
                      borderRadius: 10, 
                      border: '1px solid var(--border)' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
                        <span style={{ 
                          fontWeight: 600, 
                          fontSize: 14, 
                          color: n.priority === 'high' ? 'var(--danger)' : 'var(--text-primary)' 
                        }}>{n.title}</span>
                        <span className={`badge badge-${n.priority === 'high' ? 'danger' : n.priority === 'low' ? 'success' : 'warning'}`} style={{ fontSize: 9, padding: '2px 6px' }}>
                          {n.priority}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </StudentLayout>
  );
}
