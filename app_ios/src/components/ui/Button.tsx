import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", style, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": variant === "primary",
            "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            "hover:bg-secondary text-foreground": variant === "ghost",
            "bg-destructive/10 text-destructive hover:bg-destructive/20": variant === "danger",
            "h-9 px-4 text-sm": size === "sm",
            "h-11 px-6 text-base": size === "md",
            "h-14 px-8 text-lg": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        style={{
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
          minHeight: size === "icon" ? 44 : undefined, // الحد الأدنى لحجم اللمس على iOS
          minWidth: size === "icon" ? 44 : undefined,
          cursor: "pointer",
          ...style,
        }}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
