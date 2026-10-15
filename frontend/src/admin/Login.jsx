import { useState } from 'react';
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../lib/auth.jsx';
import { Field, Alert, Loader, Img } from '../components/ui.jsx';
import { parseError } from '../lib/api.js';
import { useSettings, useFavicon } from '../lib/hooks.js';

export default function Login() {
  const { data: settingsData } = useSettings();
  const company = settingsData?.data?.company || {};
  useFavicon(company.favicon?.url);

  const { user, loading, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) return <Loader full />;
  if (user) return <Navigate to={location.state?.from?.pathname || '/admin'} replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setBusy(false);
    }
  };

  const brandTitle = company.navTitle || company.name || 'BioPharma Care';
  const brandSubtitle = company.navSmallText || 'Farma Suiticals';
  const brandTagline = company.tagline || 'Quality-driven pharmaceutical manufacturing';

  return (
    <div className="login">
      <Helmet>
        <title>Admin login | {brandTitle}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Flowing Green Liquid Wave Animation Background (Half Page - Solid Uniform #1AA849, No Gradient) */}
      <div className="login__liquid-bg" aria-hidden="true">
        {/* Back Liquid Wave (Uniform #1AA849) */}
        <div className="login__wave-track login__wave-track--back">
          <svg className="login__wave-svg" viewBox="0 0 2000 400" preserveAspectRatio="none">
            <path
              d="M 0,55 C 250,110 250,-5 500,55 C 750,110 750,-5 1000,55 C 1250,110 1250,-5 1500,55 C 1750,110 1750,-5 2000,55 V 400 H 0 Z"
              fill="#1AA849"
            />
          </svg>
        </div>

        {/* Middle Liquid Wave (Uniform #1AA849) */}
        <div className="login__wave-track login__wave-track--middle">
          <svg className="login__wave-svg" viewBox="0 0 2000 400" preserveAspectRatio="none">
            <path
              d="M 0,80 C 180,140 320,20 500,80 C 680,140 820,20 1000,80 C 1180,140 1320,20 1500,80 C 1680,140 1820,20 2000,80 V 400 H 0 Z"
              fill="#1AA849"
            />
          </svg>
        </div>

        {/* Front Main Liquid Wave (Solid 100% Uniform #1AA849, No Gradient) */}
        <div className="login__wave-track login__wave-track--front">
          <svg className="login__wave-svg" viewBox="0 0 2000 400" preserveAspectRatio="none">
            <path
              d="M 0,70 C 250,5 250,135 500,70 C 750,5 750,135 1000,70 C 1250,5 1250,135 1500,70 C 1750,5 1750,135 2000,70 V 400 H 0 Z"
              fill="#1AA849"
            />
          </svg>
        </div>

        {/* Rising Effervescent Water Bubbles */}
        <span className="login__bubble bubble-1" />
        <span className="login__bubble bubble-2" />
        <span className="login__bubble bubble-3" />
        <span className="login__bubble bubble-4" />
        <span className="login__bubble bubble-5" />
        <span className="login__bubble bubble-6" />
        <span className="login__bubble bubble-7" />
      </div>

      <div className="login__card">
        {/* Left Div: Centered Company Logo and Titles */}
        <div className="login__left">
          <div className="login__left-center">
            <Link to="/" className="login__brand-center" title="Return to website">
              <div className="login__logo-wrapper">
                {company.logo?.url ? (
                  <Img image={company.logo} alt={company.name || 'Logo'} className="login__logo" fallback="/logoiconPH.png" />
                ) : (
                  <img src="/logoiconPH.png" alt="Logo" className="login__logo" />
                )}
              </div>
              <div className="login__brand-titles">
                <span className="login__brand-name">{brandTitle}</span>
                {brandSubtitle && <span className="login__brand-subtitle">{brandSubtitle}</span>}
              </div>
            </Link>
          </div>
        </div>

        {/* Right Div: Form & Input fields */}
        <div className="login__right">
          <form className="login__form" onSubmit={submit}>
            <div className="login__header">
              <h1>Admin sign in</h1>
              <p className="login__subtitle">Enter your corporate credentials to access the administrative dashboard.</p>
            </div>

            <Alert type="error">{error}</Alert>

            <Field label="Email" name="email" required>
              <input
                id="email"
                type="email"
                autoComplete="username"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@example.com"
                required
              />
            </Field>

            <Field label="Password" name="password" required>
              <div className="login__password-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="login__password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </Field>

            <button className="btn btn--primary login__btn" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>

            <p className="login__security-note">
              Access is restricted to authorised staff. Accounts are provisioned by an administrator.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
