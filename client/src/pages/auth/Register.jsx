import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const BRANCHES = ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'AIDS', 'AIML', 'Other'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    rollNumber: '', branch: '', cgpa: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.cgpa || parseFloat(form.cgpa) > 10 || parseFloat(form.cgpa) < 0) {
      return toast.error('CGPA must be between 0 and 10');
    }
    if (!form.branch) return toast.error('Please select your branch');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      // role is intentionally NOT sent — the server always assigns 'student'
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        rollNumber: form.rollNumber,
        branch: form.branch,
        cgpa: parseFloat(form.cgpa),
      };

      const res = await register(payload);
      setSuccess(true);
      toast.success(res.message || '✅ Account created successfully. Please log in using your credentials.');
      setTimeout(() => {
        navigate('/login?role=student');
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ maxWidth: 460, textAlign: 'center', padding: '40px 32px' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 18px rgba(34,197,94,0.2)',
          }}>
            <span style={{ fontSize: 32 }}>✅</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>
            Registration Successful!
          </h2>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, marginBottom: 28 }}>
            ✅ Account created successfully. Please log in using your credentials.
          </p>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Redirecting to the login page in 3 seconds...
          </div>
          <button
            onClick={() => navigate('/login?role=student')}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, padding: '14px', cursor: 'pointer' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
          }}>
            <GraduationCap size={28} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Create Student Account</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 14 }}>
            Join PlacementHub as a <strong style={{ color: '#6366f1' }}>Student</strong>
          </p>
        </div>

        {/* ── Student-only notice ── */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 12, padding: '12px 14px', marginBottom: 24,
        }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>🎓</span>
          <p style={{ fontSize: 13, color: '#4f46e5', margin: 0, lineHeight: 1.55 }}>
            This registration form is for <strong>students only</strong>. Coordinator accounts are
            managed by the Placement Cell Administrator.
          </p>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit}>
          {/* Full Name + Roll Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label className="input-label">Full Name *</label>
              <input className="input" placeholder="John Doe" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="input-label">Roll Number *</label>
              <input className="input" placeholder="21CSE001" value={form.rollNumber} onChange={set('rollNumber')} required />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label className="input-label">College Email *</label>
            <input className="input" type="email" placeholder="you@college.edu" value={form.email} onChange={set('email')} required />
          </div>

          {/* Branch + CGPA */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label className="input-label">Branch *</label>
              <select className="input" value={form.branch} onChange={set('branch')} required>
                <option value="">Select branch</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">CGPA *</label>
              <input
                className="input"
                type="number" step="0.01" min="0" max="10"
                placeholder="8.50"
                value={form.cgpa}
                onChange={set('cgpa')}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 24, position: 'relative' }}>
            <label className="input-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set('password')}
                minLength={6}
                required
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-lg"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
              color: '#fff', border: 'none', borderRadius: 12,
              fontWeight: 700, fontSize: 15, padding: '14px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(99,102,241,0.3)',
              transition: 'all 0.3s',
            }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Student Account'}
          </button>
        </form>

        <div className="divider" />

        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
