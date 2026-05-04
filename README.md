# Memact Origin

Version: `v0.0`

Origin finds possible direct source candidates for a thought.

It owns one job:

```text
check whether a specific retained source closely matches or introduced a thought
```

Origin is stricter than Influence. It should return fewer results and avoid weak claims.

## What This Repo Owns

- Accepts a user thought or question.
- Reads meaningful Inference/Memory evidence.
- Scores direct source candidates.
- Prioritizes exact phrase overlap, rare term overlap, and retained evidence strength.
- Emits guarded origin candidates with source evidence.

## Output

```json
{
  "schema_version": "memact.origin.v0",
  "thought": "I need to build something real before applying anywhere",
  "candidates": [
    {
      "id": "act_1",
      "packet_id": "packet:act_1",
      "score": 0.91,
      "claim_type": "origin_candidate",
      "reason": "close phrase overlap with the thought and matching source evidence"
    }
  ],
  "language_guardrail": "Origin means possible source candidate, not proof."
}
```

## Run Locally

Prerequisites:

- Node.js `20+`
- npm `10+`

Install:

```powershell
npm install
```

Validate:

```powershell
npm run check
```

Run sample:

```powershell
npm run sample
```

Run against Inference output:

```powershell
npm run origin -- --input path\to\inference-output.json --thought "I need to build something real" --format report
```

JSON output:

```powershell
npm run origin -- --input path\to\inference-output.json --thought "I need to build something real" --format json
```

## Contract

- Origin is a candidate engine, not a proof engine.
- It should prefer precision over recall.
- It should cite retained evidence.
- It should not read Capture internals.

## License

MIT. See `LICENSE`.
