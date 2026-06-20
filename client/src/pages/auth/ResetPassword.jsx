import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services';

// ── Logo ──────────────────────────────────────────────────────────────────────
const PHLogo = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="14" fill="url(#rpLogoGrad)" />
    <defs>
      <linearGradient id="rpLogoGrad" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7C3AED" /><stop offset="1" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    <polygon points="26,12 42,21 26,30 10,21" fill="white" opacity="0.95" />
    <rect x="36" y="21" width="3" height="10" rx="1.5" fill="white" opacity="0.85" />
    <ellipse cx="37.5" cy="31" rx="3.5" ry="2" fill="white" opacity="0.85" />
    <text x="20" y="46" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="13" fill="white" opacity="0.9">P</text>
  </svg>
);

// ── Password Strength Analyser ────────────────────────────────────────────────
function analyseStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '#ddd' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { label: 'Too short', color: '#ef4444' },
    { label: 'Weak',      color: '#f97316' },
    { label: 'Fair',      color: '#eab308' },
    { label: 'Good',      color: '#84cc16' },
    { label: 'Strong',    color: '#22c55e' },
    { label: 'Very strong', color: '#10b981' },
  ];
  return { score, ...levels[score] };
}

function StrengthBar({ password }) {
  const { score, label, color } = useMemo(() => analyseStrength(password), [password]);
  if (!password) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            style={{
              flex: 1, height: 4, borderRadius: 4,
              background: i <= score ? color : '#e5e0ff',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      <p style={{ fontSize: 12, color, fontWeight: 600, margin: 0, transition: 'color 0.3s' }}>
        {label}
      </p>
    </div>
  );
}

// ── Validation rule list ──────────────────────────────────────────────────────
const RULES = [
  { test: (pw) => pw.length >= 8,              label: 'At least 8 characters' },
  { test: (pw) => /[A-Z]/.test(pw),            label: 'One uppercase letter' },
  { test: (pw) => /[0-9]/.test(pw),            label: 'One number' },
  { test: (pw) => /[^A-Za-z0-9]/.test(pw),    label: 'One special character (optional)' },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = useMemo(() => analyseStrength(form.password), [form.password]);
  const passwordsMatch = form.password && form.confirm && form.password === form.confirm;
  const passwordMismatch = form.confirm && form.password !== form.confirm;

  // If no token in URL — show invalid link state
  if (!token) {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...S.iconCircle, background: 'linear-gradient(135deg,#fee2e2,#fecaca)' }}>
              <AlertTriangle size={28} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 10 }}>
              Invalid Reset Link
            </h2>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 24 }}>
              This password reset link is invalid or has already expired.
              Please request a new one.
            </p>
            <Link to="/forgot-password" style={S.submitBtn}>
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (strength.score < 2) return toast.error('Please choose a stronger password');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await authService.resetPassword({ token, password: form.password });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // ── Success State ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={S.page}>
        <div style={{ ...S.blob1 }} />
        <div style={{ ...S.blob2 }} />
        <div style={S.card}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...S.iconCircle, background: 'linear-gradient(135deg,#dcfce7,#bbf7d0)' }}>
              <CheckCircle size={32} color="#22c55e" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 10 }}>
              Password Reset!
            </h2>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 24 }}>
              Your password has been updated successfully.
              You'll be redirected to the login page in a moment…
            </p>
            <Link to="/login" style={{ ...S.submitBtn, textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Form ─────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <div style={S.blob1} />
      <div style={S.blob2} />

      <div style={S.card}>
        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <PHLogo size={52} />
          </div>
          <div>
            <span style={S.brandBlack}>Placement </span>
            <span style={S.brandPurple}>Hub</span>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={S.iconCircle}>
            <Lock size={24} color="#6B4EFF" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>
            Set New Password
          </h2>
          <p style={{ fontSize: 14, color: '#777', lineHeight: 1.6 }}>
            Choose a strong password for your account.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={S.label}>New Password</label>
            <div style={S.inputRow}>
              <Lock size={16} style={S.inputIcon} />
              <input
                style={S.input}
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                autoFocus
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={S.eyeBtn}>
                {showPw ? <EyeOff size={16} color="#aaa" /> : <Eye size={16} color="#aaa" />}
              </button>
            </div>
            <StrengthBar password={form.password} />

            {/* Validation rules */}
            {form.password && (
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {RULES.map(rule => (
                  <li key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12 }}>
                    <span style={{ color: rule.test(form.password) ? '#22c55e' : '#ddd', fontSize: 14, lineHeight: 1 }}>
                      {rule.test(form.password) ? '✓' : '○'}
                    </span>
                    <span style={{ color: rule.test(form.password) ? '#15803d' : '#999' }}>
                      {rule.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: 28 }}>
            <label style={S.label}>Confirm Password</label>
            <div style={S.inputRow}>
              <Lock size={16} style={S.inputIcon} />
              <input
                style={{
                  ...S.input,
                  borderColor: passwordMismatch ? '#ef4444' : passwordsMatch ? '#22c55e' : '#e5e0ff',
                }}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={form.confirm}
                onChange={e => setForm({ ...form, confirm: e.target.value })}
                required
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={S.eyeBtn}>
                {showConfirm ? <EyeOff size={16} color="#aaa" /> : <Eye size={16} color="#aaa" />}
              </button>
            </div>
            {passwordMismatch && (
              <p style={{ fontSize: 12, color: '#ef4444', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <AlertTriangle size={12} /> Passwords do not match
              </p>
            )}
            {passwordsMatch && (
              <p style={{ fontSize: 12, color: '#22c55e', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle size={12} /> Passwords match
              </p>
            )}
          </div>

          <button
            type="submit"
            style={{ ...S.submitBtn, opacity: loading ? 0.8 : 1 }}
            disabled={loading || passwordMismatch}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span style={S.spinner} /> Resetting…
              </span>
            ) : 'Reset Password'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/login" style={S.backLink}>← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const FONT = "'Inter', -apple-system, sans-serif";
const S = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24, position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(150deg, #f5f3ff 0%, #ede9ff 50%, #f0f4ff 100%)',
    fontFamily: FONT,
  },
  blob1: {
    position: 'absolute', top: -100, right: -100, width: 400, height: 400,
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(107,78,255,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: -80, left: -80, width: 320, height: 320,
    borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.10) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 2,
    background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)',
    borderRadius: 24, padding: '40px 44px', maxWidth: 460, width: '100%',
    boxShadow: '0 16px 48px rgba(107,78,255,0.14), 0 2px 8px rgba(0,0,0,0.04)',
    border: '1px solid rgba(200,185,255,0.3)',
  },
  brandBlack: { fontSize: 26, fontWeight: 800, color: '#1a1a2e', fontFamily: FONT },
  brandPurple: { fontSize: 26, fontWeight: 800, color: '#6B4EFF', fontFamily: FONT },
  iconCircle: {
    width: 62, height: 62, borderRadius: '50%',
    background: 'linear-gradient(135deg, #ede9ff, #ddd6fe)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 18px', boxShadow: '0 4px 14px rgba(107,78,255,0.18)',
  },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 8 },
  inputRow: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#bbb', pointerEvents: 'none' },
  input: {
    width: '100%', padding: '13px 42px', border: '1.5px solid #e5e0ff', borderRadius: 12,
    fontSize: 14, color: '#333', background: '#fafafa', fontFamily: FONT,
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  },
  eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 },
  submitBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #6B4EFF, #5538EE)',
    color: '#fff', border: 'none', borderRadius: 12,
    fontWeight: 700, fontSize: 15, cursor: 'pointer',
    fontFamily: FONT, boxShadow: '0 6px 20px rgba(107,78,255,0.35)',
    letterSpacing: 0.2, transition: 'all 0.2s',
  },
  backLink: { color: '#888', fontSize: 13, textDecoration: 'none', fontWeight: 500 },
  spinner: {
    display: 'inline-block', width: 16, height: 16, borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
    animation: 'spin 0.7s linear infinite',
  },
};
