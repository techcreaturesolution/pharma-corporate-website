import Seo from '../components/Seo.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { PageHeader, Icon } from '../components/ui.jsx';
import { useSettings } from '../lib/hooks.js';

export default function Contact() {
  const { data } = useSettings();
  const contact = data?.data?.contact || {};
  const primary = contact.addresses?.[0];

  return (
    <>
      <Seo title="Contact Us" description="Get in touch with our sales, partnership or HR teams." />
      <PageHeader title="Contact Us" subtitle="We would love to hear from you." crumbs={[{ label: 'Contact' }]} />
      <section className="section">
        <div className="container contact-grid">
          <aside className="contact-info">
            {(contact.addresses || []).map((a, i) => (
              <div key={i} style={{ marginBottom: '1.5rem' }}>
                <h3>{a.label || 'Office'}</h3>
                <p>
                  <Icon name="pin" />
                  <span>{[a.line1, a.line2, a.city, a.state, a.postalCode, a.country].filter(Boolean).join(', ')}</span>
                </p>
                {a.phone && (
                  <p>
                    <Icon name="phone" /> <a href={`tel:${a.phone.replace(/\s/g, '')}`}>{a.phone}</a>
                  </p>
                )}
                {a.email && (
                  <p>
                    <Icon name="mail" /> <a href={`mailto:${a.email}`}>{a.email}</a>
                  </p>
                )}
              </div>
            ))}
            <h3>General</h3>
            {contact.email && (
              <p>
                <Icon name="mail" /> <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </p>
            )}
            {contact.salesEmail && (
              <p>
                <Icon name="mail" /> Sales: <a href={`mailto:${contact.salesEmail}`}>{contact.salesEmail}</a>
              </p>
            )}
            {contact.careersEmail && (
              <p>
                <Icon name="mail" /> Careers: <a href={`mailto:${contact.careersEmail}`}>{contact.careersEmail}</a>
              </p>
            )}
            {contact.phone && (
              <p>
                <Icon name="phone" /> <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>{contact.phone}</a>
              </p>
            )}
            {contact.workingHours && <p className="meta">{contact.workingHours}</p>}
            {primary?.mapEmbedUrl && <iframe className="map" src={primary.mapEmbedUrl} title="Location map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
          </aside>
          <div className="card">
            <h2>Send us a message</h2>
            <EnquiryForm type="general" endpoint="/contact" />
          </div>
        </div>
      </section>
    </>
  );
}
