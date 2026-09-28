import Inbox from './Inbox.jsx';
import { useApi } from '../lib/hooks.js';
import { api } from '../lib/api.js';
import { Icon } from '../components/ui.jsx';

const row = (label, value) =>
  value ? (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  ) : null;

/** Downloads the private resume via the authenticated API (never a public URL). */
const downloadResume = async (app) => {
  const res = await api.get(`/admin/applications/${app._id}/resume`, { responseType: 'blob' });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = app.resume?.originalName || 'resume';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export default function Applications() {
  const jobs = useApi('/careers', { limit: 100, includeAll: true });
  return (
    <Inbox
      title="Job applications"
      endpoint="/admin/applications"
      statuses={['received', 'in_review', 'shortlisted', 'interview', 'rejected', 'hired', 'archived']}
      filters={[{ name: 'jobId', label: 'Vacancy', options: (jobs.data?.data || []).map((j) => ({ value: j._id, label: j.title })) }]}
      columns={[
        { label: 'Candidate', render: (a) => a.name },
        { label: 'Vacancy', render: (a) => a.jobId?.title || '—' },
        { label: 'Email', render: (a) => <a href={`mailto:${a.email}`}>{a.email}</a> },
        { label: 'Phone', render: (a) => a.phone || '—' },
        { label: 'Experience', render: (a) => a.experience || '—' },
      ]}
      renderDetail={(a) => (
        <>
          {row('Vacancy', a.jobId ? `${a.jobId.title}${a.jobId.location ? ` — ${a.jobId.location}` : ''}` : null)}
          {row('Email', <a href={`mailto:${a.email}`}>{a.email}</a>)}
          {row('Phone', a.phone)}
          {row('Qualification', a.qualification)}
          {row('Experience', a.experience)}
          {row('Cover letter', a.coverLetter)}
          {row('Resume', a.resume ? `${a.resume.originalName} (${Math.round((a.resume.size || 0) / 1024)} KB)` : null)}
          {row('Consent', a.consent ? 'Given' : 'Not recorded')}
        </>
      )}
      extraActions={(a) => (
        <button type="button" className="btn btn--outline btn--sm" onClick={() => downloadResume(a).catch(() => window.alert('Unable to download resume'))}>
          <Icon name="download" /> Download resume
        </button>
      )}
    />
  );
}
