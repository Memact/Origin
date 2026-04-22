# Memact Origin

Version: `v0.0`

Origin is the high-precision query-time engine in the Memact architecture.

It answers:

`Did a specific captured source likely introduce this thought?`

Origin is intentionally stricter than Influence. It should return fewer results and avoid weak claims.

## Pipeline Position

```text
Capture -> Inference -> Schema -> Interface / Query -> Influence / Origin
```

Origin runs after the user enters a thought or question in Interface / Query. It consumes Inference records and compares the query against captured evidence.

Origin supports Memact's citation and answer engine by finding specific source candidates that may directly support, introduce, or closely match the user's query.

## What It Does

- accepts a user thought/question query
- reads `memact.inference.v0` records
- scores direct source candidates using deterministic wording overlap
- prioritizes exact phrase and rare term overlap
- emits guarded origin candidates with evidence

## Public Output Contract

```json
{
  "schema_version": "memact.origin.v0",
  "thought": "I need to build something real before applying anywhere",
  "candidates": [
    {
      "id": "act_1",
      "source_label": "Essay: build something real before applying anywhere",
      "score": 0.91,
      "claim_type": "origin_candidate",
      "reason": "close phrase overlap with the thought and matching activity evidence"
    }
  ],
  "language_guardrail": "Origin means a possible direct source candidate, not proof that the source created the thought."
}
```

## Terminal Quickstart

Prerequisites:

- Node.js `20+`
- npm `10+`

Install:

```powershell
npm install
```

Run validation:

```powershell
npm run check
```

Run the sample:

```powershell
npm run sample
```

Analyze a thought or question against Inference output:

```powershell
npm run origin -- --input ..\inference-output.json --thought "I need to build something real before applying anywhere" --format report
```

Emit JSON:

```powershell
npm run origin -- --input ..\inference-output.json --thought "I need to build something real before applying anywhere" --format json
```

## Design Rules

- origin is a high-bar claim
- no source is allowed to be called the cause of a thought
- weak matches should be suppressed
- every candidate must cite captured evidence

## License

See `LICENSE`.
