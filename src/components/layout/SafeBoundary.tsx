"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  failed: boolean;
}

/**
 * WebGL isn't guaranteed — a driver quirk, a browser without it, a shader
 * that won't compile on some GPU. If the 3D scene throws for any reason,
 * the visitor should still get the whole portfolio, just without the
 * background, rather than a blank crashed page.
 */
export default class SafeBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("3D background failed, falling back silently:", error);
    }
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}
