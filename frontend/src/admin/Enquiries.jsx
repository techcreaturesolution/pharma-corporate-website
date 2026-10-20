import Inbox from './Inbox.jsx';
import { Icon } from '../components/ui.jsx';

/** Helper to extract 2-letter uppercase initials */
const getInitials = (name) => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/** Type badge configuration map */
const TYPE_CONFIG = {
  product: { label: 'Product RFQ', icon: 'box', cls: 'inbox-type-badge--product' },
  partnership: { label: 'Partnership', icon: 'globe', cls: 'inbox-type-badge--partnership' },
  career: { label: 'Career', icon: 'user', cls: 'inbox-type-badge--career' },
  general: { label: 'General', icon: 'mail', cls: 'inbox-type-badge--general' },
};

export default function Enquiries() {
  return (
    <Inbox
      title="Enquiries"
      subtitle="Review customer inquiries, product RFQs, distributor queries, and commercial partnerships."
      endpoint="/admin/enquiries"
      statuses={['new', 'in_progress', 'responded', 'closed', 'spam']}
      filters={[{ name: 'type', label: 'Type', options: ['product', 'general', 'partnership', 'career'] }]}
      columns={[
        {
          label: 'Client Name',
          render: (e) => (
            <div className="inbox-client-cell">
              <div className="inbox-client-avatar">
                {getInitials(e.name)}
              </div>
              <div className="inbox-client-info">
                <span className="inbox-client-name">{e.name}</span>
                {e.country && <span className="inbox-client-meta">{e.country}</span>}
              </div>
            </div>
          ),
        },
        {
          label: 'Company',
          render: (e) =>
            e.company ? (
              <div className="inbox-company-cell" title={e.company}>
                <Icon name="briefcase" className="inbox-company-icon" />
                <span>{e.company}</span>
              </div>
            ) : (
              <span className="admin-table__muted-dash">—</span>
            ),
        },
        {
          label: 'Inquiry Type',
          render: (e) => {
            const conf = TYPE_CONFIG[e.type] || { label: e.type || 'General', icon: 'mail', cls: 'inbox-type-badge--general' };
            return (
              <span className={`inbox-type-badge ${conf.cls}`}>
                <Icon name={conf.icon} style={{ width: 12, height: 12 }} />
                <span>{conf.label}</span>
              </span>
            );
          },
        },
        {
          label: 'Product / Subject',
          render: (e) => {
            if (e.productName) {
              return (
                <div className="inbox-product-tag-wrap">
                  <span className="inbox-product-tag">
                    <Icon name="flask" style={{ width: 12, height: 12 }} />
                    <span>{e.productName}</span>
                  </span>
                  {e.quantity && <span className="inbox-qty-badge">Qty: {e.quantity}</span>}
                </div>
              );
            }
            if (e.subject) {
              return (
                <span className="inbox-subject-text" title={e.subject}>
                  {e.subject}
                </span>
              );
            }
            return <span className="admin-table__muted-dash">—</span>;
          },
        },
        {
          label: 'Email & Contact',
          render: (e) => (
            <a
              href={`mailto:${e.email}`}
              className="inbox-email-link"
              onClick={(ev) => ev.stopPropagation()}
              title={`Compose email to ${e.email}`}
            >
              <Icon name="mail" style={{ width: 13, height: 13 }} />
              <span>{e.email}</span>
            </a>
          ),
        },
      ]}
      renderDetail={(e) => (
        <div className="inbox-detail-sections">
          {/* Card 1: Contact Details */}
          <div className="inbox-detail-card">
            <h4 className="inbox-detail-card__title">
              <Icon name="user" style={{ width: 15, height: 15 }} />
              <span>Client & Organization</span>
            </h4>
            <div className="inbox-detail-grid">
              <div className="inbox-detail-item">
                <span className="inbox-detail-label">Client Name</span>
                <span className="inbox-detail-val inbox-detail-val--strong">{e.name}</span>
              </div>
              <div className="inbox-detail-item">
                <span className="inbox-detail-label">Email Address</span>
                <span className="inbox-detail-val">
                  <a href={`mailto:${e.email}`} className="inbox-detail-link">
                    <Icon name="mail" style={{ width: 13, height: 13 }} />
                    {e.email}
                  </a>
                </span>
              </div>
              {e.phone && (
                <div className="inbox-detail-item">
                  <span className="inbox-detail-label">Phone Number</span>
                  <span className="inbox-detail-val">
                    <a href={`tel:${e.phone}`} className="inbox-detail-link">
                      <Icon name="phone" style={{ width: 13, height: 13 }} />
                      {e.phone}
                    </a>
                  </span>
                </div>
              )}
              {e.company && (
                <div className="inbox-detail-item">
                  <span className="inbox-detail-label">Company</span>
                  <span className="inbox-detail-val">{e.company}</span>
                </div>
              )}
              {e.country && (
                <div className="inbox-detail-item">
                  <span className="inbox-detail-label">Country / Region</span>
                  <span className="inbox-detail-val">{e.country}</span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Request Particulars */}
          <div className="inbox-detail-card">
            <h4 className="inbox-detail-card__title">
              <Icon name="file" style={{ width: 15, height: 15 }} />
              <span>Inquiry Particulars</span>
            </h4>
            <div className="inbox-detail-grid">
              <div className="inbox-detail-item">
                <span className="inbox-detail-label">Inquiry Type</span>
                <span className="inbox-detail-val">
                  <span className={`inbox-type-badge ${(TYPE_CONFIG[e.type] || {}).cls || 'inbox-type-badge--general'}`}>
                    {e.type}
                  </span>
                </span>
              </div>
              {e.productName && (
                <div className="inbox-detail-item">
                  <span className="inbox-detail-label">Target Product</span>
                  <span className="inbox-detail-val inbox-product-tag">
                    <Icon name="flask" style={{ width: 12, height: 12 }} />
                    {e.productName}
                  </span>
                </div>
              )}
              {e.quantity && (
                <div className="inbox-detail-item">
                  <span className="inbox-detail-label">Requested Quantity</span>
                  <span className="inbox-detail-val">{e.quantity}</span>
                </div>
              )}
              {e.subject && (
                <div className="inbox-detail-item">
                  <span className="inbox-detail-label">Subject</span>
                  <span className="inbox-detail-val">{e.subject}</span>
                </div>
              )}
              {e.sourcePage && (
                <div className="inbox-detail-item">
                  <span className="inbox-detail-label">Source Origin</span>
                  <span className="inbox-detail-val inbox-detail-link">{e.sourcePage}</span>
                </div>
              )}
              <div className="inbox-detail-item">
                <span className="inbox-detail-label">Privacy Consent</span>
                <span className="inbox-detail-val">{e.consent ? 'Recorded' : 'Not recorded'}</span>
              </div>
              <div className="inbox-detail-item">
                <span className="inbox-detail-label">Auto-Notification</span>
                <span className="inbox-detail-val">{e.emailSent ? 'Delivered' : 'Pending'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Inbound Message */}
          {e.message && (
            <div className="inbox-detail-card inbox-detail-card--message">
              <h4 className="inbox-detail-card__title">
                <Icon name="message-square" style={{ width: 15, height: 15 }} />
                <span>Message Content</span>
              </h4>
              <div className="inbox-message-box">
                {e.message}
              </div>
            </div>
          )}
        </div>
      )}
      extraActions={(e) => (
        <a
          href={`mailto:${e.email}?subject=Re:%20${encodeURIComponent(e.subject || (e.productName ? `Inquiry regarding ${e.productName}` : 'Your inquiry to BioPharma Care'))}`}
          className="inbox-reply-btn"
          target="_blank"
          rel="noopener noreferrer"
          title="Compose direct email reply"
        >
          <Icon name="send" style={{ width: 14, height: 14 }} />
          <span>Reply via Email</span>
        </a>
      )}
    />
  );
}

