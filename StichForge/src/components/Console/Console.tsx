
import { useState } from "react";
import { Save, X, FileCode2 } from "lucide-react";
import PatternEditor from "./components/PatternEditor";
import type { PatternRow } from "./types/PatternRow";
import {
  createRow,
  serializePattern,
} from "./utils/roundNumbering";
import "./Console.css";

export default function Console() {
  const [rows, setRows] = useState<PatternRow[]>(() => [
    createRow(),
  ]);

  const [showSaveModal, setShowSaveModal] = useState(false);
  const [fileName, setFileName] = useState("untitled");

  const handleSave = () => {
    const name = fileName.trim() || "untitled";
    const code = serializePattern(rows);

    const blob = new Blob([code], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${name}.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    setShowSaveModal(false);
  };

  return (
    <div className="console-panel">
      <div className="console-header">
        <FileCode2 size={17} />
        <span>Pattern Editor</span>

        <span className="console-file">
          {fileName}.pattern
        </span>
      </div>

      <PatternEditor
        rows={rows}
        onChange={setRows}
      />

      <div className="console-footer">
        <span>
          {rows.length} {rows.length === 1 ? "round" : "rounds"}
        </span>

        <button
          className="console-save-btn"
          onClick={() => setShowSaveModal(true)}
        >
          <Save size={16} />
          Save Pattern
        </button>
      </div>

      {showSaveModal && (
        <div
          className="console-modal-overlay"
          onClick={() => setShowSaveModal(false)}
        >
          <div
            className="console-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-pattern-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="console-modal-header">
              <h3 id="save-pattern-title">Save Pattern</h3>

              <button
                className="console-modal-close"
                aria-label="Close"
                onClick={() => setShowSaveModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <p>Choose a name for your crochet pattern.</p>

            <label htmlFor="pattern-name">
              File name
            </label>

            <input
              id="pattern-name"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              autoFocus
            />

            <div className="console-modal-actions">
              <button
                className="console-cancel-btn"
                onClick={() => setShowSaveModal(false)}
              >
                Cancel
              </button>

              <button
                className="console-confirm-btn"
                onClick={handleSave}
              >
                <Save size={15} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
