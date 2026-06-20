import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, ArrowLeft, LogIn, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

// ── PlacementHub Logo SVG ─────────────────────────────────────────────────────
const PHLogo = ({ size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="14" fill="url(#logoGrad)" />
    <defs>
      <linearGradient id="logoGrad" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7C3AED" />
        <stop offset="1" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    {/* Graduation cap */}
    <polygon points="26,12 42,21 26,30 10,21" fill="white" opacity="0.95" />
    <rect x="36" y="21" width="3" height="10" rx="1.5" fill="white" opacity="0.85" />
    <ellipse cx="37.5" cy="31" rx="3.5" ry="2" fill="white" opacity="0.85" />
    {/* P letter */}
    <text x="20" y="46" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="13" fill="white" opacity="0.9">P</text>
  </svg>
);

// ── Google icon ───────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    <path fill="none" d="M0 0h48v48H0z" />
  </svg>
);

// ── Dot grid decoration ───────────────────────────────────────────────────────
const DotGrid = ({ style }) => (
  <svg width="80" height="80" viewBox="0 0 80 80" style={style}>
    {[0, 1, 2, 3, 4].map(row => [0, 1, 2, 3, 4].map(col => (
      <circle key={`${row}-${col}`} cx={col * 16 + 8} cy={row * 16 + 8} r="2.5" fill="#C4B5FD" opacity="0.5" />
    )))}
  </svg>
);

// ── Wave blob decoration ──────────────────────────────────────────────────────
const WaveBlob = () => (
  <svg viewBox="0 0 400 200" style={{ position: 'absolute', bottom: 0, left: 0, width: 280, opacity: 0.35, pointerEvents: 'none' }}>
    <path d="M0,100 C60,60 140,140 200,80 C260,20 340,120 400,60 L400,200 L0,200 Z" fill="url(#blobGrad)" />
    <defs>
      <linearGradient id="blobGrad" x1="0" y1="0" x2="1" y2="0">
        <stop stopColor="#C4B5FD" />
        <stop offset="1" stopColor="#A5B4FC" />
      </linearGradient>
    </defs>
  </svg>
);

