import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
  icon: string;
}

const tabs: Tab[] = [
  { id: "habits",   label: "عاداتي",   icon: "✦" },
  { id: "goals",    label: "أهدافي",   icon: "◎" },
  { id: "journal",  label: "مذكرتي",   icon: "✎" },
  { id: "calendar", label: "تقويم",    icon: "▦" },
  { id: "quotes",   label: "إلهام",    icon: "❝" },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav
      className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50"
      style={{
        paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
        paddingTop: "0.75rem",
        zIndex: 50,
      }}
    >
      <div className="flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all duration-200 active:scale-90 min-w-[52px]"
            >
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className={`text-xl leading-none transition-all duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.icon}
              </motion.div>
              <span
                className={`text-[10px] font-bold leading-none transition-all duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-dot"
                  className="w-1 h-1 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
