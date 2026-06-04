# SparkyFitness Langflow Flow

## Flow file

`flows/sparkyfitness-multi-api-agent.json`

This flow connects Langflow Agent to multiple SparkyFitness APIs:

1. Food Search API
   - `/api/foods/foods-paginated?searchTerm=chicken&foodFilter=all&currentPage=1&itemsPerPage=10`

2. Profile API
   - `/api/identity/profiles`

## How to use

1. Open Langflow.
2. Import `sparkyfitness-multi-api-agent.json`.
3. Replace these placeholders after import:
   - `${LITELLM_API_KEY}` with your LiteLLM virtual key
   - `${SPARKY_SESSION_TOKEN}` with your own SparkyFitness session token
4. Run Playground.

## Test questions

```txt
Show me chicken foods with calories, protein, carbs and fat.
```

```txt
Show my SparkyFitness profile.
```

```txt
แสดง profile ของผมใน SparkyFitness ให้หน่อย
```

## Important

Do not commit real API keys, session tokens, passwords, or secrets to GitHub.
