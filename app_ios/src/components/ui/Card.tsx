import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-lg shadow-sm",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card };
