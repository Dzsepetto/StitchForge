
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Box, Rotate3D } from "lucide-react";

import StitchModel from "./components/StitchModel";
import type { StitchRound } from "../../utils/patternInterpreter";
import "./Viewer.css";

interface ViewerProps {
  rounds: StitchRound[];
}

export default function Viewer({ rounds }: ViewerProps) {
  const totalStitches = rounds.reduce(
    (sum, round) => sum + round.stitchCount,
    0
  );

  return (
    <div className="viewer-panel">
      <div className="viewer-header">
        <Box size={17} />
        <span>3D Viewer</span>

        <span className="viewer-status">
          {rounds.length} rounds · {totalStitches} stitches
        </span>
      </div>

      <div className="viewer-content">
        <Canvas
          camera={{
            position: [4, 4, 5],
            fov: 45,
            near: 0.1,
            far: 100,
          }}
          dpr={[1, 2]}
          gl={{ antialias: true }}
        >
          <color
            attach="background"
            args={["#23262e"]}
          />

          <ambientLight intensity={1.4} />

          <directionalLight
            position={[5, 8, 5]}
            intensity={2}
          />

          <StitchModel rounds={rounds} />

          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            enablePan={false}
            minDistance={2}
            maxDistance={20}
            target={[0, 0, 0]}
          />
        </Canvas>

        {rounds.length === 0 && (
          <div className="viewer-empty">
            Enter a valid pattern to preview stitches
          </div>
        )}

        <div className="viewer-hint">
          <Rotate3D size={15} />
          <span>Drag to rotate · Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
}
