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

## 2026-05-20 14:00 — Back, Detection Endpoint Started

Back from lunch. Starting `/api/detect-changes` now.

Built `app/api/detect-changes/route.ts`.

**Security first:** Added `CRON_SECRET` check at the top of the handler. If the `Authorization: Bearer <secret>` header doesn't match the env variable, return 401. This prevents anyone from triggering mass emails by hitting the endpoint publicly.

**Detection Logic:**

1. Fetch all audits from Supabase
2. For each audit, take the stored `input_stack` and re-run it through `aggregateAudit()` using the **current** `lib/pricing.ts`
3. Compare the freshly generated `output_result` against the stored `output_result`
4. If they differ — flag the audit as `is_stale = true` and add it to an "affected users" array
5. Group the affected users array by `user_email` and pass to email sender

**Key decision:** Re-running the audit engine with latest pricing rather than deep JSON comparing snapshots. This is more accurate — a price could technically change but if it doesn't alter the recommendation, we don't want to spam the user. Only flag stale when the _output actually changes_.

Tested manually with Postman — temporarily changed Cursor Pro price in `lib/pricing.ts`, triggered the endpoint with correct secret header, confirmed correct audits flagged as `is_stale = true` in Supabase.

Third commit pushed:

```
feat: add secure pricing change detection endpoint
```

---

## 2026-05-20 15:30 — Blocker: Email Grouping Logic

Hit a bug in the consolidated email logic. User with 3 stale audits was receiving 3 separate emails instead of 1 consolidated one.

Root cause: I was calling `resend.send()` inside the audit loop instead of grouping first.

Fixed by building a `Map<user_email, stale_audits[]>` first, then iterating over the map to send one email per user containing all their affected audits. Now correctly sends one consolidated email per user regardless of how many stale audits they have — exactly what the assignment requires.

Took about 40 minutes to debug and refactor cleanly.

---

## 2026-05-20 17:00 — Snack Break

Quick 30 minute break. Email grouping is fixed, just need to build the Resend template now.

---

## 2026-05-20 17:30 — Email Notification Working

Back from break. Built the Resend email template in `lib/resend.ts`.

**Email content:**

- Subject: `"Your AI spend audit is outdated — here's what changed"`
- Which tools had price changes with exact delta (e.g. `"Cursor Pro: $20 → $25/seat"`)
- Impact on their audit: `"Your previous audit recommended X. Current pricing means we'd recommend Y."`
- Prominent CTA button linking to `https://[domain]/audit/[id]/re-run`
- Responsive HTML template

Tested end-to-end: triggered detection endpoint, email arrived in inbox within 5 seconds. Re-run link in email correctly routes to the page (404 for now — building that next).

Fourth commit pushed:

```
feat: send consolidated re-audit notification email via resend
```

---

## 2026-05-20 19:20 to 21:00 — Dinner Break and took rest

Stopping for dinner. Diff view UI is the last major piece remaining.

---

## 2026-05-20 21:00 — Back, Diff View UI Started

Back from dinner. Building `app/audit/[id]/re-run/page.tsx`.

**Data flow for this page:**

1. Fetch the stored audit from Supabase using `id` from URL params — get `input_stack` and `output_result`
2. Run the `input_stack` through `aggregateAudit()` against current `lib/pricing.ts` to get the new result
3. Render both old and new results side by side
4. Prominently display the "Total Savings Delta" as the headline
5. Mute/collapse rows where the recommendation is identical

**UI layout decided:**

- Hero headline: `"Your savings changed from $X → $Y"` — big and prominent
- Side-by-side table: `Old Recommendation | New Recommendation`
- Changed rows: highlighted in amber
- Price increases: red indicator
- New cheaper options: green indicator
- Unchanged rows: collapsed/muted to reduce noise
- CTA at bottom: `"Save updated audit"` button

---

## 2026-05-20 22:30 — Diff View Complete

`app/audit/[id]/re-run/page.tsx` working end-to-end.

The side-by-side diff clearly shows:

- Which tools have updated recommendations
- Old savings vs new savings per tool with color coding
- Total monthly savings delta as the headline number

Edge case handled: if user clicks re-run link but pricing has since been updated again, we always compare against the _original stored `pricing_snapshot`_ vs current pricing — not any intermediate state.

---

## 2026-05-20 23:00 — Sleep

All 4 core features working end-to-end. Stopping for the night.

Tomorrow: write `ROUND2_PR.md` properly, add tests, verify on deployed URL, open PR.

**Remaining for tomorrow:**

- `ROUND2_PR.md` final write — especially "What I cut" section
- 3 tests for detection logic
- Full end-to-end test on Vercel deployed URL
- Open PR and submit

---

## 2026-05-21 07:00 — Morning, Woke Up

Slept 11:00 PM to 7:00 AM — 8 hours. Good rest.

---

## 2026-05-21 07:00 — Breakfast and Freshen Up

Taking time to freshen up and have breakfast. Clear head going into documentation and final testing.

and also fifth commit pushed:

```
feat: add side-by-side audit diff view at audit/[id]/re-run
```

---

## 2026-05-21 08:00 — Back at Desk, Writing ROUND2_PR.md

Fresh eyes. Starting with `ROUND2_PR.md` while all decisions are clear in my head.

The `## What I cut` section required the most thought — these are real engineering tradeoffs, not excuses:

