import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppProvider, useApp } from "@/lib/store";
import { BottomNav } from "@/components/BottomNav";
import { HabitsPage } from "@/pages/Habits";
import { QuotesPage } from "@/pages/Quotes";
import { JournalPage } from "@/pages/Journal";
import { GoalsPage } from "@/pages/Goals";
import { CalendarPage } from "@/pages/Calendar";
import { OnboardingPage } from "@/pages/Onboarding";

function AppContent() {
  const [activeTab, setActiveTab] = useState("habits");
  const { settings } = useApp();

  if (settings.isFirstTime) {
    return <OnboardingPage />;
  }

  return (
    <div
      className="bg-zinc-200 dark:bg-zinc-900 flex justify-center"
      style={{
        height: "100%",
        width: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div
        className="w-full max-w-md bg-background relative shadow-2xl"
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* منطقة المحتوى القابلة للسكرول */}
        <main
          className="no-scrollbar flex-1"
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch" as any,
            paddingBottom: "calc(8rem + env(safe-area-inset-bottom))",
            height: "100%",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: 0.25,
                ease: [0.32, 0.72, 0, 1],
              }}
              style={{ minHeight: "100%" }}
            >
              {activeTab === "habits" && <HabitsPage />}
              {activeTab === "quotes" && <QuotesPage />}
              {activeTab === "journal" && <JournalPage />}
              {activeTab === "goals" && <GoalsPage />}
              {activeTab === "calendar" && <CalendarPage />}
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
