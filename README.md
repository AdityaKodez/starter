<p align="center">
  <strong>Aura</strong> — AI-powered study planning for JEE aspirants
</p>

<p align="center">
  <em>Turn your exam goal, syllabus, and real progress into a calm, repeatable daily routine.</em>
</p>

---

## What is Aura?

Aura generates a personalised daily study plan grounded in your onboarding data, syllabus coverage, topic progress, confidence levels, and past mistakes. Instead of generic schedules, each day is built from evidence — study sessions, revision slots, and tests appear only when data supports them.

### Key Features

- **AI-generated daily plans** — Gemini ranks topics by urgency and builds a study/revision/test mix that fits your available time.
- **Onboarding-driven context** — Exam year, attempt number, coaching hours, school hours, daily study time, rank aim, and weakest subject shape every plan.
- **Streak tracking** — Timezone-aware streak system that rewards consistent effort.
- **Test deadlines & results** — Track upcoming tests, record results (percentage or fraction), and see your progress over time.
- **End-of-day reflection** — Quick mood and difficulty feedback that informs tomorrow's plan.
- **Wellness-aware planning** — Load balancing and cognitive pacing prevent burnout.
- **Dark mode** — Full theme support via `next-themes`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, React 19, React Compiler) |
| API | [tRPC v11](https://trpc.io/) with [TanStack Query](https://tanstack.com/query) |
| Database | [PostgreSQL](https://www.postgresql.org/) via [Neon](https://neon.tech/) |
| ORM | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg` |
| Auth | [Better Auth](https://www.better-auth.com/) (Google OAuth) |
| AI | [Vercel AI SDK](https://sdk.vercel.ai/) + [Google Gemini](https://ai.google.dev/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Validation | [Zod](https://zod.dev/) |

---

## Prerequisites

- **Node.js** ≥ 20
- **npm** (or pnpm/yarn)
- A **Neon** (or any PostgreSQL) database
- **Google Cloud** OAuth credentials ([console.cloud.google.com](https://console.cloud.google.com/apis/credentials))
- **Google AI** API key ([aistudio.google.com](https://aistudio.google.com/apikey))
- **Sarvam AI** API key

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/<your-org>/project-aura.git
cd project-aura
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials. See [`.env.example`](.env.example) for descriptions of each variable.

### 3. Set up the database

```bash
# Generate the Prisma client
npm run db:generate

# Run migrations
npx prisma migrate deploy

# Seed the syllabus data (chapters & topics)
npm run db:seed
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/dashboard/   # Authenticated dashboard
│   ├── onboarding/         # First-time user setup
│   ├── api/                # tRPC + Auth API routes
│   ├── error.tsx           # Global error boundary
│   ├── not-found.tsx       # Custom 404 page
│   └── page.tsx            # Landing page
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── ai-elements/        # AI chat components
│   └── providers/          # Theme, tRPC, etc.
├── features/
│   ├── dashboard/          # Dashboard, planner, stats cards
│   └── onboarding/         # Onboarding flow
├── trpc/
│   ├── routers/            # tRPC routers (planner, onboarding)
│   ├── client.tsx          # Client-side tRPC setup
│   └── server.tsx          # Server-side tRPC + prefetching
├── lib/                    # Auth, Prisma, AI, utilities
└── utils/                  # Planner algorithms, auth helpers
prisma/
├── schema.prisma           # Database schema
├── migrations/             # Migration history
└── seed.ts                 # Syllabus seed data
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:seed` | Seed the database with syllabus data |

---

## Deployment

The easiest deployment target is [Vercel](https://vercel.com/):

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add all environment variables from `.env.example` in the Vercel dashboard.
4. Vercel will detect Next.js and deploy automatically.

> **Note:** Set `BETTER_AUTH_URL` to your production domain (e.g. `https://aura.example.com`).

---

## License

MIT
