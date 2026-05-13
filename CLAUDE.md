# AOU Jeddah Clubs Hub — CLAUDE.md

## Project
Official bilingual (Arabic/English) student clubs platform for Arab Open University – Jeddah Branch.

## Stack
- Next.js 16 App Router + TypeScript + Tailwind CSS v4
- Firebase Auth + Firestore + Firebase Storage
- Deployed on Vercel

## Colors
- Navy primary: `#0f2a4a` / `var(--navy)`
- Gold accent: `#c9a84c` / `var(--gold)`
- Background: `#f5f6f8` / `var(--bg)`
- Cards: `#ffffff`

## 5 Clubs
computer, business, cultural, sports, media

## 8 Roles
super_admin, council_admin, club_president, club_vice_president, club_member, media_club_member, student, guest

## Event Workflow
draft → pending_review → needs_edits | approved | rejected → published → completed

## Key files
- `src/types/index.ts` — all TypeScript types + CLUBS constant + role/status labels
- `src/lib/firebase.ts` — Firebase app init
- `src/lib/firestore.ts` — all Firestore helpers
- `src/contexts/AuthContext.tsx` — auth state provider
- `src/app/(public)/` — public pages (home, clubs, events, about)
- `src/app/(auth)/` — login, register
- `src/app/(dashboard)/` — dashboard with role-based views

## Environment
Copy `.env.local` and fill Firebase credentials before running.
