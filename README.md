# Hayley Dashboard

Hayley Dashboard is a first-version morning dashboard for Hayley, a Graduate Assistant for Illinois State Women’s Basketball and a master’s student in sports management at Illinois State.

It is built with Next.js, TypeScript and Tailwind CSS so it can be hosted on Vercel later. The current version focuses on a clean daily brief: what she has today, due dates, the rest of the week, Canvas deadlines, Gmail inbox sorting and fast access links.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm run start
```

## Mocked data

Mock fallback data lives in `src/data/mockData.ts` and powers the dashboard when Google is not connected or a live request fails:

- What you have today
- Do these first
- Gmail Summary
- Weekly Snapshot
- Rest of the Week Assignments

## Future API connections

The Next.js version now includes first-pass Google OAuth routes for real data. It can use:

- Gmail API for Inbox messages that should be filed into useful categories.
- Google Calendar API for today, tomorrow and next-seven-days events from Hayley’s main calendar.
- Canvas calendar feed through Google Calendar.
- Teamworks schedule through Google Calendar.

Do not add scraping for Gmail, Outlook, Canvas or Teamworks. Use official Google OAuth and read-only scopes where possible.

## Google OAuth setup

Create `.env.local` from `.env.example`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

In Google Cloud, enable:

- Google Calendar API
- Gmail API

For the OAuth web client, add:

- Authorized JavaScript origin: `http://localhost:3000`
- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

When deployed on Vercel, also add:

- Authorized JavaScript origin: `https://your-vercel-domain.vercel.app`
- Authorized redirect URI: `https://your-vercel-domain.vercel.app/api/auth/callback/google`

The app requests read-only Gmail and Calendar scopes. OAuth tokens are stored in HTTP-only cookies for this first version. A later production version should move encrypted token storage to a database such as Supabase.

## Account safety

Passwords should never be stored in this app, committed to the repo or entered into custom forms. Gmail and Google Calendar should use secure Google OAuth. Environment variables for future public OAuth client configuration should use `NEXT_PUBLIC_` prefixes only when the value is safe to expose in the browser.
