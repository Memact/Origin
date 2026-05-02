import { readFile } from "node:fs/promises";
import { detectOriginCandidates } from "../src/engine.mjs";

const inferenceOutput = JSON.parse(await readFile(new URL("../examples/sample-inference-output.json", import.meta.url), "utf8"));
const goldenFixtures = JSON.parse(await readFile(new URL("../examples/golden-retrieval-fixtures.json", import.meta.url), "utf8"));
const result = detectOriginCandidates("I need to build something real before applying anywhere", inferenceOutput);

if (!result.candidates.length) {
  throw new Error("Expected at least one origin candidate from sample data.");
}

const matching = goldenFixtures.matching_exposure_before_thought;
const matchingResult = detectOriginCandidates(matching.thought, matching.inference, {
  minScore: 0.24,
  minimumMeaningfulScore: 0.3,
});
if (matchingResult.candidates[0]?.id !== matching.expected_top_id) {
  throw new Error("Expected matching exposure fixture to rank the real source first.");
}
if (!matchingResult.candidates[0]?.sources?.[0]?.url) {
  throw new Error("Expected golden origin candidate to preserve source URL evidence.");
}

const trap = goldenFixtures.phrase_overlap_trap;
const trapResult = detectOriginCandidates(trap.thought, trap.inference, {
  minScore: 0.34,
  minimumMeaningfulScore: 0.3,
});
if (trapResult.candidates[0]?.id === trap.expected_no_top_id) {
  throw new Error("Expected phrase-overlap trap not to pass as strong origin evidence.");
}

const noOrigin = goldenFixtures.no_clear_origin;
const noOriginResult = detectOriginCandidates(noOrigin.thought, noOrigin.inference, {
  minScore: 0.4,
  minimumMeaningfulScore: 0.3,
});
if (noOriginResult.candidates.length) {
  throw new Error("Expected no-origin fixture to produce no high-confidence candidates.");
}

console.log("Origin check passed.");
