"use client";

import { useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSiteMotion } from "@/components/site-motion";
import { asciiPortrait } from "@/lib/ascii-portrait";

export function AsciiPortrait() {
  const { ready, motionPaused } = useSiteMotion();
  const portraitRef = useRef<HTMLDivElement>(null);
  const inView = useInView(portraitRef, { margin: "80px" });
  const [pageVisible, setPageVisible] = useState(true);
  const hasRevealed = useRef(false);
  const lines = useMemo(() => {
    const rawLines = asciiPortrait.split("\n");
    const maxLineLength = rawLines.reduce(
      (max, line) => Math.max(max, line.length),
      0,
    );
    return rawLines.map((line) => line.padEnd(maxLineLength, " "));
  }, []);

  const placeholderLines = useMemo(
    () => lines.map((line) => " ".repeat(line.length)),
    [lines],
  );
  const placeholderPortrait = useMemo(
    () => placeholderLines.join("\n"),
    [placeholderLines],
  );
  const fullPortrait = useMemo(() => lines.join("\n"), [lines]);
  const lineChars = useMemo(
    () => lines.map((line) => Array.from(line)),
    [lines],
  );
  const placeholderCharLines = useMemo(
    () => placeholderLines.map((line) => Array.from(line)),
    [placeholderLines],
  );
  const totalCharacters = useMemo(
    () => lineChars.reduce((sum, chars) => sum + chars.length, 0),
    [lineChars],
  );
  const [displayPortrait, setDisplayPortrait] = useState(fullPortrait);
  const [isRevealComplete, setIsRevealComplete] = useState(lines.length === 0);
  const lineCount = lines.length;

  const animationFrameRef = useRef<number | null>(null);
  const rainFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (!ready || hasRevealed.current) return;
    if (motionPaused) {
      hasRevealed.current = true;
      setDisplayPortrait(fullPortrait);
      setIsRevealComplete(true);
      return;
    }
    if (!inView || !pageVisible) return;
    setIsRevealComplete(lines.length === 0);
    setDisplayPortrait(placeholderPortrait);

    if (lines.length === 0 || totalCharacters === 0) {
      return;
    }

    const duration = 1000;
    let startTime: number | null = null;
    let lastRevealedCount = 0;
    let lastFrame = -Infinity;

    const step = (timestamp: number) => {
      if (timestamp - lastFrame < 1000 / 24) {
        animationFrameRef.current = requestAnimationFrame(step);
        return;
      }
      lastFrame = timestamp;
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const revealCount = Math.floor(progress * totalCharacters);

      if (revealCount > lastRevealedCount) {
        const updatedCharLines = placeholderCharLines.map((chars) =>
          chars.slice(),
        );
        let remaining = revealCount;

        for (let row = 0; row < lineChars.length && remaining > 0; row++) {
          const sourceChars = lineChars[row];
          const toReveal = Math.min(sourceChars.length, remaining);

          for (let col = 0; col < toReveal; col++) {
            updatedCharLines[row][col] = sourceChars[col];
          }

          remaining -= toReveal;
        }

        setDisplayPortrait(
          updatedCharLines.map((chars) => chars.join("")).join("\n"),
        );
        lastRevealedCount = revealCount;
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        setDisplayPortrait(fullPortrait);
        setIsRevealComplete(true);
        hasRevealed.current = true;
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [
    ready,
    motionPaused,
    fullPortrait,
    lineChars,
    lines,
    placeholderCharLines,
    placeholderPortrait,
    totalCharacters,
    inView,
    pageVisible,
  ]);

  useEffect(() => {
    if (!isRevealComplete || motionPaused || !inView || !pageVisible) {
      return;
    }

    const rows = lineChars.length;
    const cols = lineChars[0]?.length ?? 0;
    if (rows === 0 || cols === 0) {
      return;
    }

    const glitchChars = "!#%&()*+<=>?@[]{}ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const glitchState = {
      active: false,
      bandStart: 0,
      bandEnd: 0,
      shift: 0,
      start: 0,
      duration: 0,
    };

    const glitchTimeoutRef: { current: ReturnType<typeof setTimeout> | null } =
      { current: null };

    const scheduleGlitch = () => {
      const delay = 1800 + Math.random() * 2400;
      glitchTimeoutRef.current = setTimeout(() => {
        glitchState.active = true;
        glitchState.start = performance.now();
        glitchState.duration = 140 + Math.random() * 220;
        glitchState.bandStart = Math.floor(Math.random() * rows);
        glitchState.bandEnd = Math.min(
          rows,
          glitchState.bandStart +
            2 +
            Math.floor(Math.random() * Math.max(3, Math.floor(rows * 0.2))),
        );
        const magnitude = 2 + Math.floor(Math.random() * 2);
        glitchState.shift = (Math.random() > 0.5 ? 1 : -1) * magnitude;
        scheduleGlitch();
      }, delay);
    };

    const sampleNoiseShift = (row: number, time: number) => {
      const base = Math.sin(row * 0.32 + time * 0.0012);
      const ripple = Math.cos(row * 0.14 + time * 0.0008);
      const micro = Math.sin((row + time * 0.0018) * 1.7);
      const shift = (base * 0.6 + ripple * 0.4 + micro * 0.3) * 0.8;
      return Math.max(-1, Math.min(1, Math.round(shift)));
    };

    const interval = 1000 / 24;
    let lastFrame = -Infinity;
    const frame = (timestamp: number) => {
      if (timestamp - lastFrame < interval) {
        rainFrameRef.current = requestAnimationFrame(frame);
        return;
      }
      lastFrame = timestamp;
      if (
        glitchState.active &&
        timestamp - glitchState.start >= glitchState.duration
      ) {
        glitchState.active = false;
      }

      const nextLines: string[] = new Array(rows);

      for (let row = 0; row < rows; row++) {
        const baseLine = lineChars[row];
        const rowChars = new Array<string>(cols);
        let shift = sampleNoiseShift(row, timestamp);

        if (
          glitchState.active &&
          row >= glitchState.bandStart &&
          row < glitchState.bandEnd
        ) {
          shift += glitchState.shift;
        }

        for (let col = 0; col < cols; col++) {
          const sourceCol = col - shift;
          let char =
            sourceCol >= 0 && sourceCol < cols ? baseLine[sourceCol] : " ";

          if (
            glitchState.active &&
            row >= glitchState.bandStart &&
            row < glitchState.bandEnd
          ) {
            const phase = Math.sin(
              (row * 19 + col * 7) * 0.5 + timestamp * 0.015,
            );
            if (phase > 0.65) {
              const idx =
                Math.abs(
                  Math.floor(
                    (row * 31 + col * 17 + Math.floor(timestamp)) %
                      glitchChars.length,
                  ),
                ) % glitchChars.length;
              char = glitchChars[idx];
            } else if (phase < -0.7) {
              char = " ";
            }
          } else {
            const shimmer = Math.sin(
              (row * 3.1 + col * 2.7 + timestamp * 0.003) * 0.6,
            );
            if (Math.abs(shift) > 0 && shimmer > 0.92) {
              char = " ";
            }
          }

          rowChars[col] = char;
        }

        nextLines[row] = rowChars.join("");
      }

      setDisplayPortrait(nextLines.join("\n"));
      rainFrameRef.current = requestAnimationFrame(frame);
    };

    scheduleGlitch();
    rainFrameRef.current = requestAnimationFrame(frame);

    return () => {
      if (rainFrameRef.current !== null) {
        cancelAnimationFrame(rainFrameRef.current);
        rainFrameRef.current = null;
      }
      if (glitchTimeoutRef.current) {
        clearTimeout(glitchTimeoutRef.current);
        glitchTimeoutRef.current = null;
      }
    };
  }, [isRevealComplete, lineChars, motionPaused, inView, pageVisible]);

  return (
    <div ref={portraitRef} role="img" aria-label="ASCII portrait of Joshua Tjhie" className="flex items-center justify-center overflow-visible">
      <pre aria-hidden="true"
        className="font-mono text-[2px] sm:text-[2.5px] md:text-[2.8px] lg:text-[2.5px] xl:text-[3px] whitespace-pre bg-gradient-to-br from-love via-gold to-pine bg-clip-text text-transparent transition-all duration-100 leading-[0.] tracking-widest"
        style={{ minHeight: `${lineCount}em` }}
      >
        {displayPortrait}
      </pre>
    </div>
  );
}
