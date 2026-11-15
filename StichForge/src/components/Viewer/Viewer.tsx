import { Box } from "lucide-react";
import "./Viewer.css";

export default function Viewer() {
  return (
    <div className="viewer-panel">
      <div className="viewer-placeholder">
        <div className="viewer-placeholder-icon">
          <Box size={42} strokeWidth={1.5} />
        </div>

        <h2>3D Viewer</h2>
        <p>Under Development</p>

        <span>
          Your crochet creations will come to life here.
        </span>
      </div>
    </div>
  );
}