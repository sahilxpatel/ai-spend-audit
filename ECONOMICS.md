# Unit Economics

## Cost per Audit (COGS)
1) **LLM summary** (Groq `llama-3.3-70b-versatile`): ~$0.59 per 1M tokens, ~800 tokens per summary -> ~$0.00047
2) **Supabase storage**: negligible at early scale (free tier supports tens of thousands of audits)
3) **Resend transactional email**: free tier for 3,000 emails/month
4) **Hosting**: Vercel free tier is sufficient for MVP

**Total COGS per audit:** ~ $0.001 (rounded up for safety)

## Funnel Assumptions (base case)
Assume 1,000 unique visitors from a launch week push.
- Audit start rate: 30% -> 300 starts
- Audit completion rate: 60% -> 180 completed audits
- Email capture rate: 15% -> 27 leads
- High-savings qualification (> $500/mo): 30% -> 8 qualified leads
- Consult booking rate: 35% -> 2.8 booked consults
- Deal close rate: 30% -> 0.84 deals

## Value per Deal
Assume average annual credit purchase: $12,000 ARR.
Assume Credex gross margin: 25% -> $3,000 gross margin per deal.

**Expected gross margin per 1,000 visitors:** 0.84 deals * $3,000 = $2,520
**Expected value per completed audit:** $2,520 / 180 = $14.00

## CAC by Channel (founder time as cost)
Use $100/hour for founder time.
- **HN/Indie Hackers post:** 5 hours total. If it yields 200 completed audits, CAC per audit = $2.50.
- **X founder DMs:** 10 hours for 60 audits -> CAC per audit = $16.67.
- **Slack communities:** 4 hours for 40 audits -> CAC per audit = $10.00.

Even the worst case above is still below the $14 expected value per audit, making the funnel profitable at modest scale.

## What must be true to reach $1M ARR in 18 months
If average annual credit purchase is $12,000, then $1,000,000 ARR requires about 84 deals.
84 deals / 18 months = 4.7 deals per month.

If the conversion from completed audit to purchase is 0.6%, then monthly audits needed are:
4.7 / 0.006 = 783 completed audits per month (~26/day).

This is achievable if we can sustain ~4,000 monthly visitors at current funnel rates. The most sensitive levers are email capture rate and consult booking rate. Increasing either by a few percentage points reduces required traffic materially.
