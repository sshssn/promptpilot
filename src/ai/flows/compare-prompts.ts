'use server';

/**
 * @fileOverview Local, fast prompt comparison without external AI calls.
 * Produces a heuristic analysis using diff-like signals so the UI never blocks.
 */

import { z } from 'zod';

const ComparePromptsInputSchema = z.object({
  originalPrompt: z.string(),
  improvedPrompt: z.string(),
  context: z.string().optional(),
  files: z
    .array(
      z.object({
    name: z.string(),
    mimeType: z.string(),
        data: z.string(),
      })
    )
    .optional(),
});

export type ComparePromptsInput = z.infer<typeof ComparePromptsInputSchema>;

const ComparePromptsOutputSchema = z.object({
  summary: z.string(),
  improvements: z.array(
    z.object({
      category: z.string(),
      description: z.string(),
      impact: z.string(),
    })
  ),
  metrics: z.object({
    clarityScore: z.number().min(0).max(10),
    specificityScore: z.number().min(0).max(10),
    structureScore: z.number().min(0).max(10),
    overallScore: z.number().min(0).max(10),
  }),
  beforeAfterAnalysis: z.object({
    beforeStrengths: z.array(z.string()),
    beforeWeaknesses: z.array(z.string()),
    afterStrengths: z.array(z.string()),
    keyChanges: z.array(z.string()),
  }),
  recommendations: z.array(z.string()),
});

export type ComparePromptsOutput = z.infer<typeof ComparePromptsOutputSchema>;

export async function comparePrompts(
  input: ComparePromptsInput
): Promise<ComparePromptsOutput> {
  // Validate input quickly (sync); keep async signature for compatibility
  ComparePromptsInputSchema.parse(input);
  return computeLocalComparison(input);
}

