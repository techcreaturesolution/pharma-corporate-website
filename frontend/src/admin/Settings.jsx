import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApi } from '../lib/hooks.js';
import { put, parseError } from '../lib/api.js';
import { Loader, ErrorState, Alert, Field } from '../components/ui.jsx';
import { ImageInput, SeoFields, TagsInput } from './fields.jsx';

const emptyAddress = { label: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: '', phone: '', email: '', mapEmbedUrl: '' };

const Text = ({ label, path, values, set, type = 'text', hint }) => {
  const v = path.split('.').reduce((o, k) => o?.[k], values) ?? '';
  return (
    <Field label={label} name={path} hint={hint}>
      {type === 'textarea' ? <textarea id={path} value={v} onChange={(e) => set(path, e.target.value)} style={{ minHeight: 70 }} /> : <input id={path} type={type} value={v} onChange={(e) => set(path, type === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value)} />}
    </Field>
  );
};

export default function Settings() {
  const { data, isLoading, isError, error } = useApi('/admin/settings', undefined, { staleTime: 0 });
  const [values, setValues] = useState(null);
  const [status, setStatus] = useState({});
  const qc = useQueryClient();

  useEffect(() => {
    if (data?.data) setValues(data.data);
  }, [data]);

  const set = (path, v) =>
    setValues((s) => {
      const next = structuredClone(s);
      const keys = path.split('.');
      let o = next;
      keys.slice(0, -1).forEach((k) => (o = o[k] ??= {}));
      o[keys.at(-1)] = v;
      return next;
    });

  const submit = async (e) => {
    e.preventDefault();
    setStatus({ busy: true });
    // eslint-disable-next-line no-unused-vars
    const { _id, key, createdAt, updatedAt, updatedBy, __v, ...payload } = values;
    try {
      const res = await put('/admin/settings', payload);
      setValues(res.data);
      qc.invalidateQueries({ queryKey: ['/settings/public'] });
      setStatus({ msg: res.message, type: 'success' });
    } catch (err) {
      const p = parseError(err);
      setStatus({ msg: p.message + (Object.keys(p.errors).length ? ` — ${Object.entries(p.errors).map(([k, v]) => `${k}: ${v}`).join('; ')}` : ''), type: 'error' });
    }
  };

  if (isLoading || !values) return <Loader />;
  if (isError) return <ErrorState error={error} />;
  const addresses = values.contact?.addresses || [];

  return (
    <form onSubmit={submit}>
      <div className="admin__top">
        <h1>Site settings</h1>
        <button className="btn btn--primary btn--sm" disabled={status.busy}>
          Save settings
        </button>
      </div>
      {status.msg && <Alert type={status.type}>{status.msg}</Alert>}
      <div className="two-col">
        <div className="panel form">
          <h3>Company</h3>
          <Text label="Company name" path="company.name" values={values} set={set} />
          <Text label="Tagline" path="company.tagline" values={values} set={set} />
          <Text label="Legal name" path="company.legalName" values={values} set={set} />
          <Text label="Founded year" path="company.foundedYear" type="number" values={values} set={set} />
          <Text label="Short description" path="company.description" type="textarea" values={values} set={set} />
          <Field label="Logo" name="logo">
            <ImageInput value={values.company?.logo} onChange={(v) => set('company.logo', v)} />
          </Field>
          <Field label="Favicon" name="favicon">
            <ImageInput value={values.company?.favicon} onChange={(v) => set('company.favicon', v)} />
          </Field>
        </div>
        <div className="panel form">
          <h3>Contact</h3>
          <Text label="General email" path="contact.email" type="email" values={values} set={set} />
          <Text label="Sales email" path="contact.salesEmail" type="email" values={values} set={set} />
          <Text label="Careers email" path="contact.careersEmail" type="email" values={values} set={set} />
          <Text label="Phone" path="contact.phone" values={values} set={set} />
          <Text label="Alternate phone" path="contact.alternatePhone" values={values} set={set} />
          <Text label="WhatsApp" path="contact.whatsapp" values={values} set={set} />
          <Text label="Working hours" path="contact.workingHours" values={values} set={set} />
        </div>
        <div className="panel form">
          <h3>Addresses</h3>
          {addresses.map((a, i) => (
            <fieldset key={i} className="fieldset">
              <legend>{a.label || `Address ${i + 1}`}</legend>
              <div className="field-row">
                {Object.keys(emptyAddress).map((k) => (
                  <Text key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())} path={`contact.addresses.${i}.${k}`} values={values} set={set} />
                ))}
              </div>
              <button type="button" className="btn btn--outline btn--sm" onClick={() => set('contact.addresses', addresses.filter((_, j) => j !== i))}>
                Remove address
              </button>
            </fieldset>
          ))}
          <button type="button" className="btn btn--outline btn--sm" onClick={() => set('contact.addresses', [...addresses, { ...emptyAddress }])}>
            + Add address
          </button>
        </div>
        <div className="panel form">
          <h3>Social links</h3>
          {['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'].map((k) => (
            <Text key={k} label={k[0].toUpperCase() + k.slice(1)} path={`social.${k}`} type="url" values={values} set={set} />
          ))}
          <h3>Footer</h3>
          <Text label="Footer text" path="footer.text" values={values} set={set} />
          <Text label="Disclaimer" path="footer.disclaimer" type="textarea" values={values} set={set} hint="Shown in the footer. Use approved legal wording only." />
        </div>
        <div className="panel form">
          <h3>Notifications</h3>
          <Field label="Enquiry recipients" name="enq" hint="Emails that receive new enquiry alerts">
            <TagsInput value={values.notifications?.enquiryRecipients || []} onChange={(v) => set('notifications.enquiryRecipients', v)} placeholder="email@example.com" />
          </Field>
          <Field label="Careers recipients" name="car">
            <TagsInput value={values.notifications?.careersRecipients || []} onChange={(v) => set('notifications.careersRecipients', v)} placeholder="hr@example.com" />
          </Field>
          <label className="checkbox">
            <input type="checkbox" checked={values.notifications?.sendVisitorConfirmation ?? true} onChange={(e) => set('notifications.sendVisitorConfirmation', e.target.checked)} /> Send confirmation email to visitors
          </label>
          <h3>Analytics</h3>
          <Text label="Google Analytics ID" path="analytics.googleAnalyticsId" values={values} set={set} hint="G-XXXXXXX" />
          <Text label="Google Tag Manager ID" path="analytics.googleTagManagerId" values={values} set={set} hint="GTM-XXXXXX" />
          <Text label="Google site verification" path="analytics.googleSiteVerification" values={values} set={set} />
          <label className="checkbox">
            <input type="checkbox" checked={Boolean(values.maintenanceMode)} onChange={(e) => set('maintenanceMode', e.target.checked)} /> Maintenance mode (shows notice on public site)
          </label>
        </div>
        <div className="panel">
          <h3>Default SEO</h3>
          <SeoFields value={values.seo || {}} onChange={(v) => set('seo', v)} />
        </div>
      </div>
    </form>
  );
}
