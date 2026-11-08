"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  buildNextRelativeUrl,
  parseFaqQuery,
} from "@/lib/faq-query";
import { buildCleanShareUrl } from "@/lib/share";
import type {
  FaqHighlight,
  FaqItem,
  FaqTheme,
} from "@/lib/faq-types";

export interface UseFaqQuerySyncResult {
  theme: FaqTheme;
  selectedId: string | null;
  validExplicitQuestion: boolean;
  questionIndex: number | null;
  highlight: FaqHighlight | undefined;
  shareUrl: string | null;
  handleThemeChange: (nextTheme: FaqTheme) => void;
  handleOpenChange: (nextSelectedId: string | null) => void;
}

export function useFaqQuerySync(
  items: readonly FaqItem[],
  instanceId: string
): UseFaqQuerySyncResult {
  const searchParams = useSearchParams();
  const pathname = usePathname() || "/faq-preview";

  const parsed = useMemo(
    () => parseFaqQuery(searchParams, items),
    [searchParams, items]
  );

  const { theme, selectedId, validExplicitQuestion, questionIndex } = parsed;

  const [origin, setOrigin] = useState<string | null>(null);
  const [highlight, setHighlight] = useState<FaqHighlight | undefined>(
    undefined
  );

  const tokenRef = useRef<number>(0);
  const initialNavStatusRef = useRef<"idle" | "scheduled" | "completed">(
    "idle"
  );
  const initialHighlightDispatchedRef = useRef<boolean>(false);
  const userInteractedBeforeNavRef = useRef<boolean>(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    setHighlight((prev) => {
      if (!prev) {
        return undefined;
      }
      if (selectedId === null || prev.id !== selectedId) {
        return undefined;
      }
      return prev;
    });
  }, [selectedId]);

  useEffect(() => {
    if (initialNavStatusRef.current === "completed") {
      return;
    }

    if (!validExplicitQuestion || !selectedId) {
      initialNavStatusRef.current = "completed";
      return;
    }

    const targetId = selectedId;
    initialNavStatusRef.current = "scheduled";

    if (!initialHighlightDispatchedRef.current) {
      initialHighlightDispatchedRef.current = true;
      tokenRef.current += 1;
      setHighlight({
        id: targetId,
        mode: "flash",
        token: tokenRef.current,
      });
    }

    const markUserInteracted = () => {
      userInteractedBeforeNavRef.current = true;
      initialNavStatusRef.current = "completed";
    };

    window.addEventListener("keydown", markUserInteracted, {
      passive: true,
      once: true,
    });
    window.addEventListener("pointerdown", markUserInteracted, {
      passive: true,
      once: true,
    });
    window.addEventListener("wheel", markUserInteracted, {
      passive: true,
      once: true,
    });
    window.addEventListener("touchmove", markUserInteracted, {
      passive: true,
      once: true,
    });
    window.addEventListener("scroll", markUserInteracted, {
      passive: true,
      once: true,
    });

    let rafId1: number | null = null;
    let rafId2: number | null = null;
    let correctionTimeoutId: number | null = null;

    rafId1 = window.requestAnimationFrame(() => {
      rafId1 = null;
      rafId2 = window.requestAnimationFrame(() => {
        rafId2 = null;

        if (userInteractedBeforeNavRef.current) {
          initialNavStatusRef.current = "completed";
          return;
        }

        const detailsEl = document.getElementById(
          `${instanceId}-${targetId}`
        ) as HTMLDetailsElement | null;
        const summaryEl = document.getElementById(
          `${instanceId}-${targetId}-summary`
        ) as HTMLElement | null;

        if (!summaryEl) {
          return;
        }

        initialNavStatusRef.current = "completed";
        window.removeEventListener("scroll", markUserInteracted);

        if (detailsEl && !detailsEl.open) {
          detailsEl.open = true;
        }

        const prefersReducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches;
        const scrollBehavior: ScrollBehavior = prefersReducedMotion
          ? "auto"
          : "smooth";

        summaryEl.focus({ preventScroll: true });
        summaryEl.scrollIntoView({
          behavior: scrollBehavior,
          block: "start",
        });

        if (!prefersReducedMotion) {
          correctionTimeoutId = window.setTimeout(() => {
            correctionTimeoutId = null;
            if (userInteractedBeforeNavRef.current) {
              return;
            }
            const rect = summaryEl.getBoundingClientRect();
            if (rect.top < 0 || rect.top > window.innerHeight * 0.45) {
              summaryEl.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }, 280);
        }
      });
    });

    return () => {
      window.removeEventListener("keydown", markUserInteracted);
      window.removeEventListener("pointerdown", markUserInteracted);
      window.removeEventListener("wheel", markUserInteracted);
      window.removeEventListener("touchmove", markUserInteracted);
      window.removeEventListener("scroll", markUserInteracted);
      if (rafId1 !== null) {
        window.cancelAnimationFrame(rafId1);
      }
      if (rafId2 !== null) {
        window.cancelAnimationFrame(rafId2);
      }
      if (correctionTimeoutId !== null) {
        window.clearTimeout(correctionTimeoutId);
      }
      if (initialNavStatusRef.current === "scheduled") {
        initialNavStatusRef.current = "idle";
      }
    };
  }, [instanceId, selectedId, validExplicitQuestion]);

  const replaceUrlIfChanged = useCallback(
    (nextTheme: FaqTheme, nextSelectedId: string | null) => {
      if (typeof window === "undefined") {
        return;
      }
      const currentRelative = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      const nextRelative = buildNextRelativeUrl(
        window.location.href,
        {
          theme: nextTheme,
          selectedId: nextSelectedId,
        },
        items
      );

      if (nextRelative !== currentRelative) {
        window.history.replaceState(null, "", nextRelative);
      }
    },
    [items]
  );

  const handleThemeChange = useCallback(
    (nextTheme: FaqTheme) => {
      userInteractedBeforeNavRef.current = true;
      initialNavStatusRef.current = "completed";

      const currentSearch =
        typeof window !== "undefined" ? window.location.search : "";
      const currentParsed = parseFaqQuery(
        new URLSearchParams(currentSearch),
        items
      );

      replaceUrlIfChanged(nextTheme, currentParsed.selectedId);
    },
    [items, replaceUrlIfChanged]
  );

  const handleOpenChange = useCallback(
    (nextSelectedId: string | null) => {
      const currentSearch =
        typeof window !== "undefined" ? window.location.search : "";
      const currentParsed = parseFaqQuery(
        new URLSearchParams(currentSearch),
        items
      );

      if (
        nextSelectedId === currentParsed.selectedId &&
        nextSelectedId === selectedId
      ) {
        return;
      }

      userInteractedBeforeNavRef.current = true;
      initialNavStatusRef.current = "completed";

      if (
        nextSelectedId !== null &&
        nextSelectedId !== currentParsed.selectedId
      ) {
        tokenRef.current += 1;
        setHighlight({
          id: nextSelectedId,
          mode: "subtle",
          token: tokenRef.current,
        });
      } else if (nextSelectedId === null) {
        setHighlight(undefined);
      }

      replaceUrlIfChanged(currentParsed.theme, nextSelectedId);
    },
    [items, replaceUrlIfChanged, selectedId]
  );

  const shareUrl = useMemo(() => {
    if (!origin) {
      return null;
    }
    return buildCleanShareUrl({
      origin,
      pathname,
      theme,
      selectedId,
      items,
    });
  }, [origin, pathname, theme, selectedId, items]);

  return {
    theme,
    selectedId,
    validExplicitQuestion,
    questionIndex,
    highlight,
    shareUrl,
    handleThemeChange,
    handleOpenChange,
  };
}
