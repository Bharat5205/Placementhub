import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services';
import { mockCoordinatorDashboard } from '../../services/mockData';
import CoordinatorLayout from '../../layouts/CoordinatorLayout';
import { CardSkeleton } from '../../components/SkeletonLoader';
import { Users, Building2, TrendingUp, BookOpen, Bell } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const isDemo = () => localStorage.getItem('demoMode') === 'true';

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrap" style={{ background: bg }}><Icon size={22} color={color} /></div>
      <div><div className="stat-value">{value ?? '—'}</div><div className="stat-label">{label}</div></div>
    </div>
  );
}

const PIE_COLORS = ['#6366f1', '#a78bfa', '#22c55e', '#f59e0b'];

export default function CoordinatorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['coordinator-dashboard'],
    queryFn: isDemo()
      ? () => Promise.resolve(mockCoordinatorDashboard)
      : () => userService.getCoordinatorDashboard().then(r => r.data.data),
  });

  const pieData = (data?.packageDistribution || []).map(d => ({ name: d.range, value: parseInt(d.count) }));

  return (
    <CoordinatorLayout title="Dashboard">
      <div>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>Coordinator Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>Manage placements, companies, and students</p>
        </div>

        {isLoading ? <CardSkeleton count={4} /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard icon={Users} label="Total Students" value={data?.stats?.totalStudents} color="#6366f1" bg="var(--accent-light)" />
            <StatCard icon={Building2} label="Total Companies" value={data?.stats?.totalCompanies} color="#a78bfa" bg="rgba(167,139,250,0.15)" />
            <StatCard icon={TrendingUp} label="Upcoming Drives" value={data?.stats?.upcomingDrives} color="#f59e0b" bg="var(--warning-light)" />
            <StatCard icon={BookOpen} label="Total Experiences" value={data?.stats?.totalExperiences} color="#22c55e" bg="var(--success-light)" />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Package Distribution Chart */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Package Distribution</h3>
            {isLoading ? <div className="skeleton" style={{ height: 240 }} /> : (
              pieData.length === 0 ? <div className="empty-state" style={{ padding: '40px 0' }}><p style={{ color: 'var(--text-muted)' }}>No data yet</p></div> : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              )
            )}
          </div>

          {/* Recent Notifications */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Bell size={18} color="var(--warning)" />
              <h3 style={{ fontWeight: 600 }}>Recent Notifications</h3>
            </div>
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 50 }} />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(data?.recentNotifications || []).map(n => (
                  <div key={n.id} style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{format(new Date(n.created_at), 'MMM dd')}</div>
                    </div>
                    <span className={`badge priority-${n.priority}`} style={{ fontSize: 10 }}>{n.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </CoordinatorLayout>
  );
}
