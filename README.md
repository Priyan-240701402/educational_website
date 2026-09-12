# Distance Education Guidance Portal

A full-stack platform for an independent student guidance organisation supporting distance education learners. It is intentionally presented as a guidance/support service, not an official university site.

## Stack

- `frontend/`: Next.js + React + CSS (JavaScript/JSX only)
- `backend/`: Node.js + Express REST API
- `database/schema/001_initial.sql`: PostgreSQL relational schema
- `postman/distance-education-api.json`: importable API test collection

## Run locally

1. Create a PostgreSQL database, then run `psql -d distance_education_portal -f database/schema/001_initial.sql` from the project root.
2. Copy `backend/.env.example` to `backend/.env`, set `DATABASE_URL` and a strong `JWT_SECRET`.
3. Run `npm install` in both `frontend` and `backend`.
4. Run `npm run db:seed` in `backend` to add starter content and the configurable admin account.
5. Start the API with `npm run dev` in `backend`, then start the frontend with `npm run dev` in `frontend`.

The public site runs on `http://localhost:3000`; the API runs on `http://localhost:4000`. Sign in at `/admin/login` with the configured seed account.

## Content management

Public pages read universities, courses, notifications, gallery content, about content, contact settings, and enquiries from the REST API. Staff endpoints require a JWT. The Postman collection includes authentication, CRUD, upload, enquiry, and content management requests.

## Security notes

Passwords use bcrypt hashes, tokens expire after eight hours, admin endpoints enforce role checks, login/API routes are rate-limited, uploads have size/type limits, and secrets only come from environment variables.
