import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, style, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex w-full rounded-xl border border-border bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground",
          className
        )}
        style={{
          height: 48,
          fontSize: 16, // منع iOS من تصغير الخط عند الفوكس
          touchAction: "auto",
          WebkitUserSelect: "text",
          userSelect: "text",
          ...style,
        }}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
