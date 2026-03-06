import { motion } from "framer-motion";
import { LayoutGrid, Quote, NotebookText, Target, Calendar } from "lucide-react";
import { cn, hapticFeedback } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "habits", icon: LayoutGrid, label: "الأساسيات" },
  { id: "quotes", icon: Quote, label: "اقتباساتي" },
  { id: "journal", icon: NotebookText, label: "تدوين" },
  { id: "goals", icon: Target, label: "أهداف" },
  { id: "calendar", icon: Calendar, label: "التقويم" },
];

interface NavTabProps {
  id: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavTab({ icon: Icon, label, isActive, onClick }: NavTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-all duration-300 outline-none",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="nav-active-bg"
          className="absolute inset-x-1 h-12 top-2 rounded-2xl bg-primary/10 dark:bg-primary/20"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      
      <motion.span 
        className="relative z-10"
        animate={{ 
          scale: isActive ? 1.15 : 1,
          y: isActive ? -2 : 0
        }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Icon 
          size={24} 
          strokeWidth={isActive ? 2.5 : 2} 
          className={cn(
            "transition-all duration-300",
            isActive ? "drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]" : ""
          )}
        />
      </motion.span>
      
      <span className={cn(
        "relative z-10 text-[10px] font-bold tracking-tight transition-all duration-300",
        isActive ? "opacity-100 translate-y-0" : "opacity-80 translate-y-0.5"
      )}>
        {label}
      </span>

      {isActive && (
        <motion.div
          layoutId="nav-dot"
          className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const handleTabChange = (id: string) => {
    if (id !== activeTab) {
      hapticFeedback("light");
      onTabChange(id);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe pointer-events-none">
      <div className="mx-auto max-w-md px-6 pb-6 pointer-events-auto">
        <nav className="relative flex h-[4.5rem] items-center justify-around rounded-[2.5rem] border border-border/50 bg-background/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] px-2">
          {tabs.map((tab) => (
            <NavTab
              key={tab.id}
              id={tab.id}
              icon={tab.icon}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
