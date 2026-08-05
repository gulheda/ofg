"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const Pcb3DBoard = dynamic(() => import("./Pcb3DBoard"), { ssr: false });

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Desktop-only 3D centerpiece: a slowly turning circuit board that tilts
 * toward the pointer and sinks away as the page scrolls past the hero.
 * Mobile skips WebGL entirely — the 2D canvas board carries the motif there.
 */
export default function Pcb3DHero() {
  const reducedMotion = useReducedMotion();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(supportsWebGL());
  }, []);

  if (!ready) return null;

  return <Pcb3DBoard reducedMotion={Boolean(reducedMotion)} />;
}
