
export type TokenType =
  | "NUMBER"
  | "STITCH"
  | "MAGIC_RING"
  | "IN"
  | "REPEAT"
  | "LPAREN"
  | "RPAREN"
  | "COMMA";

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  position?: number;
}
