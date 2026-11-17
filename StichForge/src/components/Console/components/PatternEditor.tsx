
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ClipboardEvent,
  KeyboardEvent,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import type { PatternRow } from "../types/PatternRow";

import {
  createRow,
  updateRow,
  removeRow,
} from "../utils/roundNumbering";

import { validatePatternRows } from "../utils/semanticValidator";

interface PatternEditorProps {
  rows: PatternRow[];
  onChange: (rows: PatternRow[]) => void;
}

interface FocusTarget {
  rowId: string;
  position: number;
}

export default function PatternEditor({
  rows,
  onChange,
}: PatternEditorProps) {
  const inputRefs = useRef<
    Map<string, HTMLInputElement>
  >(new Map());

  const [focusTarget, setFocusTarget] =
    useState<FocusTarget | null>(null);

  const validations = useMemo(
    () => validatePatternRows(rows),
    [rows]
  );

  useLayoutEffect(() => {
    if (!focusTarget) return;

    const input = inputRefs.current.get(
      focusTarget.rowId
    );

    if (input) {
      input.focus();
      input.setSelectionRange(
        focusTarget.position,
        focusTarget.position
      );
    }

    setFocusTarget(null);
  }, [rows, focusTarget]);

  const handleEnter = (
    row: PatternRow,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    const input = event.currentTarget;

    const start =
      input.selectionStart ?? row.content.length;

    const end =
      input.selectionEnd ?? start;

    const beforeCursor =
      row.content.slice(0, start);

    const afterCursor =
      row.content.slice(end);

    const newRow = createRow(afterCursor);

    const index = rows.findIndex(
      (item) => item.id === row.id
    );

    if (index === -1) return;

    const updatedRows = [...rows];

    updatedRows[index] = {
      ...row,
      content: beforeCursor,
    };

    updatedRows.splice(index + 1, 0, newRow);

    onChange(updatedRows);

    setFocusTarget({
      rowId: newRow.id,
      position: 0,
    });
  };

  const handleBackspace = (
    row: PatternRow,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    const input = event.currentTarget;

    if (
      input.selectionStart !== 0 ||
      input.selectionEnd !== 0
    ) {
      return;
    }

    const index = rows.findIndex(
      (item) => item.id === row.id
    );

    if (index <= 0) return;

    event.preventDefault();

    const previousRow = rows[index - 1];

    const updatedRows = updateRow(
      rows,
      previousRow.id,
      previousRow.content + row.content
    );

    onChange(
      removeRow(updatedRows, row.id)
    );

    setFocusTarget({
      rowId: previousRow.id,
      position: previousRow.content.length,
    });
  };

  const handlePaste = (
    row: PatternRow,
    event: ClipboardEvent<HTMLInputElement>
  ) => {
    const pastedText =
      event.clipboardData.getData("text");

    if (!/\r|\n/.test(pastedText)) return;

    event.preventDefault();

    const input = event.currentTarget;

    const start =
      input.selectionStart ?? row.content.length;

    const end =
      input.selectionEnd ?? start;

    const beforeCursor =
      row.content.slice(0, start);

    const afterCursor =
      row.content.slice(end);

    const pastedLines =
      pastedText.split(/\r\n|\n|\r/);

    const index = rows.findIndex(
      (item) => item.id === row.id
    );

    if (index === -1) return;

    const updatedRows = [...rows];

    updatedRows[index] = {
      ...row,
      content: beforeCursor + pastedLines[0],
    };

    const newRows = pastedLines
      .slice(1)
      .map((line, lineIndex) => {
        const isLast =
          lineIndex === pastedLines.length - 2;

        return createRow(
          isLast
            ? line + afterCursor
            : line
        );
      });

    updatedRows.splice(
      index + 1,
      0,
      ...newRows
    );

    onChange(updatedRows);

    const lastRow =
      newRows[newRows.length - 1];

    setFocusTarget({
      rowId: lastRow.id,
      position:
        pastedLines[pastedLines.length - 1].length,
    });
  };

  const handleKeyDown = (
    row: PatternRow,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.nativeEvent.isComposing) return;

    if (event.key === "Enter") {
      handleEnter(row, event);
    } else if (event.key === "Backspace") {
      handleBackspace(row, event);
    }
  };

  return (
    <div className="console-editor">
      <div className="pattern-rows">
        {rows.map((row, index) => {
          const validation =
            validations[row.id] ?? { valid: true };

          const isEmpty = !row.content.trim();

          return (
            <div
              className={`pattern-row ${
                !validation.valid
                  ? "pattern-row-error"
                  : ""
              }`}
              key={row.id}
            >
              <span className="pattern-round">
                R{index + 1}:
              </span>

              <div className="pattern-input-wrapper">
                <input
                  ref={(element) => {
                    if (element) {
                      inputRefs.current.set(
                        row.id,
                        element
                      );
                    } else {
                      inputRefs.current.delete(
                        row.id
                      );
                    }
                  }}
                  type="text"
                  value={row.content}
                  onChange={(event) =>
                    onChange(
                      updateRow(
                        rows,
                        row.id,
                        event.target.value
                      )
                    )
                  }
                  onKeyDown={(event) =>
                    handleKeyDown(row, event)
                  }
                  onPaste={(event) =>
                    handlePaste(row, event)
                  }
                  placeholder={
                    index === 0
                      ? "6 sc in mr"
                      : "Enter stitches..."
                  }
                  spellCheck={false}
                  aria-label={`Round ${index + 1}`}
                  aria-invalid={!validation.valid}
                  title={
                    validation.valid
                      ? ""
                      : validation.message
                  }
                />

                {!isEmpty && (
                  <span className="pattern-validation-icon">
                    {validation.valid ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <AlertCircle size={15} />
                    )}
                  </span>
                )}
              </div>

              {!validation.valid && (
                <span className="pattern-error-message">
                  {validation.message}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
