---
name: Outlines
status: Watch
link: https://github.com/dottxt-ai/outlines
why: No parsing failures, Pydantic integration
---

LLMs love generating JSON that's almost valid. Outlines fixes this by constraining generation at the token level: define a Pydantic model or JSON schema, and the output is guaranteed to match. No regex parsing, no retry loops, no "please format as valid JSON" prompt engineering. Works with multiple choices, type constraints, regex patterns, or full context-free grammars (generate valid SQL or Python). Integrates with vLLM for production deployment. NVIDIA NIM adopted the approach. When your pipeline needs structured data from LLMs, Outlines turns "usually works" into "always works."
