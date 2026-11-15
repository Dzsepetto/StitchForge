
import type { PatternRow } from "../types/PatternRow";

export function createRow(content = ""): PatternRow {
  return {
    id: crypto.randomUUID(),
    content,
  };
}

export function updateRow(
  rows: PatternRow[],
  rowId: string,
  content: string
): PatternRow[] {
  return rows.map((row) =>
    row.id === rowId ? { ...row, content } : row
  );
}

export function insertRow(
  rows: PatternRow[],
  afterRowId: string,
  content = ""
): PatternRow[] {
  const index = rows.findIndex(
    (row) => row.id === afterRowId
  );

  if (index === -1) return rows;

  const updatedRows = [...rows];

  updatedRows.splice(index + 1, 0, createRow(content));

  return updatedRows;
}

export function removeRow(
  rows: PatternRow[],
  rowId: string
): PatternRow[] {
  if (rows.length <= 1) return rows;

  return rows.filter((row) => row.id !== rowId);
}

export function serializePattern(rows: PatternRow[]): string {
  return rows
    .map((row, index) => `R${index + 1}: ${row.content}`)
    .join("\n");
}
