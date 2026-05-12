# AI Spend Audit

AI Spend Audit is a professional SaaS application designed to help teams optimize their AI tool stack. As companies adopt more AI tools (ChatGPT Plus, Claude Pro, Midjourney, etc.), subscription overlap and unused seats lead to significant wasted spend. This deterministic auditing engine analyzes a team's current stack, identifies redundancies, and recommends optimal pricing tiers.

## Features
- **Deterministic Auditing Engine**: Analyzes tool usage based on real-world pricing data to identify exact dollar savings.
- **AI Financial Summaries**: Uses Groq (Llama-3.3-70b) to provide qualitative analysis and personalized executive summaries of the spend.
- **Lead Capture & Notification**: Captures leads at the end of the audit with Resend email integration and Supabase persistent storage.
- **Accessible & Responsive**: Built with Shadcn UI, fully keyboard navigable, mobile-first, and highly optimized for Lighthouse scores.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI Components**: Shadcn UI, Tailwind CSS, Lucide React
- **Database**: Supabase
- **Email**: Resend
- **AI**: Groq API
- **Testing**: Vitest
- **CI/CD**: GitHub Actions

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key
RESEND_API_KEY=your_resend_api_key
ADMIN_EMAIL=your_email_to_receive_leads
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Run Tests
```bash
npm run test
```

## Deployment Notes
- Ensure all environment variables from `.env.local` are safely added to your hosting provider (e.g., Vercel).
- Supabase should have RLS enabled for production, ensuring leads cannot be queried publicly.
- The repository includes a `.github/workflows/ci.yml` that will automatically validate builds on PR to `main`.
