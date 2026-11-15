
import type { Token, TokenType } from "../types/ValidationResult";

export class LexerError extends Error {
  public readonly position: number;

  constructor(message: string, position: number) {
    super(message);

    this.name = "LexerError";
    this.position = position;
  }
}

const STITCHES = new Set([
  "sc",
  "inc",
  "dec",
  "ch",
  "sl st",
]);

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;

  while (position < input.length) {
    const remaining = input.slice(position);

    if (/^\s/.test(remaining)) {
      position++;
      continue;
    }

    const number = remaining.match(/^\d+/);

    if (number) {
      tokens.push({
        type: "NUMBER",
        value: number[0],
        position,
      });

      position += number[0].length;
      continue;
    }

    const word = remaining.match(/^[a-z]+(?:\s+st)?/i);

    if (word) {
      const value = word[0].toLowerCase();

      let type: TokenType;

      if (STITCHES.has(value)) {
        type = "STITCH";
      } else if (value === "mr") {
        type = "MAGIC_RING";
      } else if (value === "in") {
        type = "IN";
      } else if (value === "x") {
        type = "REPEAT";
      } else {
        throw new LexerError(
          `Unknown instruction: "${word[0]}"`,
          position
        );
      }

      tokens.push({ type, value, position });
      position += word[0].length;
      continue;
    }

    const symbols: Record<string, TokenType> = {
      "(": "LPAREN",
      ")": "RPAREN",
      ",": "COMMA",
    };

    const symbol = symbols[input[position]];

    if (symbol) {
      tokens.push({
        type: symbol,
        value: input[position],
        position,
      });

      position++;
      continue;
    }

    throw new LexerError(
      `Unexpected character: "${input[position]}"`,
      position
    );
  }

  return tokens;
}
