import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { patch, parseError } from '../lib/api.js';
import { Field, Alert } from '../components/ui.jsx';

export default function Profile() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (form.newPassword !== form.confirm) return setErrors({ confirm: 'Passwords do not match' });
    try {
      await patch('/auth/change-password', { currentPassword: form.currentPassword, newPassword: form.newPassword });
      setMsg({ type: 'success', text: 'Password changed. Please sign in again.' });
      await logout();
      navigate('/admin/login');
    } catch (err) {
      const p = parseError(err);
      setErrors(p.errors);
      setMsg({ type: 'error', text: p.message });
    }
  };

  return (
    <>
      <h1 className="mb">My account</h1>
      <div className="two-col">
        <div className="panel">
          <dl className="detail-grid">
            <dt>Name</dt>
            <dd>{user.name}</dd>
            <dt>Email</dt>
            <dd>{user.email}</dd>
            <dt>Role</dt>
            <dd>{user.role}</dd>
          </dl>
        </div>
        <form className="panel form" onSubmit={submit}>
          <h3>Change password</h3>
          {msg && <Alert type={msg.type}>{msg.text}</Alert>}
          <Field label="Current password" name="currentPassword" required error={errors.currentPassword}>
            <input id="currentPassword" type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required />
          </Field>
          <Field label="New password" name="newPassword" required error={errors.newPassword} hint="Min 10 chars, 1 uppercase, 1 number">
            <input id="newPassword" type="password" autoComplete="new-password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
          </Field>
          <Field label="Confirm new password" name="confirm" required error={errors.confirm}>
            <input id="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          </Field>
          <button className="btn btn--primary btn--sm">Change password</button>
        </form>
      </div>
    </>
  );
}
