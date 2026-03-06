import { motion, AnimatePresence } from "framer-motion";
import { Portal } from "@/components/ui/Portal";
import { X } from "lucide-react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useLockBodyScroll(isOpen);

  return (
    <Portal>
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm touch-none"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[100] max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-[2rem] border-t border-border bg-card p-6 shadow-2xl text-foreground",
              className
            )}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">{title}</h2>
              <button onClick={onClose} className="rounded-full bg-secondary p-2 hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </Portal>
  );
}
