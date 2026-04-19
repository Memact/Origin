#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { detectOriginCandidates, formatOriginReport } from "./engine.mjs";

const args = parseArgs(process.argv.slice(2));

if (!args.input || !args.thought) {
  console.error("Usage: npm run origin -- --input <inference-output.json> --thought \"...\" [--format report|json]");
  process.exit(1);
}

const inferenceOutput = JSON.parse(await readFile(args.input, "utf8"));
const result = detectOriginCandidates(args.thought, inferenceOutput, {
  minScore: args["min-score"] ?? args.minScore,
  top: args.top,
});

if ((args.format ?? "report") === "json") {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(formatOriginReport(result));
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      parsed[arg.slice(2)] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
    }
  }
  return parsed;
}