- **Unsubscribe flow** — would require `unsubscribed` boolean column on `leads` table + token-based unsubscribe endpoint. Important for production but value/effort ratio didn't justify it in 36h. Diff view was higher priority.
- **Admin dashboard (`/admin`)** — bonus feature only. Aggregating Supabase data for total audits, emails sent, click-through rates is straightforward but not core.
- **Vercel Cron scheduling** — requires Pro plan. Manual `/api/detect-changes` endpoint is explicitly allowed by the assignment and removes infra risk under time pressure.
- **Pricing changelog page (`/changelog`)** — interesting organic growth surface but out of scope for 36h. Would be week-2 work.

ROUND2_PR.md complete after ~90 minutes.

---

## 2026-05-21 09:30 — Build Fix

Fixed a strict Next.js build error during PR and reflection writing due to a TypeScript type mismatch on the JSON-parsed `pricing_snapshot`. Casted the parsed JSON to `unknown` first in `app/audit/[id]/re-run/page.tsx`, and verified the local production build passes perfectly.

Sixth commit pushed:

```
fix: resolve typescript type error in re-run page pricing snapshot cast


```

## 2026-05-21 10:00 — Tests Written

Added 3 Vitest tests for the detection logic in `detect-changes.test.ts`:

1. Audit with identical `pricing_snapshot` vs current pricing returns `is_stale: false`
2. Audit where Cursor Pro price changed returns `is_stale: true` and correct delta
3. Two audits for same `user_email` are correctly grouped into one email notification object

All 3 pass with `npm run test`.

Seventh commit pushed:

```
test: add 3 vitest tests for pricing change detection logic


```

---

## 2026-05-21 10:20 — Sync `user_email` on Lead Capture

Noticed that while we store `user_email` on the `leads` table, the `audits` table row didn't have it explicitly mapped when a user opts-in via the results page. Added `updateAuditEmail` in `lib/audits.ts` and called it inside `app/api/lead/route.ts` to ensure the `user_email` is correctly attached to the audit record.

Wrote and ran `test-email-sync.ts` script to verify. The database correctly populates `user_email` in both the `leads` table and the `audits` table immediately upon lead capture.

Eighth commit pushed:

```
fix: sync user_email to audits table when lead is captured
```

---

## 2026-05-21 11:15 — Live Detection Test

Manually tested the detection logic against the Vercel production deployment. Changed the Cursor Pro price from $20 to $99 to trigger a real stale audit, verified the `/api/detect-changes` endpoint successfully sent the Resend email, and then immediately reverted the price back to keep the repository clean.

Ninth and Tenth commits pushed:

```
test: temporarily change cursor pro price to trigger stale audit detection
fix: revert cursor pro price to correct value after testing
```

---

## 2026-05-21 11:30 — Documentation Polish

Reviewed and polished the final submission documents (`ROUND2_PR.md` and `ROUND2_REFLECTION.md`). Rewrote the reflection answers to sound more natural and direct, stripping out overly corporate phrasing while preserving the core technical trade-offs. The PR description was also refined for maximum clarity.

Eleventh commit pushed:

```
docs: polish and finalize PR description and reflection answers
```

---

## 2026-05-21 11:50 Final Checks

.Final sweep before opening PR:

- ✅ All 4 required features working on live deployed URL
- ✅ Round 1 functionality preserved and verified
- ✅ Tests passing — `npm run test` green
- ✅ No secrets in repo — all keys in env variables
- ✅ `ROUND2_PR.md` complete with all required sections
- ✅ `ROUND2_DEVLOG.md` up to date

---

## 2026-05-21 14:30 — PR Opened

Opened PR on GitHub:

- Title: `feat: add re-audit on pricing change with email notifications`
- From: `round-2-reaudit` → `main`
- PR left open — not merged, as per assignment instructions
- Description copied from `ROUND2_PR.md`

## Final Summary

| Feature                                                                       | Status             |
| ----------------------------------------------------------------------------- | ------------------ |
| Persistent audit storage (`input_stack`, `output_result`, `pricing_snapshot`) | ✅ Done            |
| Secure pricing change detection endpoint (`/api/detect-changes`)              | ✅ Done            |
| Consolidated email notifications via Resend                                   | ✅ Done            |
| Side-by-side diff view (`/audit/[id]/re-run`)                                 | ✅ Done            |
| Round 1 functionality preserved                                               | ✅ Verified        |
| Tests                                                                         | ✅ 3 tests passing |
| `ROUND2_PR.md`                                                                | ✅ Complete        |
| `ROUND2_DEVLOG.md`                                                            | ✅ Complete        |

---

## 2026-05-21 16:15 — ESLint Fixes

Resolved all ESLint errors across the codebase to ensure a green check on the CI pipeline.

Twelfth commit pushed:

```
fix: resolve all eslint errors for ci green check
```

---

## 2026-05-21 16:20 — TypeScript Build Fix

Resolved a strict TypeScript checking error that caused the Vercel production build to fail. Safely casted `Json` types from Supabase to `unknown` before asserting them as specific interfaces. Verified the fix locally with a completely successful `npm run build`.

Thirteenth commit pushed:

```
fix: resolve Next.js strict type checking errors for build
```

---

## 2026-05-21 16:30 — Submitted

Form submitted with PR URL and live deployed URL. Done with over 6 hours to spare before the 10:00 PM deadline.

---

**Total hours worked:** ~19 hours 15 minutes
**Breaks:** 5 hours 30 minutes
**Sleep:** 8 hours
