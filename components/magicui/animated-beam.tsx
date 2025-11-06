"use client";

import { cn } from "@/utils/cn";
import { useEffect, useRef } from "react";

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 5,
  delay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}: {
  className?: string;
  containerRef: React.RefObject<HTMLElement>;
  fromRef: React.RefObject<HTMLElement>;
  toRef: React.RefObject<HTMLElement>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
}) {
  const id = useRef(`beam-${Math.random()}`);

  useEffect(() => {
    const updatePath = () => {
      const container = containerRef.current;
      const from = fromRef.current;
      const to = toRef.current;
      if (!container || !from || !to) return;

      const fromRect = from.getBoundingClientRect();
      const toRect = to.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const fromX = fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset;
      const fromY = fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset;
      const toX = toRect.left - containerRect.left + toRect.width / 2 + endXOffset;
      const toY = toRect.top - containerRect.top + toRect.height / 2 + endYOffset;

      const path = document.getElementById(id.current);
      if (!path) return;

      const containerWidth = containerRect.width || 1000;
      const containerHeight = containerRect.height || 1000;

      // Convert to percentage-based coordinates for viewBox
      const fromXPercent = (fromX / containerWidth) * 100;
      const fromYPercent = (fromY / containerHeight) * 100;
      const toXPercent = (toX / containerWidth) * 100;
      const toYPercent = (toY / containerHeight) * 100;
      const controlX = (fromXPercent + toXPercent) / 2;
      const controlY = (fromYPercent + toYPercent) / 2 + (curvature / containerHeight) * 100;

      const pathD = `M ${fromXPercent},${fromYPercent} Q ${controlX},${controlY} ${toXPercent},${toYPercent}`;
      path.setAttribute("d", pathD);
    };

    updatePath();
    window.addEventListener("resize", updatePath);
    window.addEventListener("scroll", updatePath);

    return () => {
      window.removeEventListener("resize", updatePath);
      window.removeEventListener("scroll", updatePath);
    };
  }, [containerRef, fromRef, toRef, curvature, startXOffset, startYOffset, endXOffset, endYOffset]);

  return (
    <svg
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu stroke-2",
        className
      )}
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={`gradient-${id.current}`} gradientUnits="userSpaceOnUse" x1="0%" x2="100%" y1="0%" y2="0%">
          <stop stopColor={gradientStartColor} stopOpacity="0" offset="0%" />
          <stop stopColor={gradientStartColor} stopOpacity="1" offset="40%" />
          <stop stopColor={gradientStopColor} stopOpacity="1" offset="60%" />
          <stop stopColor={gradientStopColor} stopOpacity="0" offset="100%" />
        </linearGradient>
        <style>
          {`
            @keyframes move-beam {
              from {
                stroke-dashoffset: 0;
              }
              to {
                stroke-dashoffset: -100;
              }
            }
          `}
        </style>
      </defs>
      <path
        id={id.current}
        d={`M 0,0 Q 50,50 100,100`}
        fill="none"
        stroke={`url(#gradient-${id.current})`}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeDasharray="20 20"
        strokeDashoffset="0"
        style={{
          animation: `move-beam ${duration}s linear ${delay}s infinite ${reverse ? "reverse" : "normal"}`,
        }}
      />
    </svg>
  );
}

