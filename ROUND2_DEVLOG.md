# Round 2 — 36-Hour Devlog

**Start:** 2026-05-20 10:00 AM IST
**Deadline:** 2026-05-21 10:00 PM IST
**Feature:** Re-audit on Pricing Change

---

## 2026-05-20 10:00 — Start

Read the full Round 2 assignment carefully before touching any code.

The task is clear: make audits "live" by storing pricing snapshots, detecting when pricing changes, notifying users via email, and showing a diff view on re-run.

My Round 1 already has Supabase, Resend, public audit URLs, and a deterministic audit engine — so I'm in a good position. This is an extension, not a rewrite.

**Plan for these 36 hours:**

- Phase 1: Codebase audit — understand what's already stored, what's missing
- Phase 2: Supabase schema migration — add `user_email`, `input_stack`, `output_result`, `pricing_snapshot` columns
- Phase 3: Update audit generation in `lib/audits.ts` and `app/api/audit/route.ts`
- Phase 4: Build `/api/detect-changes` endpoint with secret key protection
- Phase 5: Consolidated email notifications via existing `lib/resend.ts`
- Phase 6: Diff view UI at `app/audit/[id]/re-run/page.tsx`
- Phase 7: End-to-end test + documentation

Decided to use a manual trigger endpoint (`POST /api/detect-changes`) instead of Vercel Cron — Vercel Cron requires Pro plan and I don't want to introduce infra risk in 36 hours. This is explicitly allowed by the assignment. Will protect the endpoint with a `CRON_SECRET` env variable to prevent unauthorized triggers.

---

## 2026-05-20 10:30 — Codebase Audit Done

Reviewed my Round 1 codebase carefully before writing any new code.

**What I found in Supabase `audits` table:**

- Current columns: `id`, `audit_data` (jsonb), `summary` (text), `created_at` (timestamp)
- `user_email` is only in the `leads` table — not directly on `audits`
- `audit_data` stores a mix of input and output but not cleanly separated
- No `pricing_snapshot`, no `input_stack`, no `output_result` as dedicated columns

**What I found in codebase:**

- `lib/pricing.ts` exports a static pricing object — easy to serialize as a snapshot
- `lib/audit-engine.ts` has `aggregateAudit()` — can be re-run with any pricing object
- `lib/resend.ts` already exists with basic email sending — just needs a new template
- Audit submission is in `app/api/audit/route.ts` — this is where snapshot storage needs to be added
- No `PRICING_VERSION` constant exists yet

**Decision on schema approach:**
Copilot plan suggested either lifting fields to top-level columns OR storing inside existing `audit_data`. Going with dedicated top-level columns — `input_stack`, `output_result`, `pricing_snapshot` — because it makes the detection query and diff logic cleaner without JSON path gymnastics.

Creating branch and scaffolding docs now.

---

## 2026-05-20 11:00 — Branch Created, Docs Scaffolded

```bash
git checkout -b round-2-reaudit
git push -u origin round-2-reaudit
```

Created `ROUND2_DEVLOG.md` and `ROUND2_PR.md` with empty scaffolds.

First commit pushed:

```
chore: add round2 devlog and pr description scaffolds
```

Starting DB schema migration now.

---

## 2026-05-20 11:15 — Database Schema Migration

Wrote and executed the following SQL migration in Supabase dashboard:

```sql
alter table audits
add column user_email text,
add column input_stack jsonb,
add column output_result jsonb,
add column pricing_snapshot jsonb,
add column pricing_version text,
add column is_stale boolean default false,
add column reaudited_from uuid references audits(id);
```

Also updated Supabase Row Level Security (RLS) policy — the existing anon insert policy didn't cover the new columns. Inserts were failing silently. Took ~20 minutes to debug. Fixed by updating the RLS policy to allow all columns for the anon role.

Added `PRICING_VERSION = "2026-05-20"` constant to `lib/pricing.ts`.

Updated `lib/audits.ts` and `app/api/audit/route.ts` to:

- Pull `user_email` from the request body (was only going to `leads` table before)
- Separate `input_stack` (raw user submission) from `output_result` (engine recommendations)
- Serialize current `PRICING` object + `PRICING_VERSION` as `pricing_snapshot`
- Store all fields in the `audits` row on creation

Tested: submitted a new audit, checked Supabase — `input_stack`, `output_result`, `pricing_snapshot`, and `user_email` all correctly populated in the new columns.

Second commit pushed:

```
feat: extend audit persistence with input stack, output result and pricing snapshot
```

---

## 2026-05-20 13:00 — Lunch Break

Stepping away for lunch. Detection endpoint is next when I get back.

---
