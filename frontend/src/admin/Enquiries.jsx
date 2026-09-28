import Inbox from './Inbox.jsx';

const row = (label, value) =>
  value ? (
    <>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </>
  ) : null;

export default function Enquiries() {
  return (
    <Inbox
      title="Enquiries"
      endpoint="/admin/enquiries"
      statuses={['new', 'in_progress', 'responded', 'closed', 'spam']}
      filters={[{ name: 'type', label: 'Type', options: ['product', 'general', 'partnership', 'career'] }]}
      columns={[
        { label: 'Name', render: (e) => e.name },
        { label: 'Company', render: (e) => e.company || '—' },
        { label: 'Type', render: (e) => e.type },
        { label: 'Product / Subject', render: (e) => e.productName || e.subject || '—' },
        { label: 'Email', render: (e) => <a href={`mailto:${e.email}`}>{e.email}</a> },
      ]}
      renderDetail={(e) => (
        <>
          {row('Type', e.type)}
          {row('Company', e.company)}
          {row('Email', <a href={`mailto:${e.email}`}>{e.email}</a>)}
          {row('Phone', e.phone)}
          {row('Country', e.country)}
          {row('Product', e.productName)}
          {row('Quantity', e.quantity)}
          {row('Subject', e.subject)}
          {row('Message', e.message)}
          {row('Source page', e.sourcePage)}
          {row('Consent', e.consent ? 'Given' : 'Not recorded')}
          {row('Email notification', e.emailSent ? 'Sent' : 'Not sent / pending')}
        </>
      )}
    />
  );
}
