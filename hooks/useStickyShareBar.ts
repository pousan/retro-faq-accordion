"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface StickyShareBarState {
  hiddenByScroll: boolean;
  hiddenByKeyboard: boolean;
  hiddenAboveViewport: boolean;
  footerOverlap: number;
  barHeight: number;
  hasFocusWithin: boolean;
}

const DIRECTION_THRESHOLD_PX = 12;
const TOP_REVEAL_THRESHOLD_PX = 24;
const KEYBOARD_HEIGHT_THRESHOLD_PX = 140;

export function useStickyShareBar(footerId: string) {
  const barRef = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<StickyShareBarState>({
    hiddenByScroll: false,
    hiddenByKeyboard: false,
    hiddenAboveViewport: false,
    footerOverlap: 0,
    barHeight: 72,
    hasFocusWithin: false,
  });

  const lastScrollYRef = useRef<number>(0);
  const directionRef = useRef<"up" | "down" | null>(null);
  const accumulatedDeltaRef = useRef<number>(0);
  const footerNearRef = useRef<boolean>(false);
  const hasFocusWithinRef = useRef<boolean>(false);
  const barHeightRef = useRef<number>(72);
  const rafIdRef = useRef<number | null>(null);
  const scheduleSyncRef = useRef<(() => void) | null>(null);

  const updateStateIfChanged = useCallback(
    (partial: Partial<StickyShareBarState>) => {
      setState((prev) => {
        const next: StickyShareBarState = { ...prev, ...partial };
        if (
          next.hiddenByScroll === prev.hiddenByScroll &&
          next.hiddenByKeyboard === prev.hiddenByKeyboard &&
          next.hiddenAboveViewport === prev.hiddenAboveViewport &&
          next.footerOverlap === prev.footerOverlap &&
          next.barHeight === prev.barHeight &&
          next.hasFocusWithin === prev.hasFocusWithin
        ) {
          return prev;
        }
        return next;
      });
    },
    []
  );

  const handleFocusIn = useCallback(() => {
    hasFocusWithinRef.current = true;
    updateStateIfChanged({
      hasFocusWithin: true,
      hiddenByScroll: false,
      hiddenByKeyboard: false,
      hiddenAboveViewport: false,
    });
    scheduleSyncRef.current?.();
  }, [updateStateIfChanged]);

  const handleFocusOut = useCallback(
    (event: React.FocusEvent<HTMLElement>) => {
      const currentTarget = event.currentTarget;
      const relatedTarget = event.relatedTarget as Node | null;
      if (relatedTarget && currentTarget.contains(relatedTarget)) {
        return;
      }
      hasFocusWithinRef.current = false;
      updateStateIfChanged({
        hasFocusWithin: false,
      });
      scheduleSyncRef.current?.();
    },
    [updateStateIfChanged]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    lastScrollYRef.current = Math.max(0, window.scrollY);

    const measureAndSync = () => {
      rafIdRef.current = null;

      const currentScrollY = Math.max(0, window.scrollY);
      const delta = currentScrollY - lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      let nextHiddenByScroll: boolean | undefined = undefined;

      if (currentScrollY <= TOP_REVEAL_THRESHOLD_PX) {
        directionRef.current = "up";
        accumulatedDeltaRef.current = 0;
        nextHiddenByScroll = false;
      } else if (delta !== 0) {
        const currentDirection: "up" | "down" = delta > 0 ? "down" : "up";
        if (directionRef.current !== currentDirection) {
          directionRef.current = currentDirection;
          accumulatedDeltaRef.current = Math.abs(delta);
        } else {
          accumulatedDeltaRef.current += Math.abs(delta);
        }

        if (accumulatedDeltaRef.current >= DIRECTION_THRESHOLD_PX) {
          if (currentDirection === "down" && !hasFocusWithinRef.current) {
            nextHiddenByScroll = true;
          } else if (currentDirection === "up") {
            nextHiddenByScroll = false;
          }
        }
      }

      if (hasFocusWithinRef.current) {
        nextHiddenByScroll = false;
      }

      const vv = window.visualViewport;
      const layoutViewportHeight = window.innerHeight;
      const viewportTop = vv ? vv.offsetTop : 0;
      const viewportHeight = vv ? vv.height : layoutViewportHeight;
      const viewportBottom = viewportTop + viewportHeight;
      const visualBottomOffset = Math.max(
        0,
        Math.round(layoutViewportHeight - viewportBottom)
      );
      const barH = barRef.current?.offsetHeight ?? barHeightRef.current;

      let nextFooterOverlap = hasFocusWithinRef.current
        ? visualBottomOffset
        : 0;
      let nextHiddenAboveViewport = false;
      const footerEl = document.getElementById(footerId);

      if (footerNearRef.current && footerEl) {
        const footerRect = footerEl.getBoundingClientRect();
        if (footerRect.top < viewportBottom) {
          const overlapFromVisualBottom = Math.max(
            0,
            Math.round(viewportBottom - footerRect.top)
          );
          nextFooterOverlap = visualBottomOffset + overlapFromVisualBottom;
          if (
            footerRect.top <= viewportTop + barH &&
            !hasFocusWithinRef.current
          ) {
            nextHiddenAboveViewport = true;
          }
        }
      }

      if (hasFocusWithinRef.current) {
        const maxFocusBottom = Math.max(
          visualBottomOffset,
          Math.floor(layoutViewportHeight - viewportTop - barH)
        );
        nextFooterOverlap = Math.min(
          Math.max(nextFooterOverlap, visualBottomOffset),
          maxFocusBottom
        );
        nextHiddenAboveViewport = false;
      }

      let nextHiddenByKeyboard = false;
      if (vv && !hasFocusWithinRef.current) {
        const keyboardDiff = layoutViewportHeight - vv.height;
        if (keyboardDiff > KEYBOARD_HEIGHT_THRESHOLD_PX) {
          nextHiddenByKeyboard = true;
        }
      }

      const partialUpdate: Partial<StickyShareBarState> = {
        footerOverlap: nextFooterOverlap,
        hiddenAboveViewport: nextHiddenAboveViewport,
        hiddenByKeyboard: nextHiddenByKeyboard,
      };
      if (nextHiddenByScroll !== undefined) {
        partialUpdate.hiddenByScroll = nextHiddenByScroll;
      }

      updateStateIfChanged(partialUpdate);
    };

    const scheduleSync = () => {
      if (rafIdRef.current !== null) {
        return;
      }
      rafIdRef.current = window.requestAnimationFrame(measureAndSync);
    };
    scheduleSyncRef.current = scheduleSync;

    const footerEl = document.getElementById(footerId);
    const sentinelEl =
      document.getElementById(`${footerId}-sentinel`) ?? footerEl;

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && sentinelEl) {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const vvNow = window.visualViewport;
          const vBottom = vvNow
            ? vvNow.offsetTop + vvNow.height
            : window.innerHeight;
          for (const entry of entries) {
            footerNearRef.current =
              entry.isIntersecting || entry.boundingClientRect.top < vBottom;
          }
          scheduleSync();
        },
        {
          root: null,
          rootMargin: "0px 0px 160px 0px",
          threshold: [0, 0.01, 0.5, 1],
        }
      );
      intersectionObserver.observe(sentinelEl);
    } else if (sentinelEl) {
      footerNearRef.current = true;
    }

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && barRef.current) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const target = entry.target as HTMLElement;
          const measured = Math.ceil(target.offsetHeight);
          if (measured > 0) {
            barHeightRef.current = measured;
            updateStateIfChanged({ barHeight: measured });
          }
        }
        scheduleSync();
      });
      resizeObserver.observe(barRef.current);
    }

    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync, { passive: true });

    const vv = window.visualViewport;
    if (vv) {
      vv.addEventListener("resize", scheduleSync, { passive: true });
      vv.addEventListener("scroll", scheduleSync, { passive: true });
    }

    scheduleSync();

    return () => {
      scheduleSyncRef.current = null;
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      if (vv) {
        vv.removeEventListener("resize", scheduleSync);
        vv.removeEventListener("scroll", scheduleSync);
      }
      if (intersectionObserver) {
        intersectionObserver.disconnect();
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [footerId, updateStateIfChanged]);

  const isRetreated =
    !state.hasFocusWithin &&
    (state.hiddenByScroll ||
      state.hiddenByKeyboard ||
      state.hiddenAboveViewport);

  return {
    barRef,
    isRetreated,
    hasFocusWithin: state.hasFocusWithin,
    footerOverlap: state.footerOverlap,
    barHeight: state.barHeight,
    handleFocusIn,
    handleFocusOut,
  };
}
