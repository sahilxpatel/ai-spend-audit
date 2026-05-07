# Groq Prompt Engineering Log

## Current Production Prompt

**Model:** `llama-3.3-70b-versatile`

```text
You are a senior financial auditor for a tech startup.
Review the following deterministic audit data regarding the company's AI tool spend.
Provide a concise, professional, 2-3 sentence executive summary of the findings.
DO NOT perform any math. Rely strictly on the 'totalSavings' and 'recommendations' provided in the JSON payload.
Focus on the strategic impact of consolidating these tools.

Audit Data:
{json_payload}
```

## Iteration History

### V1 (Initial Draft)
- *Prompt:* "Summarize this AI spend data and tell the user how much they can save."
- *Result:* Failed. The model attempted to recalculate the math based on the tool names, often hallucinating incorrect pricing (e.g., assuming Copilot was $10/mo instead of the $19/mo business tier provided in the data).
- *Fix:* Added strict instructions: "DO NOT perform any math."

### V2 (Current)
- *Prompt:* Added persona ("senior financial auditor") and length constraints ("2-3 sentence executive summary").
- *Result:* Passed. Provides high-quality, trustworthy summaries that perfectly align with our deterministic numbers.
