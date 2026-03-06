import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function hapticFeedback(type: "light" | "medium" | "heavy" | "success" | "error" = "light") {
  if (typeof window !== "undefined" && navigator.vibrate) {
    switch (type) {
      case "light":
        navigator.vibrate(10);
        break;
      case "medium":
        navigator.vibrate(20);
        break;
      case "heavy":
        navigator.vibrate(30);
        break;
      case "success":
        navigator.vibrate([10, 30, 10]);
        break;
      case "error":
        navigator.vibrate([20, 40, 20, 40, 20]);
        break;
    }
  }
}
