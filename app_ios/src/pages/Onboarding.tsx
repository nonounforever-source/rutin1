import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/lib/store";

const steps = [
  {
    emoji: "🌟",
    title: "مرحباً بك في روتيني",
    subtitle: "تطبيقك الشخصي لبناء عادات ناجحة وتحقيق أهدافك",
  },
  {
    emoji: "✦",
    title: "تتبّع عاداتك",
    subtitle: "سجّل عاداتك اليومية وتابع تقدمك بسهولة",
  },
  {
    emoji: "◎",
    title: "حقّق أهدافك",
    subtitle: "ضع أهدافاً واضحة وراقب تقدمك خطوة بخطوة",
  },
  {
    emoji: "✎",
    title: "دوّن أفكارك",
    subtitle: "اكتب في مذكرتك اليومية وعبّر عن مشاعرك",
    showName: true,
  },
];

export function OnboardingPage() {
  const { dispatch } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      dispatch({ type: "COMPLETE_ONBOARDING", payload: { userName: name.trim() || "صديقي" } });
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-between p-8" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))", paddingTop: "calc(3rem + env(safe-area-inset-top))" }}>
      {/* Progress dots */}
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <motion.div
            key={i}
            animate={{ width: i === currentStep ? 24 : 8, opacity: i <= currentStep ? 1 : 0.3 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="h-2 rounded-full bg-primary"
          />
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="flex flex-col items-center gap-6 text-center flex-1 justify-center"
      >
        <div className="text-8xl">{step.emoji}</div>
        <div className="space-y-3">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{step.title}</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">{step.subtitle}</p>
        </div>

        {step.showName && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-xs"
          >
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ما اسمك؟ (اختياري)"
              className="ios-input text-center"
            />
          </motion.div>
        )}
      </motion.div>

      {/* Button */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={handleNext}
        className="ios-button-primary w-full max-w-xs text-lg"
      >
        {isLast ? "ابدأ رحلتك 🚀" : "التالي"}
      </motion.button>
    </div>
  );
}
