import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function hapticFeedback(type: "light" | "medium" | "heavy" | "success" | "error" = "light") {
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
    switch (type) {
      case "light":
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case "medium":
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case "heavy":
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case "success":
        await Haptics.notification({ type: NotificationType.Success });
        break;
      case "error":
        await Haptics.notification({ type: NotificationType.Error });
        break;
    }
  } catch {
    // fallback للمتصفح
    if (typeof window !== "undefined" && navigator.vibrate) {
      switch (type) {
        case "light": navigator.vibrate(10); break;
        case "medium": navigator.vibrate(20); break;
        case "heavy": navigator.vibrate(30); break;
        case "success": navigator.vibrate([10, 30, 10]); break;
        case "error": navigator.vibrate([20, 40, 20, 40, 20]); break;
      }
    }
  }
}
