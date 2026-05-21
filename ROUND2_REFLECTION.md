### 1. What was the most uncomfortable trade-off you made because of the time pressure? Be specific — name the trade-off, not the feeling.

The most uncomfortable trade-off was running the audit recalculations synchronously right inside the `POST /api/detect-changes` endpoint instead of pushing them to a background worker. With only 36 hours, setting up queue infrastructure like Upstash or Inngest felt like too big of a risk. So right now, the endpoint just pulls all the non-stale audits into memory, loops through them to run the pricing engine, figures out the diffs, and sends the emails all in one go.

This works perfectly fine for testing or a small number of users, but it's a massive bottleneck. If we suddenly had 5,000 audits to process, the endpoint would definitely hit a Vercel timeout or run out of memory. I traded long-term scalability for getting the feature shipped on time, knowing full well that this approach will break if we get real traffic.

### 2. If we extended the deadline by another 24 hours right now, what's the first thing you'd do? (Not a wish list — the single first thing.)

The absolute first thing I'd do is fix that exact timeout issue by adding a real queue for the `detect-changes` endpoint. I would change the endpoint so it stops trying to do all the heavy lifting itself and just becomes a dispatcher.

It would grab the affected audit IDs from the database in smaller chunks and push them into a message queue like Upstash QStash. Then, I'd build a separate background worker that listens to that queue to process the batches safely. The worker would run the audit engine, update the database, and send the emails. This one change would take the feature from a fragile MVP that crashes under load to a proper, production-ready system that can handle tens of thousands of users without breaking a sweat.

### 3. Looking back at your Round 1 codebase as a now-experienced user of it: what's one thing your Round 1 self made harder for your Round 2 self?

In Round 1, I dumped the entire final audit result into a single `audit_data` JSONB column instead of setting up proper relational tables. Back then, it felt like a clever shortcut to save time. But in Round 2, it turned into a massive headache.

Because I didn't separate the raw user inputs or the pricing data from the final calculated output, building the re-audit feature forced me to awkwardly patch the database. I had to add overlapping columns like `input_stack` and `pricing_snapshot` just to make things work. Worse, my Round 1 UI was hardcoded to read from that giant JSON blob, so my database changes silently broke the public results page until I added fallback logic. If I had just built a clean, normalized schema from day one, adding this feature would have been painless.
