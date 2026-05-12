# Metrics

## North Star Metric
**Qualified savings pipeline per week** = number of completed audits with > $500/month savings * consult booking rate. This directly ties to Credex revenue, not vanity engagement.

## Input Metrics (what drives the North Star)
1) **Audit completion rate** (completed audits / form starts). If users cannot finish the audit, the pipeline dies regardless of traffic.
2) **High-savings rate** (audits with > $500/month). This indicates whether the product is attracting teams with meaningful spend.
3) **Consult booking rate** (consults / high-savings audits). This is the revenue gateway.

## Activation and Retention Metrics
- **Time to value**: median time from landing to results (target < 90 seconds).
- **Share rate**: percent of audits shared via the public URL.
- **Repeat audit rate**: percent of users who run a new audit within 60 days (useful for price changes and tool churn).

## Lead Quality Metrics
- **Company size distribution**: percent of leads in 5-50 employee range (target ICP).
- **Savings per lead**: median monthly savings in qualified audits.
- **Email to consult conversion**: percent of captured leads that book a consult.

## Instrumentation First
1) Form start, form completion, and results page render time.
2) Audit result: total savings, savings percentage, and high-savings flag.
3) Lead capture submission and consult intent CTA clicks.

## Pivot Thresholds
- If audit completion rate < 35% after 1,000 visitors, simplify the form and reduce required fields.
- If high-savings rate < 15% for two consecutive weeks, retarget ICP to larger teams or revise the pricing rules to better reflect enterprise tiers.
- If consult booking rate < 15% of high-savings audits, revisit the CTA copy and add a clearer “what happens next” flow.

These metrics are designed for a B2B lead-gen product where value is realized at consult and purchase, not daily active usage.
