import * as React from "react";
import { cn } from "../../lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
}

export function Progress({ value, max, className, ...props }: ProgressProps) {
  const percentage = (value / max) * 100;

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-[#F5F5F5]",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-[#92C55E] transition-all"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </div>
  );
}