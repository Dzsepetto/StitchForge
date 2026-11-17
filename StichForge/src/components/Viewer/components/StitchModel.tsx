
import { useEffect, useMemo } from "react";

import {
  BufferGeometry,
  Float32BufferAttribute,
  SphereGeometry,
} from "three";

import type { StitchRound } from "../../../utils/patternInterpreter";

interface StitchModelProps {
  rounds: StitchRound[];
}

type Position = [number, number, number];

interface StitchPoint {
  id: string;
  position: Position;
  color: string;
}

interface GeneratedShape {
  points: StitchPoint[];
  connections: BufferGeometry;
}

const COLORS = [
  "#ddd6fe",
  "#c4b5fd",
  "#a78bfa",
  "#8b5cf6",
  "#7c3aed",
];

const STITCH_WIDTH = 0.3;
const ROUND_HEIGHT = 0.15;
const STITCH_RADIUS = 0.04;

function generateShape(
  rounds: StitchRound[]
): GeneratedShape {
  const points: StitchPoint[] = [];
  const linePositions: number[] = [];

  const positionById = new Map<string, Position>();

  const heightOffset =
    ((rounds.length - 1) * ROUND_HEIGHT) / 2;

  rounds.forEach((round, roundIndex) => {
    const count = round.stitches.length;

    if (count === 0) return;

    const radius =
      (count * STITCH_WIDTH) / (2 * Math.PI);

    const height =
      roundIndex * ROUND_HEIGHT - heightOffset;

    const currentRing: Position[] = [];

    round.stitches.forEach((stitch, stitchIndex) => {
      const angle =
        (stitchIndex / count) * Math.PI * 2;

      const position: Position = [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius,
      ];

      currentRing.push(position);

      positionById.set(stitch.id, position);

      points.push({
        id: stitch.id,
        position,
        color: COLORS[roundIndex % COLORS.length],
      });

      // Connect each stitch to its real parents.
      for (const parentId of stitch.parents) {
        const parentPosition = positionById.get(parentId);

        if (parentPosition) {
          linePositions.push(
            ...parentPosition,
            ...position
          );
        }
      }

      // Connect neighboring stitches in the same round.
      if (stitchIndex > 0) {
        const previous = currentRing[stitchIndex - 1];

        linePositions.push(
          ...previous,
          ...position
        );
      }
    });

    // Close the current ring.
    if (currentRing.length > 2) {
      linePositions.push(
        ...currentRing[currentRing.length - 1],
        ...currentRing[0]
      );
    }
  });

  const connections = new BufferGeometry();

  connections.setAttribute(
    "position",
    new Float32BufferAttribute(
      linePositions,
      3
    )
  );

  return {
    points,
    connections,
  };
}

export default function StitchModel({
  rounds,
}: StitchModelProps) {
  const stitchGeometry = useMemo(
    () =>
      new SphereGeometry(
        STITCH_RADIUS,
        12,
        12
      ),
    []
  );

  const shape = useMemo(
    () => generateShape(rounds),
    [rounds]
  );

  useEffect(() => {
    return () => {
      stitchGeometry.dispose();
    };
  }, [stitchGeometry]);

  useEffect(() => {
    return () => {
      shape.connections.dispose();
    };
  }, [shape]);

  return (
    <group>
      <lineSegments geometry={shape.connections}>
        <lineBasicMaterial
          color="#8b82a8"
          transparent
          opacity={0.45}
        />
      </lineSegments>

      {shape.points.map((point) => (
        <mesh
          key={point.id}
          position={point.position}
          geometry={stitchGeometry}
        >
          <meshStandardMaterial
            color={point.color}
            roughness={0.7}
            metalness={0.05}
          />
        </mesh>
      ))}
    </group>
  );
}
