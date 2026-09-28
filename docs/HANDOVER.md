# Developer Handover & Operations Guide

## 1. Architecture

```
Browser ──> React SPA (Vite build, served by Nginx/CDN)
               │  /api/v1  (cookies, same-site or CORS allow-list)
               ▼
           Express API (Node 20, PM2/Docker) ──> MongoDB (replica set / Atlas)
               │                             └─> SMTP (notifications)
               └─> Storage: uploads/public (served at /uploads), uploads/private (resumes, never served)
```

* Backend modules live in `backend/src/modules/<name>` (model · validation · routes/controller/service).
  Generic content types share `modules/shared/crudFactory.js`.
* Public endpoints only return `published` / `active` / `open` records; authenticated admin requests
  may pass `includeAll=true` or `status=` to see drafts/archived.
* Frontend: `frontend/src/pages` (public), `frontend/src/admin` (CMS). Admin resources are declared
  in `admin/resources.js` — adding a field there adds it to the list/form automatically.

## 2. Roles & permissions

| Capability | editor | admin | superadmin |
|---|---|---|---|
| Content, pages, media CRUD | ✔ | ✔ | ✔ |
| Enquiries, applications, resumes | | ✔ | ✔ |
| Site settings | | ✔ | ✔ |
| Manage users | | | ✔ |

Sessions are HttpOnly cookies (`access` 15 min, `refresh` 7 days). Logout or password change bumps
`tokenVersion`, invalidating all existing sessions for that user.

## 3. Environments

| Variable | Notes |
|---|---|
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | ≥ 48 random bytes, different per environment |
| `MONGODB_URI` | use a dedicated DB user with readWrite only |
| `CORS_ORIGINS`, `FRONTEND_URL`, `PUBLIC_SITE_URL`, `API_BASE_URL` | production origins (https) |
| `SMTP_*`, `EMAIL_FROM`, `ENQUIRY_EMAIL`, `CAREERS_EMAIL` | empty SMTP host = log to console |
| `STORAGE_*` | `local` today; S3-compatible values reserved for cloud storage |
| `CAPTCHA_SECRET_KEY` + `VITE_RECAPTCHA_SITE_KEY` | optional reCAPTCHA |
| `VITE_API_URL` | API origin if not same host; empty uses `/api` proxy |

## 4. Deployment (reference: Ubuntu + Nginx + PM2)

```bash
# Backend
cd backend && npm ci --omit=dev
pm2 start src/server.js --name pharma-api --env production
pm2 save && pm2 startup

# Frontend
cd frontend && npm ci && npm run build      # -> dist/
```

Nginx: serve `frontend/dist` with SPA fallback (`try_files $uri /index.html`), proxy
`/api/`, `/uploads/`, `/sitemap.xml`, `/robots.txt` to `http://127.0.0.1:5000`, enable HTTPS
(Let's Encrypt), gzip, and `client_max_body_size 12m` (≥ `MAX_UPLOAD_MB`).
Set `NODE_ENV=production` so cookies are `Secure`.

Docker: run API and Mongo as separate services; mount a persistent volume on `backend/uploads`.
For horizontal scaling move uploads to object storage (implement a provider in
`backend/src/config/storage.js`; interface: `save`, `remove`, `readStream`).

### Rollback
1. `pm2 deploy`/git: check out previous tag, `npm ci`, `pm2 reload pharma-api`.
2. Frontend: redeploy the previous `dist/` artifact (keep last 3 builds).
3. Mongoose schemas are additive; no destructive migrations exist. If a release changed data, restore
   the pre-release dump (below).

## 5. Backups & restore

```bash
# nightly (cron), keep 30 daily + 12 monthly
mongodump --uri="$MONGODB_URI" --gzip --archive=/backups/db-$(date +%F).gz
tar -czf /backups/uploads-$(date +%F).tgz backend/uploads

# restore
mongorestore --uri="$MONGODB_URI" --gzip --archive=/backups/db-YYYY-MM-DD.gz --drop
tar -xzf /backups/uploads-YYYY-MM-DD.tgz -C .
```

Test a restore quarterly into a staging database.

## 6. Monitoring & logging

* Health: `GET /api/v1/health` → uptime; wire to uptime monitor (5 min).
* Logs: Morgan access logs + error middleware to stdout → PM2/Docker log driver → central logging.
* Alerts: 5xx rate, response time > 1 s, Mongo connection errors, disk usage of `uploads/`,
  failed email sends (logged with `notification.sent=false` on the enquiry/application record).
* Optional: Sentry (add DSN in `error.middleware.js`), Mongo Atlas alerts.

## 7. Data retention & deletion

| Data | Retention | Deletion |
|---|---|---|
| Enquiries / contact | 24 months | admin delete in inbox (hard delete) |
| Applications + resumes | 12 months after closure | deleting an application removes its private resume file |
| Media | while referenced | media library delete |
| Admin users | while employed | superadmin deactivate then delete |

Subject-access / erasure requests: search inbox by email, export detail view, delete record.
Consent checkbox and timestamp are stored on every public submission.

## 8. Content governance

* Workflow: editor drafts → admin reviews → publish. `archived` hides without deleting.
* Pharmaceutical claims, certifications, regulatory statements and product specifications must be
  supplied and approved by client QA/RA before publishing. Seed content is placeholder only.
* Alt text is required for images in the media library for accessibility & SEO.

## 9. SEO, accessibility, analytics

* Per-record SEO fields (title, description, keywords, OG image, noindex) + site defaults.
* Canonical + OG + Twitter tags, JSON-LD (Organization, Product, Article, JobPosting).
* `sitemap.xml` generated from published content; `robots.txt` blocks `/admin`.
* Semantic HTML, skip link, focus states, keyboard-accessible menu/lightbox, colour contrast ≥ 4.5:1.
* Analytics: set GA4/GTM IDs in Settings → Analytics; frontend pushes `page_view`,
  `enquiry_submitted` to `window.dataLayer`.

## 10. Acceptance test checklist

- [ ] Search products by name, code, CAS, category, therapeutic area
- [ ] Product detail shows specs/documents; enquiry form sends email + appears in admin inbox
- [ ] Renamed product slug redirects old URL
- [ ] Contact form, career application with PDF resume; resume not reachable via `/uploads`
- [ ] Draft content invisible publicly, visible in admin
- [ ] Editor cannot open Enquiries/Applications/Settings/Users
- [ ] Logout / password change invalidates other sessions
- [ ] Sitemap/robots/OG tags valid; Lighthouse ≥ 90 performance/SEO/accessibility on mobile
- [ ] Layout verified at 360 px, 768 px, 1280 px
- [ ] Backup + restore rehearsal completed

## 11. Known limitations / next steps

* Storage provider is local disk; add S3/Cloudinary provider before multi-instance deployment.
* Rich text editing is raw HTML textarea (sanitised on render); a WYSIWYG can be dropped into
  `admin/fields.jsx` `richtext` case.
* Automated tests cover utilities; add API integration tests (supertest + mongodb-memory-server)
  and Playwright e2e in CI.
