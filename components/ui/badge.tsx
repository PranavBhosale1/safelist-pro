import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "outline" | "solid";
  className?: string;
}

export function Badge({ children, variant = "outline", className = "" }: BadgeProps) {
  const base = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
  const styles =
    variant === "outline"
      ? "border-2 border-green-400 text-green-700 bg-green-50"
      : "bg-green-600 text-white";

  return <span className={`${base} ${styles} ${className}`}>{children}</span>;
}
