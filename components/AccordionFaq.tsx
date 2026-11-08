"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FAQ_CATEGORY_LABELS } from "@/data/faqs";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import type {
  AccordionFaqProps,
  FaqHighlightMode,
  FaqTheme,
} from "@/lib/faq-types";

const HIGHLIGHT_CLASS_MAP: Readonly<
  Record<FaqTheme, Readonly<Record<FaqHighlightMode, string>>>
> = {
  retro: {
    flash: "animate-flash-retro",
    subtle: "animate-subtle-retro",
  },
  citypop: {
    flash: "animate-flash-citypop",
    subtle: "animate-subtle-citypop",
  },
};

export function AccordionFaq({
  items,
  title = "よくあるご質問",
  instanceId,
  selectedId,
  onOpenChange,
  highlight,
  includeJsonLd = true,
  theme,
}: AccordionFaqProps) {
  const detailsMapRef = useRef<Map<string, HTMLDetailsElement>>(new Map());
  const onOpenChangeRef = useRef<typeof onOpenChange>(onOpenChange);
  const selectedIdRef = useRef<string | null>(selectedId);
  const syncingTargetRef = useRef<string | null | undefined>(undefined);
  const toggleRafRef = useRef<number | null>(null);

  const [trackedTheme, setTrackedTheme] = useState<FaqTheme>(theme);
  const [completedAnimToken, setCompletedAnimToken] = useState<number | null>(
    null
  );
  const [dismissedStaticToken, setDismissedStaticToken] = useState<
    number | null
  >(null);
  const [prefersReducedMotion, setPrefersReducedMotion] =
    useState<boolean>(false);

  if (trackedTheme !== theme) {
    setTrackedTheme(theme);
    if (highlight && completedAnimToken !== highlight.token) {
      setCompletedAnimToken(highlight.token);
    }
  }

  if (highlight && selectedId !== highlight.id) {
    if (completedAnimToken !== highlight.token) {
      setCompletedAnimToken(highlight.token);
    }
    if (dismissedStaticToken !== highlight.token) {
      setDismissedStaticToken(highlight.token);
    }
  }

  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      const matches = mediaQuery.matches;
      setPrefersReducedMotion(matches);
      if (matches && highlight) {
        setCompletedAnimToken(highlight.token);
      }
    };

    syncMotionPreference();
    mediaQuery.addEventListener("change", syncMotionPreference);
    return () => {
      mediaQuery.removeEventListener("change", syncMotionPreference);
    };
  }, [highlight]);

  useEffect(() => {
    if (
      !highlight ||
      prefersReducedMotion ||
      completedAnimToken === highlight.token
    ) {
      return;
    }

    const durationMs = highlight.mode === "flash" ? 1700 : 600;
    const timerId = window.setTimeout(() => {
      setCompletedAnimToken(highlight.token);
    }, durationMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [completedAnimToken, highlight, prefersReducedMotion]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
    let didMutateDom = false;

    detailsMapRef.current.forEach((el, itemId) => {
      if (itemId !== selectedId && el.open) {
        el.open = false;
        didMutateDom = true;
      }
    });

    if (selectedId !== null) {
      const targetEl = detailsMapRef.current.get(selectedId);
      if (targetEl && !targetEl.open) {
        targetEl.open = true;
        didMutateDom = true;
      }
    }

    if (didMutateDom) {
      syncingTargetRef.current = selectedId;
    }
  }, [selectedId, items]);

  useEffect(() => {
    return () => {
      if (toggleRafRef.current !== null) {
        window.cancelAnimationFrame(toggleRafRef.current);
      }
    };
  }, []);

  const setDetailsRef = useCallback(
    (itemId: string) => (node: HTMLDetailsElement | null) => {
      if (node) {
        detailsMapRef.current.set(itemId, node);
      } else {
        detailsMapRef.current.delete(itemId);
      }
    },
    []
  );

  const handleDetailsToggle = useCallback(
    (toggledId: string, event: React.SyntheticEvent<HTMLDetailsElement>) => {
      const toggledElement = event.currentTarget;

      if (toggledElement.open) {
        detailsMapRef.current.forEach((el, id) => {
          if (id !== toggledId && el.open) {
            el.open = false;
          }
        });
      }

      if (toggleRafRef.current !== null) {
        window.cancelAnimationFrame(toggleRafRef.current);
      }

      toggleRafRef.current = window.requestAnimationFrame(() => {
        toggleRafRef.current = null;

        let activeOpenId: string | null = null;
        for (const item of items) {
          const el = detailsMapRef.current.get(item.id);
          if (el?.open) {
            activeOpenId = item.id;
            break;
          }
        }

        if (syncingTargetRef.current !== undefined) {
          const syncTarget = syncingTargetRef.current;
          syncingTargetRef.current = undefined;
          if (activeOpenId === syncTarget) {
            return;
          }
        }

        if (activeOpenId === selectedIdRef.current) {
          return;
        }

        selectedIdRef.current = activeOpenId;
        onOpenChangeRef.current?.(activeOpenId);
      });
    },
    [items]
  );

  const headingId = `${instanceId}-heading`;
  const groupName = instanceId;
  const isRetro = theme === "retro";

  return (
    <section
      aria-labelledby={headingId}
      data-theme={theme}
      className="faq-section w-full"
    >
      <div
        className={
          isRetro
            ? "mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#3a2212] pb-4"
            : "mb-6 flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#141026] pb-4"
        }
      >
        <div className="flex items-center gap-3">
          {isRetro ? (
            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border-2 border-[#a82417] bg-[#a82417] text-sm font-bold tracking-widest text-[#fffdf8] shadow-[2px_2px_0px_#3a2212]"
            >
              問答
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-[#141026] bg-[#ff79b4] text-sm font-black text-[#141026] shadow-[3px_3px_0px_#141026]"
            >
              FAQ
            </span>
          )}
          <h2
            id={headingId}
            className={
              isRetro
                ? "text-xl font-bold tracking-wide text-[#28180d] sm:text-2xl"
                : "text-xl font-black tracking-tight text-[#141026] sm:text-2xl"
            }
          >
            {title}
          </h2>
        </div>

        <span
          className={
            isRetro
              ? "inline-flex items-center rounded-xs border border-[#3a2212] bg-[#efe3ca] px-3 py-1 text-xs font-semibold text-[#28180d]"
              : "inline-flex items-center rounded-full border-2 border-[#141026] bg-[#6bf0d2] px-3.5 py-1 text-xs font-bold text-[#141026] shadow-[2px_2px_0px_#141026]"
          }
        >
          全{items.length}問・排他開閉
        </span>
      </div>

      <div className="faq-list flex flex-col gap-4">
        {items.map((item, index) => {
          const qNumber = index + 1;
          const detailsDomId = `${instanceId}-${item.id}`;
          const summaryDomId = `${instanceId}-${item.id}-summary`;

          const isHighlightedItem =
            highlight !== undefined &&
            highlight.id === item.id &&
            selectedId === item.id;
          const shouldPlayAnimation =
            isHighlightedItem &&
            !prefersReducedMotion &&
            trackedTheme === theme &&
            completedAnimToken !== highlight.token;
          const animationClass = shouldPlayAnimation
            ? HIGHLIGHT_CLASS_MAP[theme][highlight.mode]
            : "";
          const isStaticHighlightActive =
            isHighlightedItem && dismissedStaticToken !== highlight.token;

          const paragraphs = item.answer
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

          return (
            <details
              key={item.id}
              ref={setDetailsRef(item.id)}
              id={detailsDomId}
              name={groupName}
              onToggle={(e) => handleDetailsToggle(item.id, e)}
              className={
                isRetro
                  ? "faq-details faq-card group rounded-sm border-2 border-[#3a2212] bg-[#fffdf8] text-[#28180d] shadow-[4px_4px_0px_#3a2212] open:bg-[#fcf6e8]"
                  : "faq-details faq-card group rounded-3xl border-[3px] border-[#141026] bg-[#ffffff] text-[#141026] shadow-[5px_5px_0px_#141026] open:bg-[#f5fffb]"
              }
            >
              <summary
                id={summaryDomId}
                data-highlight={isStaticHighlightActive ? "active" : undefined}
                onAnimationEnd={() => {
                  if (isHighlightedItem) {
                    setCompletedAnimToken(highlight.token);
                  }
                }}
                className={`faq-summary-highlighted flex min-h-[56px] cursor-pointer select-none items-start justify-between gap-3 p-4 sm:items-center sm:p-5 ${
                  isRetro
                    ? "rounded-sm hover:bg-[#f9f2e2]"
                    : "rounded-3xl hover:bg-[#fff0f7]"
                } ${animationClass}`}
              >
                <span className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
                  <span
                    aria-hidden="true"
                    className={
                      isRetro
                        ? "faq-q-badge inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xs border-2 border-[#3a2212] bg-[#a82417] text-sm font-bold text-[#fffdf8] shadow-[2px_2px_0px_#3a2212]"
                        : "faq-q-badge inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#141026] bg-[#ff79b4] text-sm font-black text-[#141026] shadow-[2px_2px_0px_#141026]"
                    }
                  >
                    Q{qNumber}
                  </span>

                  <span className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="break-words text-base font-bold leading-snug sm:text-lg">
                      {item.question}
                    </span>
                    <span
                      className={
                        isRetro
                          ? "faq-category-badge inline-flex w-fit shrink-0 items-center rounded-xs border border-[#3a2212] bg-[#efe3ca] px-2.5 py-0.5 text-xs font-semibold text-[#28180d]"
                          : "faq-category-badge inline-flex w-fit shrink-0 items-center rounded-full border-2 border-[#141026] bg-[#6bf0d2] px-2.5 py-0.5 text-xs font-bold text-[#141026]"
                      }
                    >
                      {FAQ_CATEGORY_LABELS[item.category]}
                    </span>
                  </span>
                </span>

                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="faq-chevron mt-1 h-6 w-6 shrink-0 text-current sm:mt-0"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>

              <div
                className={
                  isRetro
                    ? "faq-answer border-t-2 border-dashed border-[#3a2212] px-4 pb-5 pt-4 sm:px-6"
                    : "faq-answer border-t-[3px] border-[#141026] px-4 pb-5 pt-4 sm:px-6"
                }
              >
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className={
                      isRetro
                        ? "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xs border border-[#3a2212] bg-[#efe3ca] text-xs font-bold text-[#28180d]"
                        : "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#141026] bg-[#6bf0d2] text-xs font-black text-[#141026]"
                    }
                  >
                    A
                  </span>
                  <div className="min-w-0 flex-1 space-y-2 break-words text-sm leading-relaxed sm:text-base">
                    {paragraphs.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </div>

      {includeJsonLd ? (
        <FaqJsonLd items={items} scriptId={`${instanceId}-jsonld`} />
      ) : null}
    </section>
  );
}
