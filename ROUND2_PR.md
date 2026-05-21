## What this PR does

Added a "Re-audit on Pricing Change" feature. Every audit now stores a pricing snapshot. A detection endpoint flags stale audits when pricing changes. Affected users get one consolidated email with a re-run link. The re-run page shows a side-by-side diff of old vs new recommendations.

## Why

AI tool pricing changes frequently. Stale audits are worse than no audit — users making decisions on outdated data could be losing money. This makes audits live.

## How it works

- New columns on audits table: `user_email`, `input_stack`, `output_result`, `pricing_snapshot`, `pricing_version`, `is_stale`
- `app/api/detect-changes/route.ts` — protected by CRON_SECRET, re-runs audit engine per stored audit, flags stale ones, sends consolidated emails via Resend
- `app/audit/[id]/re-run/page.tsx` — fetches old audit, re-runs with current pricing, shows side-by-side diff with color coding
- `lib/generate-audit-diff.ts` — compares previous vs current audit results and generates structured change metadata for the re-run UI and email notifications

**Workflow Diagram:**

```text
[User submits audit]
         ↓
[Pricing snapshot stored]
         ↓
[detect-changes triggered]
         ↓
[Stale audits flagged]
         ↓
[Email sent]
         ↓
[User clicks re-run]
         ↓
[Diff view shown]
```

## What I cut

- Unsubscribe flow — needs extra DB column and token endpoint, not core in 36h
- Vercel Cron scheduling — requires Pro plan, manual endpoint is explicitly allowed
- Admin dashboard — bonus feature only
- Pricing changelog public page — good growth surface but out of scope

## How to test it manually

1. Submit a new audit at the homepage with a real email address
2. Check Supabase `audits` table — confirm `input_stack`, `output_result`, `pricing_snapshot`, `user_email` are all saved
3. In `lib/pricing.ts`, change Cursor Pro price from `20` to `99`
4. Run: `curl -X POST -H "Authorization: Bearer my-secret-123" http://localhost:3000/api/detect-changes`
5. Check your inbox — one consolidated email should arrive with the price change and a re-run link
6. Click the re-run link — diff view should show Cursor row highlighted in amber/red
7. Click "Save updated audit" — should redirect to original audit page
8. Check Supabase — `is_stale` should be back to `false`
9. Revert Cursor Pro price back to `20` in `lib/pricing.ts`

## What's tested

- `tests/detect-changes.test.ts` (3 tests) — pricing change detection logic:
  - Identical pricing snapshot returns `is_stale: false`
  - Changed Cursor Pro price returns `is_stale: true` with correct delta
  - Two audits for same user grouped into one email notification
- `tests/audit-engine.test.ts` (19 tests) — core audit recommendations and savings math
- `tests/pricing.test.ts` (5 tests) — pricing data validation

Total: 27 tests passing. No integration tests were added for the re-run UI due to the 36-hour time constraint — these would be the first tests added in a follow-up.

## Open questions / risks

- What happens if detect-changes is triggered while a previous run is still processing?
- Email delivery failures are silent currently
- Large number of audits could cause slow detection (no pagination implemented yet)
