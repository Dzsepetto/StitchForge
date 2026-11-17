
import type { PatternRow } from "../components/Console/types/PatternRow";
import type { Token } from "../components/Console/types/ValidationResult";

import { tokenize } from "../components/Console/utils/lexer";
import { validatePatternRow } from "../components/Console/utils/validator";

export type StitchType = "sc" | "inc" | "dec";

export interface Stitch {
  id: string;
  type: StitchType;
  parents: string[];
}

export interface StitchRound {
  id: string;
  number: number;
  stitchCount: number;
  stitches: Stitch[];
}

interface StitchOperation {
  type: StitchType;
  inMagicRing: boolean;
}

const MAX_STITCHES_PER_ROUND = 5000;

function parseOperations(tokens: Token[]): StitchOperation[] {
  let index = 0;

  const current = () => tokens[index];

  const parseStitch = (): StitchOperation[] => {
    const quantity = Number(current().value);
    index++;

    const type = current().value;
    index++;

    let inMagicRing = false;

    if (current()?.type === "IN") {
      index += 2;
      inMagicRing = true;
    }

    if (
      type !== "sc" &&
      type !== "inc" &&
      type !== "dec"
    ) {
      throw new Error(`Unsupported 3D stitch: ${type}`);
    }

    if (
      !Number.isSafeInteger(quantity) ||
      quantity <= 0 ||
      quantity > MAX_STITCHES_PER_ROUND
    ) {
      throw new Error("Invalid stitch quantity");
    }

    return Array.from({ length: quantity }, () => ({
      type,
      inMagicRing,
    }));
  };

  const parseItem = (): StitchOperation[] => {
    if (current()?.type !== "LPAREN") {
      return parseStitch();
    }

    index++;

    const group = [...parseStitch()];

    while (current()?.type === "COMMA") {
      index++;
      group.push(...parseStitch());

      if (group.length > MAX_STITCHES_PER_ROUND) {
        throw new Error("Too many stitches");
      }
    }

    index++; // RPAREN
    index++; // REPEAT

    const repetitions = Number(current().value);
    index++;

    if (
      !Number.isSafeInteger(repetitions) ||
      repetitions <= 0 ||
      group.length * repetitions > MAX_STITCHES_PER_ROUND
    ) {
      throw new Error("Invalid repetition count");
    }

    return Array.from(
      { length: repetitions },
      () => group
    ).flat();
  };

  const operations = [...parseItem()];

  while (current()?.type === "COMMA") {
    index++;
    operations.push(...parseItem());

    if (operations.length > MAX_STITCHES_PER_ROUND) {
      throw new Error("Too many stitches");
    }
  }

  return operations;
}

export function interpretPattern(
  rows: PatternRow[]
): StitchRound[] {
  const rounds: StitchRound[] = [];

  let previousStitches: Stitch[] = [];

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];

    if (!row.content.trim()) {
      if (rounds.length > 0) break;
      continue;
    }

    const validation = validatePatternRow(row.content);

    if (!validation.valid) break;

    let operations: StitchOperation[];

    try {
      operations = parseOperations(tokenize(row.content));
    } catch {
      break;
    }

    const isFirstRound = rounds.length === 0;
    const stitches: Stitch[] = [];

    let parentIndex = 0;
    let valid = true;

    if (isFirstRound) {
      valid = operations.every(
        (operation) =>
          operation.type === "sc" &&
          operation.inMagicRing
      );
    } else {
      valid = operations.every(
        (operation) => !operation.inMagicRing
      );
    }

    if (!valid) break;

    for (const operation of operations) {
      const parents: string[] = [];

      if (!isFirstRound) {
        const consumed =
          operation.type === "dec" ? 2 : 1;

        if (
          parentIndex + consumed >
          previousStitches.length
        ) {
          valid = false;
          break;
        }

        for (let i = 0; i < consumed; i++) {
          parents.push(
            previousStitches[parentIndex + i].id
          );
        }

        parentIndex += consumed;
      }

      const outputCount =
        operation.type === "inc" ? 2 : 1;

      for (let i = 0; i < outputCount; i++) {
        stitches.push({
          id: `${row.id}-${stitches.length}`,
          type: operation.type,
          parents: [...parents],
        });
      }

      if (stitches.length > MAX_STITCHES_PER_ROUND) {
        valid = false;
        break;
      }
    }

    if (
      !valid ||
      (!isFirstRound &&
        parentIndex !== previousStitches.length)
    ) {
      break;
    }

    rounds.push({
      id: row.id,
      number: index + 1,
      stitchCount: stitches.length,
      stitches,
    });

    previousStitches = stitches;
  }

  return rounds;
}