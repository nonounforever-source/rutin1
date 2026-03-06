import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** إذا true يُغلق المودال عند الضغط على الخلفية */
  closeOnOverlay?: boolean;
}

/**
 * Modal معزول تماماً — اللمس داخله لا يصل للخلفية أبداً
 */
export function Modal({ isOpen, onClose, children, closeOnOverlay = true }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    /**
     * ✅ يمنع الـ touchmove من الوصول للـ body عندما المودال مفتوح
     * هذا يحل مشكلة iOS حيث الخلفية تتحرك مع المودال
     */
    const preventBodyScroll = (e: TouchEvent) => {
      // السماح فقط للسكرول داخل محتوى المودال
      if (contentRef.current && contentRef.current.contains(e.target as Node)) {
        return; // اتركه يسكرول داخل المودال
      }
      e.preventDefault(); // امنع أي شيء خارج المودال
    };

    document.addEventListener("touchmove", preventBodyScroll, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventBodyScroll);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ─── الخلفية المعتمة — تمتص اللمس ولا تمرره ─── */}
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.preventDefault()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={closeOnOverlay ? onClose : undefined}
          />

          {/* ─── محتوى المودال — مستقل بالكامل ─── */}
          <motion.div
            ref={contentRef}
            className="modal-content"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
