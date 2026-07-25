# Waraqah (وَرَقَة)

**Waraqah** — Arabic for "a leaf/page of paper" — is a personal research notebook for studying hadith and fiqh topics. It solves a real problem for students of Islamic knowledge (and hobbyist researchers): the notes people take while reading hadith collections and fiqh books end up scattered across notebooks, phone notes apps, and voice memos, with no easy way to search across them, tag them by topic, compare madhab positions, or get quick help understanding an unfamiliar term or narrator — without turning to a search engine that mixes reliable and unreliable sources.

Waraqah gives each user a private, structured notebook: capture the hadith text (in Arabic/Urdu or transliteration), its translation, the exact reference, your own notes, and the relevant madhab context, then organize entries into collections and tag them for fast retrieval. An AI Study Assistant — scoped strictly to study aid, never rulings — helps unpack unfamiliar terms, adds scholarly context, and generates discussion questions to check your own understanding.

## Live URL

🔗 **[Add your deployed Vercel URL here after deployment]**

## Features

- **Authentication** — email/password sign up, log in, and log out via Supabase Auth.
- **Dashboard** — a searchable, filterable list of all your entries. Filter by tag, by collection, or free-text search across title, hadith text, translation, and notes.
- **Entry detail / edit page** — create and edit entries with: title, hadith text, translation, reference (book/chapter/number), personal notes, tags, and madhab context.
- **Collections** — create named collections and assign entries to them from a single management page.
- **AI Study Assistant** — a button on every entry that calls Google Gemini to explain unfamiliar terms, add historical/scholarly context, suggest related topics, and generate study questions — with a persistent disclaimer and hard guardrails against issuing fatwas or rulings.
- **Row-level security** — every user only ever sees their own entries and collections, enforced at the database level, not just in the UI.
- Responsive, clean UI built with Tailwind CSS.

## The AI Feature

**What it does:** On any entry's detail page, clicking "AI Study Assistant" sends the entry's hadith text, translation, reference, and personal notes to Google Gemini (`gemini-2.5-flash`, via the `@google/genai` SDK) through a Next.js API route (`app/api/ai-study/route.ts`). The API key is read from a server-side environment variable and is never exposed to the browser. The response is rendered in a clean panel under the entry, broken into headed sections (Terms / Context / Related Topics / Study Questions), with a permanent disclaimer:

> *"AI-generated study aid, not a religious ruling — consult a qualified scholar for fiqh questions."*

**Exact system prompt used:**

```
You are a study assistant for a personal hadith/fiqh research notebook. Given a hadith text, its reference, and the user's notes, help the user understand it better for STUDY purposes only. You may: (1) explain unfamiliar classical Arabic or Urdu terms in plain language, (2) give brief historical or scholarly context about the topic or the narrators if relevant, (3) suggest 2-3 related topics or keywords worth researching further, (4) generate 2-3 study/discussion questions to test understanding. You must NEVER issue a fatwa, ruling, or personal verdict on what is permissible or obligatory, and never state one madhab's position as 'the correct one.' If the user's notes ask for a ruling, decline and remind them to consult a qualified scholar. Keep responses concise and clearly structured under headings: Terms, Context, Related Topics, Study Questions — only include the sections that are relevant.
```

## Tools, Services & Models Used

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS v4
- **Database & Auth:** Supabase (Postgres + Supabase Auth, email/password) with Row Level Security
- **AI:** Google Gemini API (`gemini-2.5-flash`, free tier), called server-side via the official `@google/genai` SDK
- **Hosting:** Vercel (recommended) or any Node-compatible host
- **Built with:** Claude Code

## Screenshots

*(Add 3+ screenshots here before submitting — e.g. dashboard with entries, an entry detail page with the AI Study Assistant panel expanded, and the collections page.)*

1. `screenshots/dashboard.png` — Dashboard with search/filter and entry list
2. `screenshots/entry-detail.png` — Entry detail page with AI Study Assistant response
3. `screenshots/collections.png` — Collections management page

## How to Run the Project

### 1. Prerequisites

- Node.js 18.18+ (or 20+)
- A free [Supabase](https://supabase.com) project
- A free [Google Gemini API key](https://aistudio.google.com/apikey)

### 2. Clone and install

```bash
git clone <your-repo-url>
cd waraqah
npm install
```

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. In the Supabase Dashboard, go to the **SQL Editor**, paste the contents of `supabase/schema.sql`, and run it. This creates the `entries` and `collections` tables plus Row Level Security policies so each user only sees their own data.
3. In **Project Settings → API**, copy your **Project URL** and **anon public key**.
4. (Optional but recommended) In **Authentication → Email**, you can disable "Confirm email" for faster local testing, or leave it on and confirm via the email link.

### 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

**Never commit `.env.local`** — it's already in `.gitignore`.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and start adding entries.

### 6. Build for production

```bash
npm run build
npm start
```

## Deploying to Vercel

1. Push this repo to a **public** GitHub repository.
2. In [Vercel](https://vercel.com), import the repository.
3. Add the three environment variables from `.env.example` in the Vercel project's **Settings → Environment Variables** (never commit real values).
4. Deploy. Update the **Live URL** section above with the resulting `*.vercel.app` link.

## Project Structure

```
app/
  api/ai-study/route.ts      # Google Gemini API call (server-only)
  auth/callback/route.ts     # Supabase email-confirmation callback
  login/, signup/            # Auth pages
  dashboard/                 # Searchable/filterable entry list
  entries/new/, entries/[id]/ # Create / view / edit entry + AI panel
  collections/                # Create collections, assign entries
lib/
  supabase/                  # Browser, server, and middleware Supabase clients
  types.ts                   # Shared TypeScript types
supabase/schema.sql           # Table definitions + RLS policies
middleware.ts                 # Route protection (redirects based on auth state)
```
