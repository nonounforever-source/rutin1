import { motion, AnimatePresence } from "framer-motion";
import { Portal } from "@/components/ui/Portal";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {

  // منع سكرول الخلفية عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* خلفية المودال - لا تستجيب للسكرول */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                backgroundColor: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                touchAction: "none", // منع السكرول خلف المودال
              }}
            />

            {/* محتوى المودال - قابل للسكرول بمعزل عن الخلفية */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} // منع إغلاق المودال عند الضغط بداخله
              className={cn(
                "rounded-t-[2rem] border-t border-border bg-card shadow-2xl text-foreground",
                className
              )}
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 101,
                maxHeight: "90vh",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch" as any,
                overscrollBehaviorY: "contain",
                touchAction: "pan-y", // السكرول العمودي فقط
                // ضمان أن العناصر بداخله قابلة للتفاعل
                userSelect: "auto",
                WebkitUserSelect: "auto" as any,
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
            >
              {/* مقبض السحب */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
              </div>

              <div className="p-6 pt-2">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold">{title}</h2>
                  <button
                    onClick={onClose}
                    className="rounded-full bg-secondary p-2 hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                    style={{ minWidth: 44, minHeight: 44, touchAction: "manipulation" }}
                  >
                    <X size={20} />
                  </button>
                </div>
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </Portal>
  );
}
