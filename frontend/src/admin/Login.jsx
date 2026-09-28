import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../lib/auth.jsx';
import { Field, Alert, Loader } from '../components/ui.jsx';
import { parseError } from '../lib/api.js';

export default function Login() {
  const { user, loading, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
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

  return (
    <div className="login">
      <Helmet>
        <title>Admin login</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <form className="card form" onSubmit={submit}>
        <h1 style={{ fontSize: '1.5rem' }}>Admin sign in</h1>
        <Alert type="error">{error}</Alert>
        <Field label="Email" name="email" required>
          <input id="email" type="email" autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </Field>
        <Field label="Password" name="password" required>
          <input id="password" type="password" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </Field>
        <button className="btn btn--primary" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="muted" style={{ fontSize: '.85rem', margin: 0 }}>
          Access is restricted to authorised staff. Accounts are provisioned by an administrator.
        </p>
      </form>
    </div>
  );
}
