"use client";

import { cn } from "@/utils/cn";
import { useEffect, useRef } from "react";

export function HorizontalFlow({
  className,
  containerRef,
  fromRef,
  toRef,
  duration = 2,
  delay = 0,
  gradientStartColor = "#16a34a",
  gradientStopColor = "#22c55e",
  pathWidth = 4,
  pathOpacity = 0.5,
}: {
  className?: string;
  containerRef: React.RefObject<HTMLElement>;
  fromRef: React.RefObject<HTMLElement>;
  toRef: React.RefObject<HTMLElement>;
  duration?: number;
  delay?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
}) {
  const id = useRef(`flow-${Math.random()}`);
  const lineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const updatePath = () => {
      const container = containerRef.current;
      const from = fromRef.current;
      const to = toRef.current;
      const line = lineRef.current;
      if (!container || !from || !to || !line) return;

      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Calculate center points
      const fromX = fromRect.left - containerRect.left + fromRect.width / 2;
      const fromY = fromRect.top - containerRect.top + fromRect.height / 2;
      const toX = toRect.left - containerRect.left + toRect.width / 2;
      const toY = fromY; // Keep it horizontal

      const containerWidth = containerRect.width || 1000;
      const containerHeight = containerRect.height || 1000;

      // Convert to percentage
      const fromXPercent = (fromX / containerWidth) * 100;
      const fromYPercent = (fromY / containerHeight) * 100;
      const toXPercent = (toX / containerWidth) * 100;
      const toYPercent = (fromY / containerHeight) * 100;

      line.setAttribute("x1", String(fromXPercent));
      line.setAttribute("y1", String(fromYPercent));
      line.setAttribute("x2", String(toXPercent));
      line.setAttribute("y2", String(toYPercent));
    };

    updatePath();
    window.addEventListener("resize", updatePath);
    window.addEventListener("scroll", updatePath);

    return () => {
      window.removeEventListener("resize", updatePath);
      window.removeEventListener("scroll", updatePath);
    };
  }, [containerRef, fromRef, toRef]);

  return (
    <svg
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu",
        className
      )}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`gradient-${id.current}`} x1="0%" x2="100%" y1="0%" y2="0%">
          <stop stopColor={gradientStartColor} stopOpacity="0" offset="0%" />
          <stop stopColor={gradientStartColor} stopOpacity="0.8" offset="30%" />
          <stop stopColor={gradientStopColor} stopOpacity="0.8" offset="70%" />
          <stop stopColor={gradientStopColor} stopOpacity="0" offset="100%" />
        </linearGradient>
        <marker
          id={`arrow-${id.current}`}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={gradientStopColor}
            opacity={pathOpacity}
          />
        </marker>
        <style>
          {`
            @keyframes flow-${id.current} {
              0% {
                stroke-dashoffset: 100;
              }
              100% {
                stroke-dashoffset: 0;
              }
            }
            .flow-line-${id.current} {
              animation: flow-${id.current} ${duration}s linear ${delay}s infinite;
            }
          `}
        </style>
      </defs>
      <line
        ref={lineRef}
        x1="0"
        y1="50"
        x2="100"
        y2="50"
        stroke={`url(#gradient-${id.current})`}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeDasharray="10 10"
        strokeLinecap="round"
        markerEnd={`url(#arrow-${id.current})`}
        className={`flow-line-${id.current}`}
      />
    </svg>
  );
}

