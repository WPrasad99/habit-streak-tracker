// src/pages/LoginPage.jsx
// Final design matching the new reference:
// Dark outer shell, two separate rounded panels with a gap.
// Left: image with a frosted glass feature card at the bottom.
// Right: white form panel.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { IANA_TIMEZONES } from '../utils/timezones.js';

/* ── Google SVG ─────────────────────────────────────────────────────────────── */
function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

/* ── Eye icon ───────────────────────────────────────────────────────────────── */
function EyeIcon({ open }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {open
        ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  );
}

export default function LoginPage() {
  const [isLogin, setIsLogin]   = useState(true);
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  );
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body     = isLogin ? { email, password } : { email, password, timezone };
      const { data } = await api.post(endpoint, body);
      login(data.token, data.user);
      navigate('/habits');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  }

  function toggle() { setIsLogin(v => !v); setError(''); }

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: "'Inter', system-ui, sans-serif",
      background: '#F3F4F6',
    }}>

      {/* ════ IMAGE PANEL (SLIDES) ═════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        top: 24, bottom: 24,
        width: '45%',
        left: isLogin ? '24px' : 'calc(100% - 45% - 24px)',
        transition: 'left 0.9s cubic-bezier(0.65, 0, 0.35, 1)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none'
      }}>
        <img
          src="/login_img.png"
          alt="HabitStreak App"
          style={{
            width: '125%', 
            height: '125%',
            maxWidth: '125%',
            objectFit: 'contain',
            transform: 'translateX(12%) scale(1.05)',
            filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.5))',
          }}
        />
      </div>

      {/* ════ FORM PANEL (SLIDES) ══════════════════════════════════════ */}
      <div style={{
        position: 'absolute',
        top: 24, bottom: 24,
        width: '50%',
        left: isLogin ? 'calc(100% - 50% - 24px)' : '24px',
        transition: 'left 0.9s cubic-bezier(0.65, 0, 0.35, 1)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 20px',
      }}>
        <div style={{ 
          width: '100%', 
          maxWidth: 520, 
          margin: '0 auto', 
          border: '2px solid #111', 
          borderRadius: '24px', 
          padding: '24px 32px' 
        }}>

          {/* Uppercase heavy heading */}
          <h1 style={{
            margin: '0 0 8px',
            fontSize: '2rem',
            fontWeight: 900,
            color: '#111111',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
          }}>
            {isLogin
              ? 'YOUR GATEWAY TO SEAMLESS HABITS'
              : 'START YOUR HABIT JOURNEY TODAY'}
          </h1>

          {/* Subtitle */}
          <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.65 }}>
            {isLogin
              ? 'Ready to streamline your workflow? Log in now and let HabitStreak take you there. Your next goal is just a click away!'
              : 'Join HabitStreak and start tracking your daily habits. Build consistency and become the best version of yourself.'}
          </p>

          {/* Error */}
          {error && (
            <div style={{ background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: 8, color: '#B91C1C', fontSize: '0.875rem', padding: '10px 14px', marginBottom: 12, lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Email */}
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="f-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111', marginBottom: 6 }}>
                Email
              </label>
              <input
                id="f-email"
                type="email"
                placeholder="Input email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{
                  width: '100%', height: 48,
                  border: '1.5px solid #E5E7EB',
                  borderRadius: 8, padding: '0 16px',
                  fontSize: '0.9375rem', color: '#111',
                  outline: 'none', background: '#fff',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                  transition: 'border-color 0.18s',
                }}
                onFocus={e => e.target.style.borderColor = '#111'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="f-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="f-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  style={{
                    width: '100%', height: 48,
                    border: '1.5px solid #E5E7EB',
                    borderRadius: 8, padding: '0 48px 0 16px',
                    fontSize: '0.9375rem', color: '#111',
                    outline: 'none', background: '#fff',
                    fontFamily: 'inherit', boxSizing: 'border-box',
                    transition: 'border-color 0.18s',
                  }}
                  onFocus={e => e.target.style.borderColor = '#111'}
                  onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  <EyeIcon open={showPass} />
                </button>
              </div>
            </div>

            {/* Timezone (register only) */}
            {!isLogin && (
              <div style={{ marginBottom: 12 }}>
                <label htmlFor="f-tz" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111', marginBottom: 6 }}>
                  Your Timezone
                </label>
                <select
                  id="f-tz"
                  value={timezone}
                  onChange={e => setTimezone(e.target.value)}
                  required
                  style={{
                    width: '100%', height: 48,
                    border: '1.5px solid #E5E7EB',
                    borderRadius: 8, padding: '0 16px',
                    fontSize: '0.9375rem', color: '#111',
                    outline: 'none', background: '#fff',
                    fontFamily: 'inherit', boxSizing: 'border-box',
                    appearance: 'none',
                  }}
                >
                  {IANA_TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                </select>
              </div>
            )}

            {/* Toggle Link */}
            <p style={{ margin: '0 0 12px', fontSize: '0.875rem', color: '#6B7280' }}>
              {isLogin ? 'New to HabitStreak? ' : 'Already have an account? '}
              <button id="btn-auth-toggle" type="button" onClick={toggle}
                style={{ background: 'none', border: 'none', color: '#111', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', fontFamily: 'inherit', padding: 0, textDecoration: 'underline' }}>
                {isLogin ? 'Create an Account' : 'Sign in'}
              </button>
            </p>

            {/* Remember / Forgot row */}
            {isLogin ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: '#6B7280', cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{ width: 16, height: 16, accentColor: '#111', cursor: 'pointer', borderRadius: 4, border: '1px solid #D1D5DB' }} />
                  Remember me
                </label>
                <span style={{ fontSize: '0.875rem', color: '#111', fontWeight: 700, cursor: 'pointer' }}>Forgot your password?</span>
              </div>
            ) : (
              <div style={{ height: 4 }} />
            )}

            {/* Submit — Dark Navy/Black button */}
            <button
              id="btn-auth-submit"
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 48,
                background: '#15192C', color: '#FFFFFF',
                border: 'none', borderRadius: 8,
                fontSize: '0.9375rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', letterSpacing: '0.01em',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 10, marginBottom: 16,
                opacity: loading ? 0.7 : 1,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#252940'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#15192C'; }}
            >
              {loading
                ? <span style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                : isLogin
                  ? 'Login - Continue Working'
                  : 'Create Account - Start Working'
              }
            </button>
          </form>

          {/* "Or" divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
            <span style={{ fontSize: '0.875rem', color: '#9CA3AF' }}>Or</span>
            <div style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          </div>

          {/* Google button */}
          <button
            id="btn-google"
            type="button"
            onClick={() => setError('Social login not available. Please use email + password.')}
            style={{
              width: '100%', height: 48,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              border: '1px solid #E5E7EB', borderRadius: 8,
              background: '#fff', cursor: 'pointer',
              fontSize: '0.9375rem', fontWeight: 700, color: '#374151',
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <GoogleLogo />
            Sign in with Google
          </button>

        </div>
      </div>
    </div>
  );
}
