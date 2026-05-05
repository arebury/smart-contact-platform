import { useState, useEffect, useCallback } from "react";

/**
 * DD#135 — Keyboard navigation for dropdown menus.
 *
 * Provides:
 *  - Arrow Down/Up cycling through items
 *  - Enter to select the highlighted item
 *  - Escape to close
 *  - Home/End to jump to first/last
 *  - Auto-scroll into view
 *  - Reset on open
 */
export function useKeyboardNav({
  itemCount,
  isOpen,
  onSelect,
  onClose,
  containerRef,
}: {
  itemCount: number;
  isOpen: boolean;
  onSelect: (index: number) => void;
  onClose: () => void;
  /** Optional ref to the scrollable list container for auto-scroll */
  containerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [activeIndex, setActiveIndex] = useState(-1);

  // Reset when dropdown opens/closes
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(-1);
    }
  }, [isOpen]);

  // Auto-scroll the active item into view
  useEffect(() => {
    if (!isOpen || activeIndex < 0 || !containerRef?.current) return;
    const container = containerRef.current;
    const items = container.querySelectorAll("[data-kb-item]");
    const target = items[activeIndex] as HTMLElement | undefined;
    if (target) {
      target.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, isOpen, containerRef]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || itemCount === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          e.stopPropagation();
          setActiveIndex((i) => (i < itemCount - 1 ? i + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          e.stopPropagation();
          setActiveIndex((i) => (i > 0 ? i - 1 : itemCount - 1));
          break;
        case "Enter":
          e.preventDefault();
          e.stopPropagation();
          if (activeIndex >= 0) onSelect(activeIndex);
          break;
        case "Escape":
          e.preventDefault();
          e.stopPropagation();
          onClose();
          break;
        case "Home":
          e.preventDefault();
          setActiveIndex(0);
          break;
        case "End":
          e.preventDefault();
          setActiveIndex(itemCount - 1);
          break;
      }
    },
    [isOpen, itemCount, activeIndex, onSelect, onClose]
  );

  return { activeIndex, setActiveIndex, onKeyDown };
}
