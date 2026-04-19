import { readFile } from "node:fs/promises";
import { detectOriginCandidates } from "../src/engine.mjs";

const inferenceOutput = JSON.parse(await readFile(new URL("../examples/sample-inference-output.json", import.meta.url), "utf8"));
const result = detectOriginCandidates("I need to build something real before applying anywhere", inferenceOutput);

if (!result.candidates.length) {
  throw new Error("Expected at least one origin candidate from sample data.");
}

console.log("Origin check passed.");
