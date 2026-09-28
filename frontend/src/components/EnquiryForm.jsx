import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { post, parseError } from '../lib/api.js';
import { Field, Alert } from './ui.jsx';

const initial = { name: '', company: '', email: '', phone: '', country: '', subject: '', quantity: '', message: '', consent: false, website: '' };

/**
 * Shared form for product enquiries (type=product, needs productId) and general contact.
 * Includes honeypot field; reCAPTCHA token can be injected via `getCaptchaToken`.
 */
export default function EnquiryForm({ type = 'general', product, endpoint = '/enquiries', getCaptchaToken }) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, success: null, error: null });
  const { pathname } = useLocation();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: null, error: null });
    setErrors({});
    try {
      const captchaToken = getCaptchaToken ? await getCaptchaToken() : undefined;
      const payload = { ...form, type, sourcePage: pathname, captchaToken };
      if (product) payload.productId = product._id;
      Object.keys(payload).forEach((k) => (payload[k] === '' || payload[k] === undefined) && delete payload[k]);
      const res = await post(endpoint, payload);
      setStatus({ loading: false, success: res.message, error: null });
      setForm(initial);
      window.dataLayer?.push({ event: 'enquiry_submitted', enquiry_type: type });
    } catch (err) {
      const { message, errors: fieldErrors } = parseError(err);
      setErrors(fieldErrors);
      setStatus({ loading: false, success: null, error: message });
    }
  };

  return (
    <form className="form form--2" onSubmit={submit} noValidate>
      <Alert type="success">{status.success}</Alert>
      <Alert type="error">{status.error}</Alert>
      {product && (
        <div className="full">
          <Alert type="info">
            Enquiring about: <strong>{product.name}</strong> {product.productCode && `(${product.productCode})`}
          </Alert>
        </div>
      )}
      <Field label="Full name" name="name" required error={errors.name}>
        <input id="name" value={form.name} onChange={set('name')} required autoComplete="name" />
      </Field>
      <Field label="Company" name="company" required={type === 'product'} error={errors.company}>
        <input id="company" value={form.company} onChange={set('company')} autoComplete="organization" />
      </Field>
      <Field label="Email" name="email" required error={errors.email}>
        <input id="email" type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
      </Field>
      <Field label="Phone" name="phone" error={errors.phone}>
        <input id="phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
      </Field>
      <Field label="Country" name="country" error={errors.country}>
        <input id="country" value={form.country} onChange={set('country')} autoComplete="country-name" />
      </Field>
      {type === 'product' ? (
        <Field label="Required quantity" name="quantity" error={errors.quantity} hint="e.g. 50 kg / month">
          <input id="quantity" value={form.quantity} onChange={set('quantity')} />
        </Field>
      ) : (
        <Field label="Subject" name="subject" error={errors.subject}>
          <input id="subject" value={form.subject} onChange={set('subject')} />
        </Field>
      )}
      <div className="full">
        <Field label="Message" name="message" required error={errors.message}>
          <textarea id="message" value={form.message} onChange={set('message')} required />
        </Field>
      </div>
      <div className="honeypot" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
      </div>
      <div className="full">
        <Field name="consent" error={errors.consent} label="">
          <label className="checkbox">
            <input id="consent" type="checkbox" checked={form.consent} onChange={set('consent')} />
            <span>
              I agree to the processing of my data in accordance with the <a href="/privacy-policy">Privacy Policy</a>. *
            </span>
          </label>
        </Field>
      </div>
      <div className="full">
        <button type="submit" className="btn btn--primary" disabled={status.loading}>
          {status.loading ? 'Sending…' : type === 'product' ? 'Send product enquiry' : 'Send message'}
        </button>
      </div>
    </form>
  );
}
