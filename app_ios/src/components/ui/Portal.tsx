import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
}

export function Portal({ children }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // إنشاء container خاص للـ portals
    const div = document.createElement("div");
    div.id = "portal-root";
    div.style.position = "fixed";
    div.style.zIndex = "100";
    div.style.top = "0";
    div.style.left = "0";
    div.style.right = "0";
    div.style.bottom = "0";
    div.style.pointerEvents = "none"; // لا يمنع الضغط على العناصر خلفه افتراضياً
    document.body.appendChild(div);
    portalRef.current = div;
    setMounted(true);

    return () => {
      document.body.removeChild(div);
    };
  }, []);

  if (!mounted || !portalRef.current) return null;

  return createPortal(
    <div style={{ pointerEvents: "auto" }}>{children}</div>,
    portalRef.current
  );
}
