# Pharmaceutical Corporate Website (MERN)

Corporate website + admin CMS for a pharmaceutical manufacturer.
Stack: **MongoDB · Express · React (Vite) · Node.js**.

```
backend/   Express REST API (/api/v1), Mongoose models, Swagger docs, seed scripts
frontend/  Vite + React public site and /admin CMS (single SPA)
docs/      Handover, deployment, operations & Postman collection
```

## Features

**Public site** – Home, About, Products (search by name / code / CAS / category / therapeutic area,
filter, paginate), Product detail (specs, documents, related, enquiry form), Capabilities, Quality &
Certifications, Facilities, Leadership, News & Events, Careers + job application (resume upload),
Gallery (lightbox), Contact, Privacy Policy, Terms, CMS-driven custom pages, 404.
SEO: per-page meta, canonical, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`.

**Admin CMS (`/admin`)** – cookie-based JWT login, roles (`superadmin`, `admin`, `editor`),
dashboard, CRUD with draft / published / archived workflow for every content type, page builder
(hero / rich text / stats / features / values / image+text / timeline / FAQ / CTA sections),
media library (upload, alt text, folders), enquiry & application inboxes (status, notes, private
resume download), site settings, user management, password change.

**Security** – Helmet, CORS allow-list, rate limiting, Joi validation, bcrypt, HttpOnly cookies with
refresh-token rotation and token versioning, upload validation (MIME, extension, size, magic bytes),
private resume storage never served statically, honeypot + optional reCAPTCHA on public forms,
sanitised CMS HTML (DOMPurify).

Out of scope by requirement: CRM/ERP, inventory, ecommerce/payments, customer portal, medical advice.

## Quick start (local)

Prerequisites: Node.js ≥ 20, MongoDB ≥ 6 running locally.

```bash
# 1. Backend
cd backend
cp .env.example .env          # edit JWT secrets at minimum
npm install
npm run seed                  # demo content + admin@example.com / ChangeMe12345 (dev only!)
npm run dev                   # http://localhost:5000  (docs: /api/docs)

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173  (admin: /admin)
```

Create a production admin instead of the seed user:

```bash
ADMIN_EMAIL=you@company.com ADMIN_PASSWORD='StrongPass123' ADMIN_NAME='Your Name' npm run create-admin
```

## Scripts

| Location | Command | Purpose |
|---|---|---|
| backend | `npm run dev` / `npm start` | dev (nodemon) / production server |
| backend | `npm run seed` | seed demo categories, products, pages, settings, admin |
| backend | `npm run create-admin` | create an admin user from env vars |
| backend | `npm test` | unit tests (`node --test`) |
| frontend | `npm run dev` | Vite dev server with `/api` proxy |
| frontend | `npm run build` / `npm run preview` | production build to `dist/` |
| frontend | `npm run lint` | oxlint |

## API

Base URL `/api/v1`. Interactive docs at `/api/docs`, OpenAPI at `/api/openapi.json`
(source: `backend/docs/openapi.yaml`). Postman collection: `docs/postman_collection.json`.

Envelope: `{ success, message, data, meta? }`. Errors: `{ success:false, message, errors? }`.

| Area | Public | Admin (auth) |
|---|---|---|
| Auth | `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me`, `POST /auth/change-password` | |
| Catalogue | `GET /products`, `/products/:slugOrId`, `GET /categories` | `POST/PUT/PATCH :id/status/DELETE` on same paths |
| Content | `GET /capabilities`, `/certifications`, `/facilities`, `/leadership`, `/news`, `/gallery`, `/careers` | same CRUD pattern |
| Pages | `GET /pages/:slug` | `/admin/pages` CRUD + `PATCH :id/publish` |
| Forms | `POST /enquiries`, `POST /contact`, `POST /careers/:id/applications` | `/admin/enquiries`, `/admin/applications` (+ `/:id/resume`) |
| System | `GET /settings/public`, `/sitemap.xml`, `/robots.txt` | `/admin/settings`, `/admin/media`, `/admin/users`, `/admin/dashboard/stats` |

## Environment variables

See `backend/.env.example` and `frontend/.env.example` (every variable documented inline).
Never commit `.env` files.

## Deployment, backup, monitoring, handover

See [`docs/HANDOVER.md`](docs/HANDOVER.md).
