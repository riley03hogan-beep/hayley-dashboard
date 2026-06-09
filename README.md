# Hayley Dashboard

Hayley Dashboard is a first-version personal command-center for Hayley, a Graduate Assistant for Illinois State Women’s Basketball and a master’s student in sports management at Illinois State.

It is built with Next.js, TypeScript and Tailwind CSS so it can be hosted on Vercel later. The current version focuses on a clean daily dashboard: quick launch links, mock calendar and Gmail summaries, assignment tracking, basketball/GA checklists, local to-do items, local notes and setup status.

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

The first version does not connect to live accounts yet. Mock data lives in `src/data/mockData.ts` and currently powers:

- Today at a Glance
- Needs Attention
- Gmail Summary
- Calendar Snapshot
- Assignments and Deadlines
- Basketball / GA Hub
- Setup Status

The Personal To-Do List and Notes sections are working browser-only features. They store data in `localStorage` on the current device.

## Future API connections

Later versions should replace the mock data with official APIs:

- Gmail API for unread counts, recent Canvas notifications, Illinois State emails, basketball/team emails and urgent/action-needed messages.
- Google Calendar API for today, tomorrow and next-seven-days events from Hayley’s main calendar.
- Canvas calendar feed through Google Calendar.
- Teamworks schedule through Google Calendar.

Do not add scraping for Gmail, Outlook, Canvas or Teamworks. Use official Google OAuth and read-only scopes where possible.

## Account safety

Passwords should never be stored in this app, committed to the repo or entered into custom forms. Gmail and Google Calendar should use secure Google OAuth. Environment variables for future public OAuth client configuration should use `NEXT_PUBLIC_` prefixes only when the value is safe to expose in the browser.
