"use client";

import { ShareButtonGroup } from "@/components/ShareButtonGroup";
import { useStickyShareBar } from "@/hooks/useStickyShareBar";
import type { MobileStickyShareBarProps } from "@/lib/faq-types";

export function MobileStickyShareBar({
  url,
  title,
  text,
  theme,
  footerId,
}: MobileStickyShareBarProps) {
  const {
    barRef,
    isRetreated,
    hasFocusWithin,
    footerOverlap,
    barHeight,
    handleFocusIn,
    handleFocusOut,
  } = useStickyShareBar(footerId);

  const isRetro = theme === "retro";

  return (
    <>
      <div
        aria-hidden="true"
        className="block w-full md:hidden"
        style={{ height: `${barHeight}px` }}
      />
      <aside
        ref={barRef}
        aria-label="モバイル用クイック共有バー"
        data-theme={theme}
        data-focus-within={hasFocusWithin ? "true" : undefined}
        inert={isRetreated ? true : undefined}
        onFocus={handleFocusIn}
        onBlur={handleFocusOut}
        style={{
          bottom: `${Math.max(0, footerOverlap)}px`,
          maxHeight: "100dvh",
          transform: isRetreated ? "translateY(110%)" : "translateY(0)",
          visibility: isRetreated ? "hidden" : "visible",
        }}
        className={`sticky-share-bar pb-safe fixed inset-x-0 z-40 block md:hidden ${
          isRetro
            ? "border-t-2 border-[#3a2212] bg-[#f6efe0]/95 text-[#28180d] shadow-[0_-3px_0_#3a2212]"
            : "border-t-[3px] border-[#141026] bg-[#e4fbf4]/95 text-[#141026] shadow-[0_-4px_0_#141026]"
        } backdrop-blur-xs`}
      >
        <div className="px-safe mx-auto max-w-3xl py-2.5">
          <ShareButtonGroup
            url={url}
            title={title}
            text={text}
            theme={theme}
            compact
            statusIdPrefix="mobile-sticky"
          />
        </div>
      </aside>
    </>
  );
}

export default MobileStickyShareBar;
