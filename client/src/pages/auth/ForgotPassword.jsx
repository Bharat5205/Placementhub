import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services';

// ── Logo ──────────────────────────────────────────────────────────────────────
const PHLogo = ({ size = 48 }) => (
  <svg width={size} height={size} viewBox="0 0 52 52" fill="none">
    <rect width="52" height="52" rx="14" fill="url(#fpLogoGrad)" />
    <defs>
      <linearGradient id="fpLogoGrad" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop stopColor="#7C3AED" /><stop offset="1" stopColor="#4F46E5" />
      </linearGradient>
    </defs>
    <polygon points="26,12 42,21 26,30 10,21" fill="white" opacity="0.95" />
    <rect x="36" y="21" width="3" height="10" rx="1.5" fill="white" opacity="0.85" />
    <ellipse cx="37.5" cy="31" rx="3.5" ry="2" fill="white" opacity="0.85" />
    <text x="20" y="46" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="13" fill="white" opacity="0.9">P</text>
  </svg>
);

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Please enter your email address');

    setLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      {/* Subtle background blobs */}
      <div style={S.blob1} />
      <div style={S.blob2} />

      <div style={S.card}>
        {/* Logo + Branding */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <PHLogo size={52} />
          </div>
          <div>
            <span style={S.brandBlack}>Placement </span>
            <span style={S.brandPurple}>Hub</span>
          </div>
        </div>

        {submitted ? (
          /* ── Success State ── */
          <div style={{ textAlign: 'center' }}>
            <div style={S.successCircle}>
              <CheckCircle size={36} color="#22c55e" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 12 }}>
              Check your inbox
            </h2>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 28 }}>
              If an account exists for <strong style={{ color: '#6B4EFF' }}>{email}</strong>, a
              password reset link has been sent. The link expires in <strong>15 minutes</strong>.
            </p>
            <p style={{ fontSize: 13, color: '#999', marginBottom: 28, lineHeight: 1.6 }}>
              Didn't get it? Check your spam folder, or{' '}
              <button
                onClick={() => setSubmitted(false)}
                style={{ background: 'none', border: 'none', color: '#6B4EFF', fontWeight: 600, cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: 'inherit' }}
              >
                try again
              </button>.
            </p>
            <Link to="/login" style={S.backLink}>
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        ) : (
          /* ── Form State ── */
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={S.iconCircle}>
                <Mail size={24} color="#6B4EFF" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a2e', marginBottom: 8 }}>
                Forgot your password?
              </h2>
              <p style={{ fontSize: 14, color: '#777', lineHeight: 1.6 }}>
                No worries! Enter your email and we'll send you a reset link.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>Email Address</label>
                <div style={S.inputRow}>
                  <Mail size={16} style={S.inputIcon} />
                  <input
                    style={S.input}
                    type="email"
                    placeholder="your@college.edu"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <button type="submit" style={S.submitBtn} disabled={loading}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <span style={S.spinner} /> Sending...
                  </span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <Send size={16} /> Send Reset Link
                  </span>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 22 }}>
              <Link to="/login" style={S.backLink}>
                <ArrowLeft size={14} /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const FONT = "'Inter', -apple-system, sans-serif";

const S = {
  page: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 24, position: 'relative', overflow: 'hidden',
    background: 'linear-gradient(150deg, #f5f3ff 0%, #ede9ff 50%, #f0f4ff 100%)',
    fontFamily: FONT,
  },
  blob1: {
    position: 'absolute', top: -100, right: -100,
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(107,78,255,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', bottom: -80, left: -80,
    width: 320, height: 320, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(79,70,229,0.10) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 2,
    background: 'rgba(255,255,255,0.92)',
    backdropFilter: 'blur(24px)',
    borderRadius: 24, padding: '40px 44px',
    maxWidth: 440, width: '100%',
    boxShadow: '0 16px 48px rgba(107,78,255,0.14), 0 2px 8px rgba(0,0,0,0.04)',
    border: '1px solid rgba(200,185,255,0.3)',
  },
  brandBlack: { fontSize: 26, fontWeight: 800, color: '#1a1a2e', fontFamily: FONT },
  brandPurple: { fontSize: 26, fontWeight: 800, color: '#6B4EFF', fontFamily: FONT },
  iconCircle: {
    width: 60, height: 60, borderRadius: '50%',
    background: 'linear-gradient(135deg, #ede9ff, #ddd6fe)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 18px',
    boxShadow: '0 4px 14px rgba(107,78,255,0.18)',
  },
  successCircle: {
    width: 72, height: 72, borderRadius: '50%',
    background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 4px 18px rgba(34,197,94,0.2)',
  },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 8 },
  inputRow: { position: 'relative' },
  inputIcon: {
    position: 'absolute', left: 13, top: '50%',
    transform: 'translateY(-50%)', color: '#bbb', pointerEvents: 'none',
  },
  input: {
    width: '100%', padding: '13px 14px 13px 42px',
    border: '1.5px solid #e5e0ff', borderRadius: 12,
    fontSize: 14, color: '#333', background: '#fafafa',
    fontFamily: FONT, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  submitBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #6B4EFF, #5538EE)',
    color: '#fff', border: 'none', borderRadius: 12,
    fontWeight: 700, fontSize: 15, cursor: 'pointer',
    fontFamily: FONT, boxShadow: '0 6px 20px rgba(107,78,255,0.35)',
    letterSpacing: 0.2, transition: 'all 0.2s',
  },
  backLink: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    color: '#888', fontSize: 13, textDecoration: 'none',
    fontWeight: 500, transition: 'color 0.2s',
  },
  spinner: {
    display: 'inline-block',
    width: 16, height: 16, borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    animation: 'spin 0.7s linear infinite',
  },
};
