"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

const CHAR_MS = 55;

interface TypewriterHeadingProps {
  text: string;
  startDelay?: number;
  className?: string;
}

/**
 * A heading that types itself out character by character with a blinking
 * cursor, like a terminal bringing itself up — the site's monospace font
 * is doing the visual work already, this just makes the type feel typed
 * rather than merely set. The full name stays in the DOM at all times
 * (visually hidden) so screen readers and text search never see it as
 * a moving target.
 */
export default function TypewriterHeading({ text, startDelay = 0.18, className }: TypewriterHeadingProps) {
  const reducedMotion = useReducedMotion();
  const [count, setCount] = useState(reducedMotion ? text.length : 0);

  useEffect(() => {
    if (reducedMotion) {
      setCount(text.length);
      return;
    }

    setCount(0);
    let i = 0;
    let interval = 0;
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) window.clearInterval(interval);
      }, CHAR_MS);
    }, startDelay * 1000);

    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [text, startDelay, reducedMotion]);

  return (
    <h1 className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, count)}
        <span
          className={`ml-0.5 inline-block h-[0.8em] w-[2px] translate-y-[0.06em] bg-accent align-middle ${
            reducedMotion ? "" : "animate-[blink_0.9s_steps(1)_infinite]"
          }`}
        />
      </span>
    </h1>
  );
}
