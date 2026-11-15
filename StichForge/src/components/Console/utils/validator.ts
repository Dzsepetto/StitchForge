
import { LexerError, tokenize } from "./lexer";
import type {
  Token,
  ValidationResult,
} from "../types/ValidationResult";

class SyntaxError extends Error {
  public readonly position: number;

  constructor(message: string, position: number) {
    super(message);

    this.name = "PatternSyntaxError";
    this.position = position;
  }
}

export function validatePatternRow(
  input: string
): ValidationResult {
  if (!input.trim()) {
    return { valid: true };
  }

  try {
    const tokens = tokenize(input);
    let index = 0;

    const current = (): Token | undefined => tokens[index];

    const expect = (type: Token["type"], message: string) => {
      const token = current();

      if (!token || token.type !== type) {
        throw new SyntaxError(
          message,
          token?.position ?? input.length
        );
      }

      index++;
      return token;
    };

    const parseStitch = () => {
      expect("NUMBER", "Expected a stitch count");

      const stitch = expect(
        "STITCH",
        "Expected a stitch type"
      );

      if (stitch.value === "sc" && current()?.type === "IN") {
        index++;
        expect("MAGIC_RING", 'Expected "mr" after "in"');
      }
    };

    const parseGroup = () => {
      expect("LPAREN", 'Expected "("');

      parseStitch();

      while (current()?.type === "COMMA") {
        index++;
        parseStitch();
      }

      expect("RPAREN", 'Missing closing parenthesis ")"');

      expect("REPEAT", 'Expected "x" after group');

      const count = expect(
        "NUMBER",
        "Expected repetition count"
      );

      if (Number(count.value) <= 0) {
        throw new SyntaxError(
          "Repetition count must be positive",
          count.position
        );
      }
    };

    const parseItem = () => {
      if (current()?.type === "LPAREN") {
        parseGroup();
      } else {
        parseStitch();
      }
    };

    parseItem();

    while (current()?.type === "COMMA") {
      index++;
      parseItem();
    }

    if (index < tokens.length) {
      throw new SyntaxError(
        `Unexpected token: "${tokens[index].value}"`,
        tokens[index].position
      );
    }

    return { valid: true };
  } catch (error) {
    if (
      error instanceof LexerError ||
      error instanceof SyntaxError
    ) {
      return {
        valid: false,
        message: error.message,
        position: error.position,
      };
    }

    throw error;
  }
}
