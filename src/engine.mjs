const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "before",
  "by",
  "for",
  "from",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "with",
]);

export function detectOriginCandidates(thought, inferenceOutput, options = {}) {
  const minScore = Number(options.minScore ?? 0.34);
  const top = Number(options.top ?? 5);
  const records = Array.isArray(inferenceOutput?.records) ? inferenceOutput.records : [];
  const thoughtTokens = tokenize(thought);
  const thoughtBigrams = makeNgrams(thoughtTokens, 2);

  const candidates = records
    .map((record) => scoreRecord(thought, thoughtTokens, thoughtBigrams, record))
    .filter((candidate) => candidate.score >= minScore)
    .sort((a, b) => b.score - a.score || b.exact_phrase_hits - a.exact_phrase_hits)
    .slice(0, top);

  return {
    schema_version: "memact.origin.v0",
    generated_at: new Date().toISOString(),
    thought,
    source: {
      inference_schema_version: inferenceOutput?.schema_version ?? null,
      inferred_record_count: records.length,
    },
    thresholds: {
      min_score: minScore,
      top,
    },
    candidates,
    language_guardrail: "Origin means a possible direct source candidate, not proof that the source created the thought.",
  };
}

export function formatOriginReport(result) {
  const lines = [
    "Memact Origin Report",
    `Thought: ${result.thought}`,
    "",
    "Likely Origin Candidates",
  ];

  if (!result.candidates.length) {
    lines.push("No high-precision origin candidates met the threshold.");
    return lines.join("\n");
  }

  result.candidates.forEach((candidate, index) => {
    const source = candidate.sources[0]?.domain ?? candidate.sources[0]?.url ?? "captured activity";
    lines.push(`${index + 1}. ${candidate.source_label}`);
    lines.push(`   source=${source} score=${candidate.score.toFixed(3)} overlap=${candidate.token_overlap}`);
    lines.push(`   reason=${candidate.reason}`);
  });

  return lines.join("\n");
}

function scoreRecord(thought, thoughtTokens, thoughtBigrams, record) {
  const recordText = collectRecordText(record);
  const recordTokens = tokenize(recordText);
  const recordTokenSet = new Set(recordTokens);
  const tokenOverlap = thoughtTokens.filter((token) => recordTokenSet.has(token));
  const recordTextLower = recordText.toLowerCase();
  const exactPhraseHits = thoughtBigrams.filter((bigram) => recordTextLower.includes(bigram)).length;
  const tokenScore = thoughtTokens.length ? tokenOverlap.length / thoughtTokens.length : 0;
  const phraseScore = thoughtBigrams.length ? exactPhraseHits / thoughtBigrams.length : 0;
  const score = Number(((tokenScore * 0.65) + (phraseScore * 0.35)).toFixed(4));

  return {
    id: record.id,
    source_label: record.source_label ?? "captured activity",
    score,
    token_overlap: tokenOverlap.length,
    overlapping_terms: Array.from(new Set(tokenOverlap)).slice(0, 12),
    exact_phrase_hits: exactPhraseHits,
    canonical_themes: record.canonical_themes ?? [],
    sources: record.sources ?? [],
    evidence: record.evidence ?? {},
    claim_type: "origin_candidate",
    reason: buildReason(score, tokenOverlap.length, exactPhraseHits),
  };
}

function buildReason(score, tokenOverlap, phraseHits) {
  if (phraseHits >= 2) {
    return "close phrase overlap with the thought and matching activity evidence";
  }
  if (score >= 0.55) {
    return "strong term overlap with the thought";
  }
  return `some wording overlap with the thought (${tokenOverlap} matched terms)`;
}

function collectRecordText(record) {
  const parts = [
    record.source_label,
    ...(record.canonical_themes ?? []),
    record.evidence?.title,
    record.evidence?.url,
    record.evidence?.text_excerpt,
  ];

  (record.sources ?? []).forEach((source) => {
    parts.push(source.title, source.url, source.domain);
  });

  return parts.filter((value) => typeof value === "string" && value.trim()).join(" ");
}

function tokenize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function makeNgrams(tokens, size) {
  const grams = [];
  for (let i = 0; i <= tokens.length - size; i += 1) {
    grams.push(tokens.slice(i, i + size).join(" "));
  }
  return grams;
}
