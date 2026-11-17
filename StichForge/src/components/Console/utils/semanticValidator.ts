
import type { PatternRow } from "../types/PatternRow";
import type { ValidationResult } from "../types/ValidationResult";

import { validatePatternRow } from "./validator";
import { interpretPattern } from "../../../utils/patternInterpreter";

export type RowValidationMap = Record<
  string,
  ValidationResult
>;

export function validatePatternRows(
  rows: PatternRow[]
): RowValidationMap {
  const results: RowValidationMap = {};

  const rounds = interpretPattern(rows);

  const validRoundIds = new Set(
    rounds.map((round) => round.id)
  );

  let previousRoundValid = true;

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const content = row.content.trim();

    if (!content) {
      results[row.id] = { valid: true };

      if (index > 0) {
        previousRoundValid = false;
      }

      continue;
    }

    const syntax = validatePatternRow(row.content);

    if (!syntax.valid) {
      results[row.id] = syntax;
      previousRoundValid = false;
      continue;
    }

    if (!previousRoundValid) {
      results[row.id] = {
        valid: false,
        message:
          "Fix the previous round before continuing.",
      };

      continue;
    }

    if (!validRoundIds.has(row.id)) {
      results[row.id] = {
        valid: false,
        message: getSemanticError(rows, index),
      };

      previousRoundValid = false;
      continue;
    }

    results[row.id] = { valid: true };
  }

  return results;
}

function getSemanticError(
  rows: PatternRow[],
  index: number
): string {
  const row = rows[index];

  if (index === 0) {
    return 'The first round must start with "sc in mr".';
  }

  if (/\bin\s+mr\b/i.test(row.content)) {
    return "Magic ring is only allowed in the first round.";
  }

  return (
    "Stitch count mismatch. " +
    "This round must consume exactly the " +
    "stitches produced by the previous round."
  );
}
