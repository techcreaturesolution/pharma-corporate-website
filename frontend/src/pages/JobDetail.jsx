import { useState } from 'react';
import { useParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import { Loader, ErrorState, PageHeader, RichHtml, Field, Alert } from '../components/ui.jsx';
import { useApi, formatDate } from '../lib/hooks.js';
import { post, parseError } from '../lib/api.js';
import NotFound from './NotFound.jsx';

const initial = { name: '', email: '', phone: '', qualification: '', experience: '', coverLetter: '', consent: false };

export default function JobDetail() {
  const { slug } = useParams();
  const { data, isLoading, isError, error } = useApi(`/careers/${slug}`);
  const [form, setForm] = useState(initial);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, success: null, error: null });

  if (isLoading) return <Loader full />;
  if (isError) return error?.response?.status === 404 ? <NotFound /> : <ErrorState error={error} />;
  const job = data.data;
  const closed = job.closingDate && new Date(job.closingDate) < new Date();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!file) return setErrors({ resume: 'Please attach your resume (PDF, DOC or DOCX)' });
    setStatus({ loading: true, success: null, error: null });
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v !== '' && fd.append(k, v));
    fd.append('resume', file);
    try {
      const res = await post(`/careers/${job._id}/applications`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStatus({ loading: false, success: res.message, error: null });
      setForm(initial);
      setFile(null);
      e.target.reset();
    } catch (err) {
      const parsed = parseError(err);
      setErrors(parsed.errors);
      setStatus({ loading: false, success: null, error: parsed.message });
    }
  };

  return (
    <>
      <Seo
        title={job.title}
        description={`${job.title}${job.location ? ` — ${job.location}` : ''}. ${job.employmentType}. Apply online.`}
        seo={job.seo}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: job.title,
          datePosted: job.createdAt,
          validThrough: job.closingDate || undefined,
          employmentType: job.employmentType?.toUpperCase().replace('-', '_'),
          description: job.description,
          jobLocation: job.location ? { '@type': 'Place', address: job.location } : undefined,
        }}
      />
      <PageHeader title={job.title} subtitle={[job.department, job.location, job.employmentType, job.experience].filter(Boolean).join(' · ')} crumbs={[{ label: 'Careers', to: '/careers' }, { label: job.title }]} />
      <section className="section">
        <div className="container split" style={{ alignItems: 'start' }}>
          <div>
            {job.closingDate && <p className="meta">Applications close {formatDate(job.closingDate)}</p>}
            {job.qualification && (
              <p>
                <strong>Qualification:</strong> {job.qualification}
              </p>
            )}
            <RichHtml html={job.description} />
            {job.responsibilities?.length > 0 && (
              <>
                <h3>Responsibilities</h3>
                <ul>
                  {job.responsibilities.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </>
            )}
            {job.requirements?.length > 0 && (
              <>
                <h3>Requirements</h3>
                <ul>
                  {job.requirements.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="card" id="apply">
            <h2>Apply for this position</h2>
            {closed ? (
              <Alert type="info">Applications for this vacancy have closed.</Alert>
            ) : (
              <form className="form" onSubmit={submit} noValidate>
                <Alert type="success">{status.success}</Alert>
                <Alert type="error">{status.error}</Alert>
                <Field label="Full name" name="name" required error={errors.name}>
                  <input id="name" value={form.name} onChange={set('name')} required autoComplete="name" />
                </Field>
                <Field label="Email" name="email" required error={errors.email}>
                  <input id="email" type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
                </Field>
                <Field label="Phone" name="phone" error={errors.phone}>
                  <input id="phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" />
                </Field>
                <Field label="Highest qualification" name="qualification" error={errors.qualification}>
                  <input id="qualification" value={form.qualification} onChange={set('qualification')} />
                </Field>
                <Field label="Total experience" name="experience" error={errors.experience} hint="e.g. 3 years">
                  <input id="experience" value={form.experience} onChange={set('experience')} />
                </Field>
                <Field label="Cover letter" name="coverLetter" error={errors.coverLetter}>
                  <textarea id="coverLetter" value={form.coverLetter} onChange={set('coverLetter')} />
                </Field>
                <Field label="Resume" name="resume" required error={errors.resume} hint="PDF, DOC or DOCX, max 10 MB">
                  <input id="resume" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFile(e.target.files[0] || null)} required />
                </Field>
                <Field name="consent" error={errors.consent} label="">
                  <label className="checkbox">
                    <input id="consent" type="checkbox" checked={form.consent} onChange={set('consent')} />
                    <span>
                      I consent to my personal data and resume being processed for recruitment purposes as described in the <a href="/privacy-policy">Privacy Policy</a>. *
                    </span>
                  </label>
                </Field>
                <button className="btn btn--primary" type="submit" disabled={status.loading}>
                  {status.loading ? 'Submitting…' : 'Submit application'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
