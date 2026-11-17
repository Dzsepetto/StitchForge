
import { useMemo, useState } from "react";

import Console from "./components/Console/Console";
import Viewer from "./components/Viewer/Viewer";

import type { PatternRow } from "./components/Console/types/PatternRow";
import { createRow } from "./components/Console/utils/roundNumbering";
import { interpretPattern } from "./utils/patternInterpreter";

import "./App.css";

export default function App() {
  const [rows, setRows] = useState<PatternRow[]>(() => [
    createRow(),
  ]);

  const rounds = useMemo(
    () => interpretPattern(rows),
    [rows]
  );

  return (
    <div className="app">
      <Console
        rows={rows}
        onChange={setRows}
      />

      <Viewer rounds={rounds} />
    </div>
  );
}
