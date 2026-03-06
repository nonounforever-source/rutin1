import { useLayoutEffect } from 'react';

export function useLockBodyScroll(isLocked: boolean = true) {
  useLayoutEffect(() => {
    if (!isLocked) return;

    // 1. Save current scroll position
    const scrollY = window.scrollY;
    
    // 2. Save original styles
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    // 3. Lock body by fixing it in place
    // This prevents iOS Safari from scrolling the background content
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      // 4. Restore original styles
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      
      // 5. Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
}
