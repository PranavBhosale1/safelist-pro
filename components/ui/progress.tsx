import * as React from "react";
import { cn } from "@/utils/cn"; // Adjust if your utility path is different

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-muted",
          className
        )}
        {...props}
      >
        <div
          className="h-full bg-[#7b3fe4] transition-all duration-300"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };
