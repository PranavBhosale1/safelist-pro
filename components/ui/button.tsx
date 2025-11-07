import * as React from "react";
import { cn } from "@/utils/cn"; // Adjust if your utility path is different

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const sizeMap: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

const variantMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-300",
  secondary:
    "bg-white text-green-700 border border-gray-200 hover:bg-gray-50 focus:ring-2 focus:ring-green-200",
  ghost:
    "bg-transparent text-green-600 hover:bg-green-50 focus:ring-2 focus:ring-green-100",
  outline:
    "border-2 border-green-600 bg-white text-green-600 hover:bg-green-50 focus:ring-2 focus:ring-green-200",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, children, variant = "primary", size = "md", type = "button", ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-transform disabled:opacity-50 disabled:pointer-events-none focus:outline-none",
          sizeMap[size],
          variantMap[variant],
          // subtle focus-visible support for keyboard users
          "focus-visible:ring-offset-2 focus-visible:ring",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
