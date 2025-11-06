import * as React from "react";
import { cn } from "@/utils/cn"; // Adjust if your utility path is different

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variant === "outline"
            ? "border-2 border-green-600 bg-white hover:bg-green-50 text-green-600 hover:text-green-700"
            : "bg-green-600 text-white hover:bg-green-700",
          className
        )}
        {...props} // <- enables all native props like `disabled`, `type`, `onClick`, etc.
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