export default function Login() {
  // ── Use URL search params so each step is a real browser history entry ──────
  // /login                   → role-select screen
  // /login?role=student      → student login form
  // /login?role=coordinator  → coordinator login form
  const [searchParams, setSearchParams] = useSearchParams();
  const step = searchParams.get('role') ?? 'select'; // 'select' | 'student' | 'coordinator'

  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login, loginWithTokens } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const errorParam = searchParams.get('error');

    if (errorParam) {
      let errorMsg = 'An error occurred during Google authentication.';
      if (errorParam === 'oauth_failed') {
        errorMsg = 'Google login was cancelled or failed.';
      } else if (errorParam === 'oauth_not_configured') {
        errorMsg = 'Google OAuth is not configured on the server. Please define GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the server .env file.';
      }
      toast.error(errorMsg);
      setError(errorMsg);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Push ?role=... to browser history → back button can pop it
  const goToRole = (role) => setSearchParams({ role });

  // Go back one history entry (pops ?role param → returns to select screen)
  const goBack = () => navigate(-1);

  const handleInputChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (error) setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...form,
        role: isCoord ? 'coordinator' : 'student'
      };
      const user = await login(payload);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'coordinator' ? '/coordinator/dashboard' : '/student/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      let displayError = 'Invalid email or password.';

      if (status >= 500) {
        displayError = 'Something went wrong. Please try again later.';
      } else if (msg) {
        displayError = msg;
      }

      setError(displayError);
      toast.error(displayError);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // SCREEN 1 — Role Selection  (/login  with no ?role param)
  // ────────────────────────────────────────────────────────────────────────────
  if (step === 'select') {
    return (
      <div style={S.page}>
        {/* Dot corners */}
        <DotGrid style={{ position: 'absolute', top: 20, right: 20, opacity: 0.6 }} />
        <DotGrid style={{ position: 'absolute', bottom: 80, left: 10, opacity: 0.4 }} />
        <WaveBlob />

        <div style={S.card}>
          {/* Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <PHLogo size={56} />
          </div>

          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span style={S.brandBlack}>Placement </span>
            <span style={S.brandPurple}>Hub</span>
          </div>


          {/* Welcome */}
          <p style={S.welcome}>Welcome!</p>
          <p style={S.chooseSub}>Please choose how you want to continue</p>

          {/* Role Cards */}
          <div style={S.roleRow}>
            {/* Student */}
            <div style={S.roleCard}>
              <div style={S.avatarCirclePurple}>
                <img src="/student_avatar.png" alt="Student" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <p style={S.roleTitle}>Login as Student</p>
              <p style={S.roleDesc}>Access your dashboard, view companies, apply for drives, and track your progress.</p>
              <button style={S.btnPurple} onClick={() => goToRole('student')}>
                <LogIn size={15} /> Login as Student
              </button>
            </div>

            {/* Coordinator */}
            <div style={S.roleCard}>
              <div style={S.avatarCircleBlue}>
                <img src="/coordinator_avatar.png" alt="Coordinator" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              </div>
              <p style={{ ...S.roleTitle, color: '#3B5BDB' }}>Login as Coordinator</p>
              <p style={S.roleDesc}>Manage placement drives, companies, students, and announcements.</p>
              <button style={S.btnBlue} onClick={() => goToRole('coordinator')}>
                <LogIn size={15} /> Login as Coordinator
              </button>
            </div>
          </div>


        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // SCREEN 2 — Login Form  (/login?role=student  or  /login?role=coordinator)
  // ────────────────────────────────────────────────────────────────────────────
  const isCoord = step === 'coordinator';

  return (
    <div style={S.loginPage}>
      {/* Campus background */}
      <img src="/campus_bg.png" alt="campus" style={S.bgImg} />
      <div style={S.bgOverlay} />

      {/* Dot decoration top-right */}
      <DotGrid style={{ position: 'fixed', top: 24, right: 24, zIndex: 3, opacity: 0.7 }} />

      {/* White card */}
      <div style={S.loginCard}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <PHLogo size={48} />
        </div>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <span style={{ ...S.brandBlack, fontSize: 26 }}>Placement </span>
          <span style={{ ...S.brandPurple, fontSize: 26 }}>Hub</span>
        </div>

        {/* Role label with underline */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#6B4EFF' }}>
            {isCoord ? 'Coordinator Login' : 'Student Login'}
          </span>
          <div style={{ margin: '5px auto 0', width: 48, height: 3, borderRadius: 2, background: 'linear-gradient(90deg, #6B4EFF, #4F46E5)' }} />
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Email / Roll */}
          <div>
            <label style={S.label}>{isCoord ? 'Email' : 'Email or Roll Number'}</label>
            <div style={S.inputRow}>
              <User size={16} style={S.inputIcon} />
              <input
                style={S.input}
                type="text"
                placeholder={isCoord ? 'Enter your email' : 'Enter your email or roll number'}
                value={form.email}
                onChange={e => handleInputChange('email', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={S.label}>Password</label>
            <div style={S.inputRow}>
              <Lock size={16} style={S.inputIcon} />
              <input
                style={{ ...S.input, paddingRight: 42 }}
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => handleInputChange('password', e.target.value)}
                required
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={S.eyeBtn}>
                {showPw ? <EyeOff size={16} color="#aaa" /> : <Eye size={16} color="#aaa" />}
              </button>
            </div>
          </div>

          {/* Remember + Forgot */}
          <div style={S.rememberRow}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#555', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.remember} onChange={e => setForm({ ...form, remember: e.target.checked })} style={{ accentColor: '#6B4EFF', width: 14, height: 14 }} />
              Remember me
            </label>
            <button type="button" onClick={() => navigate('/forgot-password')} style={{ background: 'none', border: 'none', color: '#6B4EFF', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
              Forgot Password?
            </button>
          </div>

          {error && (
            <div style={{
              color: '#ef4444',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 13,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 4,
              marginBottom: 4,
              lineHeight: 1.4
            }}>
              <span>❌</span>
              <span>{error.startsWith('❌') ? error.replace(/^❌\s*/, '') : error}</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" style={isCoord ? S.btnLoginBlue : S.btnLoginPurple} disabled={loading}>
            <LogIn size={17} />
            {loading ? 'Signing in...' : isCoord ? 'Login as Coordinator' : 'Login as Student'}
          </button>
        </form>

        {/* OR divider */}
        <div style={S.divider}>
          <div style={S.divLine} /><span style={S.divText}>OR</span><div style={S.divLine} />
        </div>

        {/* Google */}
        <button style={S.googleBtn} type="button" onClick={() => {
          setLoading(true);
          window.location.href = '/auth/google';
        }} disabled={loading}>
          <GoogleIcon /> Continue with Google
        </button>

        {/* Create account (students only) / Admin message (coordinators) */}
        {isCoord ? (
          <div style={{
            margin: '16px 0 0',
            padding: '12px 14px',
            background: 'rgba(59,91,219,0.07)',
            border: '1px solid rgba(59,91,219,0.2)',
            borderRadius: 10,
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 12, color: '#3B5BDB', margin: 0, lineHeight: 1.6 }}>
              🏢 <strong>Coordinator accounts</strong> are managed by the Placement Cell Administrator.
              Please contact the Placement Cell for access.
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 13, color: '#777' }}>Don't have an account? </span>
            <Link to="/register" style={{ fontSize: 13, color: '#6B4EFF', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              Create Account <ArrowRight size={13} />
            </Link>
          </div>
        )}



        {/* Back */}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <button onClick={goBack} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: "'Inter', sans-serif" }}>
            <ArrowLeft size={13} /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Styles ─────────────────────────────────────────────────────────────
const FONT = "'Inter', -apple-system, sans-serif";

const S = {
  // ── Page wrapper (role select)
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(150deg, #f5f3ff 0%, #ede9ff 50%, #f0f4ff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    fontFamily: FONT,
  },

  // ── Main white card
  card: {
    position: 'relative',
    zIndex: 2,
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(24px)',
    borderRadius: 28,
    padding: '36px 44px 32px',
    maxWidth: 560,
    width: '100%',
    boxShadow: '0 12px 48px rgba(107,78,255,0.14), 0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid rgba(200,185,255,0.3)',
  },

  // ── Branding
  brandBlack: { fontSize: 28, fontWeight: 800, color: '#1a1a2e', fontFamily: FONT },
  brandPurple: { fontSize: 28, fontWeight: 800, color: '#6B4EFF', fontFamily: FONT },
  tagline: { textAlign: 'center', fontSize: 13, color: '#888', marginBottom: 18, marginTop: -2 },
  welcome: { textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#6B4EFF', marginBottom: 4 },
  chooseSub: { textAlign: 'center', fontSize: 13, color: '#777', marginBottom: 24 },

  // ── Role cards
  roleRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 },
  roleCard: {
    background: '#fff',
    borderRadius: 18,
    padding: '20px 16px 18px',
    textAlign: 'center',
    border: '1px solid #ede9ff',
    boxShadow: '0 4px 20px rgba(107,78,255,0.07)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  },
  avatarCirclePurple: {
    width: 90, height: 90, borderRadius: '50%',
    background: 'linear-gradient(135deg, #ede9ff, #ddd6fe)',
    overflow: 'hidden', marginBottom: 2,
    boxShadow: '0 4px 14px rgba(107,78,255,0.18)',
  },
  avatarCircleBlue: {
    width: 90, height: 90, borderRadius: '50%',
    background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
    overflow: 'hidden', marginBottom: 2,
    boxShadow: '0 4px 14px rgba(59,91,219,0.18)',
  },
  roleTitle: { fontSize: 15, fontWeight: 700, color: '#6B4EFF', margin: 0 },
  roleDesc: { fontSize: 12, color: '#777', lineHeight: 1.5, margin: 0, marginBottom: 4 },

  // ── Buttons
  btnPurple: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    width: '100%', padding: '11px 20px',
    background: 'linear-gradient(135deg, #6B4EFF, #5538EE)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontWeight: 600, fontSize: 13, cursor: 'pointer',
    fontFamily: FONT, boxShadow: '0 4px 14px rgba(107,78,255,0.3)',
    transition: 'all 0.2s',
  },
  btnBlue: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    width: '100%', padding: '11px 20px',
    background: 'linear-gradient(135deg, #3B5BDB, #2846C4)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontWeight: 600, fontSize: 13, cursor: 'pointer',
    fontFamily: FONT, boxShadow: '0 4px 14px rgba(59,91,219,0.3)',
    transition: 'all 0.2s',
  },

  // ── Login page
  loginPage: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24, position: 'relative', overflow: 'hidden', fontFamily: FONT,
  },
  bgImg: { position: 'fixed', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 },
  bgOverlay: {
    position: 'fixed', inset: 0, zIndex: 1,
    background: 'linear-gradient(135deg, rgba(107,78,255,0.60) 0%, rgba(59,91,219,0.50) 100%)',
  },
  loginCard: {
    position: 'relative', zIndex: 2,
    background: '#fff', borderRadius: 24,
    padding: '32px 36px', maxWidth: 420, width: '100%',
    boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
  },

  // ── Form elements
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#444', marginBottom: 6 },
  inputRow: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#bbb', pointerEvents: 'none' },
  input: {
    width: '100%', padding: '12px 14px 12px 40px',
    border: '1.5px solid #e5e0ff', borderRadius: 10,
    fontSize: 14, color: '#333', background: '#fafafa',
    fontFamily: FONT, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  eyeBtn: {
    position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', padding: 2,
  },
  rememberRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },

  // ── Login buttons
  btnLoginPurple: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #6B4EFF, #5538EE)',
    color: '#fff', border: 'none', borderRadius: 12,
    fontWeight: 700, fontSize: 15, cursor: 'pointer',
    fontFamily: FONT, boxShadow: '0 6px 20px rgba(107,78,255,0.35)',
    letterSpacing: 0.2,
  },
  btnLoginBlue: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '13px',
    background: 'linear-gradient(135deg, #3B5BDB, #2846C4)',
    color: '#fff', border: 'none', borderRadius: 12,
    fontWeight: 700, fontSize: 15, cursor: 'pointer',
    fontFamily: FONT, boxShadow: '0 6px 20px rgba(59,91,219,0.35)',
    letterSpacing: 0.2,
  },

  // ── OR divider
  divider: { display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' },
  divLine: { flex: 1, height: 1, background: '#eeecff' },
  divText: { fontSize: 12, color: '#bbb', fontWeight: 500 },

  // ── Google button
  googleBtn: {
    width: '100%', padding: '11px',
    background: '#fff', color: '#444',
    border: '1.5px solid #e5e0ff', borderRadius: 12,
    fontWeight: 600, fontSize: 14, cursor: 'pointer',
    fontFamily: FONT, display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 10,
  },
};