function computeLocalComparison(input: ComparePromptsInput): ComparePromptsOutput {
  const original = input.originalPrompt || '';
  const improved = input.improvedPrompt || '';

  const originalLines = original.split('\n');
  const improvedLines = improved.split('\n');

  const maxLines = Math.max(originalLines.length, improvedLines.length);
  let unchangedLines = 0;
  let addedLines = 0;
  let removedLines = 0;
  const keyChanges: string[] = [];

  for (let i = 0; i < maxLines; i++) {
    const o = originalLines[i] || '';
    const n = improvedLines[i] || '';
    if (i >= originalLines.length && n.trim() !== '') {
      addedLines++;
      keyChanges.push(`Added: "${truncate(n)}"`);
    } else if (i >= improvedLines.length && o.trim() !== '') {
      removedLines++;
      keyChanges.push(`Removed: "${truncate(o)}"`);
    } else if (o === n) {
      unchangedLines++;
    } else if (o.trim() !== n.trim()) {
      // changed
      if (o.trim()) removedLines++;
      if (n.trim()) addedLines++;
      keyChanges.push(`Changed line ${i + 1}`);
    }
  }

  // Heuristic scoring
  const vaguenessTerms = [
    'etc',
    'something',
    'maybe',
    'somehow',
    'basically',
    'kind of',
    'sort of',
  ];
  const countOccurrences = (text: string, terms: string[]) =>
    terms.reduce((acc, term) => acc + (text.toLowerCase().match(new RegExp(`\\b${escapeRegExp(term)}\\b`, 'g'))?.length || 0), 0);

  const vagueBefore = countOccurrences(original, vaguenessTerms);
  const vagueAfter = countOccurrences(improved, vaguenessTerms);

  const hasBulletsAfter = /(^|\n)\s*[-•\*]/.test(improved);
  const hasHeadingsAfter = /(^|\n)\s*#{1,6}\s+\S|(^|\n)\s*[A-Z][A-Za-z0-9 ]+:/.test(improved);
  const hasExamplesAfter = /(e\.g\.|for example|example:)/i.test(improved);
  const hasConstraintsAfter = /(must|should|exactly|at least|no more than|within \d+)/i.test(improved);

  const lengthBefore = original.trim().length;
  const lengthAfter = improved.trim().length;

  let clarity = 6 + Math.max(0, vagueBefore - vagueAfter); // fewer vague terms boosts
  if (hasHeadingsAfter) clarity += 1;
  clarity = clamp(clarity, 1, 10);

  let specificity = 5 + (hasExamplesAfter ? 2 : 0) + (hasConstraintsAfter ? 2 : 0);
  if (lengthAfter > lengthBefore) specificity += 1;
  specificity = clamp(specificity, 1, 10);

  let structure = 5 + (hasBulletsAfter ? 2 : 0) + (hasHeadingsAfter ? 2 : 0);
  structure = clamp(structure, 1, 10);

  const overall = Math.round((clarity + specificity + structure) / 3);

  const improvements: Array<{ category: string; description: string; impact: string }> = [];
  if (vagueAfter < vagueBefore) {
    improvements.push({
      category: 'Clarity',
      description: 'Reduced vague terms and improved direct language.',
      impact: 'Easier for the model to follow instructions precisely.',
    });
  }
  if (hasExamplesAfter) {
    improvements.push({
      category: 'Specificity',
      description: 'Added examples to illustrate expected outputs.',
      impact: 'Reduces ambiguity and guides model responses.',
    });
  }
  if (hasConstraintsAfter) {
    improvements.push({
      category: 'Constraints',
      description: 'Introduced explicit constraints and acceptance criteria.',
      impact: 'Improves determinism and evaluation of results.',
    });
  }
  if (hasBulletsAfter || hasHeadingsAfter) {
    improvements.push({
      category: 'Structure',
      description: 'Organized content with headings and/or bullet points.',
      impact: 'Improves readability and step-by-step execution.',
    });
  }

  const beforeStrengths: string[] = [];
  const beforeWeaknesses: string[] = [];
  if (lengthBefore > 0) beforeStrengths.push('Provides initial guidance to the model.');
  if (vagueBefore > 0) beforeWeaknesses.push('Contains vague or filler terms.');
  if (!/(-|•|\*)/.test(original)) beforeWeaknesses.push('Lacks bullet points for key steps.');

  const afterStrengths: string[] = [];
  if (hasBulletsAfter) afterStrengths.push('Uses bullet points to enumerate steps/requirements.');
  if (hasExamplesAfter) afterStrengths.push('Includes concrete examples for clarity.');
  if (hasConstraintsAfter) afterStrengths.push('Defines constraints and measurable criteria.');

  const recommendations: string[] = [];
  if (!hasExamplesAfter) recommendations.push('Add 1–2 short examples of ideal output.');
  if (!hasConstraintsAfter) recommendations.push('State explicit constraints or acceptance criteria.');
  if (!hasBulletsAfter) recommendations.push('Use bullet points to separate instructions.');
  if (vagueAfter > 0) recommendations.push('Remove vague terms (e.g., etc, maybe, something).');

  const summary = buildSummary({ addedLines, removedLines, clarity, specificity, structure, overall });

  return ComparePromptsOutputSchema.parse({
    summary,
    improvements,
    metrics: {
      clarityScore: clarity,
      specificityScore: specificity,
      structureScore: structure,
      overallScore: overall,
    },
    beforeAfterAnalysis: {
      beforeStrengths,
      beforeWeaknesses,
      afterStrengths,
      keyChanges,
    },
    recommendations,
  });
}

function truncate(text: string, max: number = 80): string {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSummary(params: {
  addedLines: number;
  removedLines: number;
  clarity: number;
  specificity: number;
  structure: number;
  overall: number;
}): string {
  const { addedLines, removedLines, clarity, specificity, structure, overall } = params;
  const changes: string[] = [];
  if (addedLines > 0) changes.push(`${addedLines} additions`);
  if (removedLines > 0) changes.push(`${removedLines} removals`);
  const changeText = changes.length ? ` (${changes.join(', ')})` : '';
  return `Improved prompt reflects clearer structure and higher specificity${changeText}. Scores — Clarity: ${clarity}/10, Specificity: ${specificity}/10, Structure: ${structure}/10, Overall: ${overall}/10.`;
}
