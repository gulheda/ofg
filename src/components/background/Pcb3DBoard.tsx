"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const ACCENT = "#3B82F6";
const CYAN = "#22D3EE";
const VIOLET = "#8B5CF6";

interface TraceSpec {
  x: number;
  z: number;
  length: number;
  rotationY: number;
  color: string;
}

interface NodeSpec {
  x: number;
  z: number;
  color: string;
}

interface ChipSpec {
  x: number;
  z: number;
  w: number;
  d: number;
}

/** One-time procedural layout for the 3D board — an L-routed trace network with vias and IC blocks. */
function useBoardLayout() {
  return useMemo(() => {
    const rng = (() => {
      let a = 0x9e3779b1;
      return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    })();

    const traces: TraceSpec[] = [];
    const nodes: NodeSpec[] = [];
    const chips: ChipSpec[] = [];
    const colors = [ACCENT, ACCENT, CYAN, VIOLET];

    const chipPositions = [
      { x: -0.55, z: -0.3, w: 0.42, d: 0.42 },
      { x: 0.5, z: 0.25, w: 0.3, d: 0.3 },
      { x: -0.1, z: 0.55, w: 0.26, d: 0.2 },
    ];
    chips.push(...chipPositions);

    for (let i = 0; i < 16; i++) {
      const fromChip = chipPositions[i % chipPositions.length];
      const angle = Math.floor(rng() * 4) * (Math.PI / 2);
      const len = 0.35 + rng() * 0.55;
      const x = fromChip.x + Math.cos(angle) * (fromChip.w / 2 + len / 2);
      const z = fromChip.z + Math.sin(angle) * (fromChip.d / 2 + len / 2);
      traces.push({
        x: THREE.MathUtils.clamp(x, -1.35, 1.35),
        z: THREE.MathUtils.clamp(z, -0.85, 0.85),
        length: len,
        rotationY: angle,
        color: colors[Math.floor(rng() * colors.length)],
      });
      nodes.push({
        x: THREE.MathUtils.clamp(x + Math.cos(angle) * (len / 2), -1.35, 1.35),
        z: THREE.MathUtils.clamp(z + Math.sin(angle) * (len / 2), -0.85, 0.85),
        color: rng() < 0.7 ? CYAN : VIOLET,
      });
    }

    return { traces, nodes, chips };
  }, []);
}

function Board({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const scrollT = useRef(0);
  const { traces, nodes, chips } = useBoardLayout();

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      const max = window.innerHeight;
      scrollT.current = Math.min(window.scrollY / max, 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    if (!reducedMotion) {
      g.rotation.y += delta * 0.12;
    }
    const targetX = 0.4 + (reducedMotion ? 0 : -pointer.current.y * 0.12) + scrollT.current * 0.25;
    const targetZ = reducedMotion ? 0 : pointer.current.x * 0.08;
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, targetX, 4, delta);
    g.rotation.z = THREE.MathUtils.damp(g.rotation.z, targetZ, 4, delta);
    g.position.y = THREE.MathUtils.damp(g.position.y, -scrollT.current * 0.9, 4, delta);
  });

  return (
    <group ref={group} rotation={[0.4, 0.5, 0]}>
      {/* substrate */}
      <mesh position={[0, -0.02, 0]} receiveShadow={false}>
        <boxGeometry args={[3, 0.06, 2]} />
        <meshStandardMaterial color="#131318" roughness={0.55} metalness={0.4} />
      </mesh>

      {chips.map((chip, i) => (
        <mesh key={`chip-${i}`} position={[chip.x, 0.05, chip.z]}>
          <boxGeometry args={[chip.w, 0.09, chip.d]} />
          <meshStandardMaterial color="#18181b" roughness={0.4} metalness={0.6} />
        </mesh>
      ))}

      {traces.map((t, i) => (
        <mesh key={`trace-${i}`} position={[t.x, 0.015, t.z]} rotation={[0, t.rotationY, 0]}>
          <boxGeometry args={[t.length, 0.012, 0.032]} />
          <meshStandardMaterial
            color={t.color}
            emissive={t.color}
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
      ))}

      {nodes.map((n, i) => (
        <mesh key={`via-${i}`} position={[n.x, 0.03, n.z]}>
          <cylinderGeometry args={[0.032, 0.032, 0.02, 12]} />
          <meshStandardMaterial
            color={n.color}
            emissive={n.color}
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Aims the camera at the board once — R3F does not do this for you by default. */
function CameraRig() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

/** The bare WebGL scene — kept separate so the parent can lazy-load it without SSR. */
export default function Pcb3DBoard({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.35, 3.6], fov: 32 }}
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
    >
      <CameraRig />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 2]} intensity={1.2} color="#c7d2fe" />
      <pointLight position={[-2.5, -1, 2]} intensity={0.7} color={ACCENT} />
      <Board reducedMotion={reducedMotion} />
    </Canvas>
  );
}
