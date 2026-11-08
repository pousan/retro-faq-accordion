"use client";

import { useEffect } from "react";
import { AccordionFaq } from "@/components/AccordionFaq";
import { MobileStickyShareBar } from "@/components/MobileStickyShareBar";
import { ShareButtonGroup } from "@/components/ShareButtonGroup";
import { useFaqQuerySync } from "@/hooks/useFaqQuerySync";
import type { FaqItem, FaqTheme } from "@/lib/faq-types";

export interface FaqPreviewClientProps {
  items: readonly FaqItem[];
  instanceId?: string;
  footerId: string;
}

const THEME_OPTIONS: ReadonlyArray<{
  value: FaqTheme;
  label: string;
  sublabel: string;
  badgeText: string;
}> = [
  {
    value: "retro",
    label: "昭和純喫茶・和レトロ",
    sublabel: "生成り紙・濃茶文字・朱色落款印・明朝体・ソリッド影",
    badgeText: "純喫茶",
  },
  {
    value: "citypop",
    label: "80s シティポップ",
    sublabel: "ホットピンク×ミント・濃色文字・太黒枠・バブル角丸",
    badgeText: "80s POP",
  },
];

export function FaqPreviewClient({
  items,
  instanceId = "preview-faq",
  footerId,
}: FaqPreviewClientProps) {
  const {
    theme,
    selectedId,
    questionIndex,
    highlight,
    shareUrl,
    handleThemeChange,
    handleOpenChange,
  } = useFaqQuerySync(items, instanceId);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const isRetro = theme === "retro";
  const selectedQuestion = selectedId
    ? items.find((item) => item.id === selectedId) ?? null
    : null;

  const shareTitle = selectedQuestion
    ? `Q${questionIndex}. ${selectedQuestion.question} | Studio Miraie カフェ向けホームページ制作FAQ`
    : "Studio Miraie カフェ向けホームページ制作 よくあるご質問（FAQ）";

  const shareText = selectedQuestion
    ? selectedQuestion.answer
    : "昭和レトロ＆80sシティポップの2スタイルで切り替えられるカフェ向けホームページ制作FAQ";

  return (
    <div data-theme={theme} className="faq-theme-root w-full">
      <div className="mx-auto max-w-4xl space-y-8">
        <div
          className={
            isRetro
              ? "theme-selector-card rounded-sm border-2 border-[#3a2212] bg-[#fffdf8] p-4 shadow-[4px_4px_0px_#3a2212] sm:p-6"
              : "theme-selector-card rounded-3xl border-[3px] border-[#141026] bg-[#ffffff] p-4 shadow-[5px_5px_0px_#141026] sm:p-6"
          }
        >
          <fieldset>
            <legend
              className={
                isRetro
                  ? "mb-3 flex flex-wrap items-center gap-2 text-base font-bold text-[#28180d] sm:text-lg"
                  : "mb-3 flex flex-wrap items-center gap-2 text-base font-black text-[#141026] sm:text-lg"
              }
            >
              <span>デザインテーマ切り替え</span>
              <span
                className={
                  isRetro
                    ? "rounded-xs border border-[#3a2212] bg-[#efe3ca] px-2 py-0.5 text-xs font-semibold text-[#28180d]"
                    : "rounded-full border-2 border-[#141026] bg-[#ffd9ec] px-2.5 py-0.5 text-xs font-bold text-[#141026]"
                }
              >
                URLクエリ ?style={theme}
                {questionIndex ? `&q=${questionIndex}` : ""} と自動同期
              </span>
            </legend>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {THEME_OPTIONS.map((option) => {
                const isSelected = theme === option.value;
                return (
                  <label
                    key={option.value}
                    className={`faq-focusable relative flex min-h-[60px] cursor-pointer items-start gap-3 p-3.5 transition-colors focus-within:outline-3 focus-within:outline-offset-2 ${
                      isRetro
                        ? isSelected
                          ? "rounded-sm border-2 border-[#a82417] bg-[#fcf6e8] text-[#28180d] shadow-[3px_3px_0px_#3a2212]"
                          : "rounded-sm border-2 border-[#3a2212] bg-[#fffdf8] text-[#28180d] hover:bg-[#f9f2e2]"
                        : isSelected
                        ? "rounded-2xl border-[3px] border-[#141026] bg-[#ffd9ec] text-[#141026] shadow-[4px_4px_0px_#141026]"
                        : "rounded-2xl border-2 border-[#141026] bg-[#ffffff] text-[#141026] hover:bg-[#f5fffb]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="faq-theme-style"
                      value={option.value}
                      checked={isSelected}
                      onChange={() => handleThemeChange(option.value)}
                      className="mt-1 h-4 w-4 shrink-0 accent-[#a82417]"
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold sm:text-base">
                          {option.label}
                        </span>
                        <span
                          className={
                            isSelected
                              ? isRetro
                                ? "inline-flex items-center gap-1 rounded-xs border border-[#3a2212] bg-[#a82417] px-2 py-0.5 text-xs font-bold text-[#fffdf8]"
                                : "inline-flex items-center gap-1 rounded-full border-2 border-[#141026] bg-[#6bf0d2] px-2.5 py-0.5 text-xs font-black text-[#141026]"
                              : "inline-flex items-center rounded-xs border border-current/40 px-2 py-0.5 text-xs font-medium opacity-75"
                          }
                        >
                          {isSelected
                            ? `● 選択中 (${option.badgeText})`
                            : option.badgeText}
                        </span>
                      </span>
                      <span className="text-xs leading-relaxed opacity-85">
                        {option.sublabel}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        <AccordionFaq
          items={items}
          title="カフェ向けホームページ制作 よくあるご質問"
          instanceId={instanceId}
          selectedId={selectedId}
          onOpenChange={handleOpenChange}
          highlight={highlight}
          includeJsonLd={true}
          theme={theme}
        />

        <section
          aria-labelledby="inline-share-heading"
          className={
            isRetro
              ? "faq-card rounded-sm border-2 border-[#3a2212] bg-[#fffdf8] p-4 shadow-[4px_4px_0px_#3a2212] sm:p-6"
              : "faq-card rounded-3xl border-[3px] border-[#141026] bg-[#ffffff] p-4 shadow-[5px_5px_0px_#141026] sm:p-6"
          }
        >
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="inline-share-heading"
              className="text-base font-bold sm:text-lg"
            >
              このFAQ表示を共有する
            </h2>
            <p className="text-xs opacity-85">
              {selectedQuestion
                ? `現在選択中の「Q${questionIndex}. ${selectedQuestion.question}」への直リンクを共有します`
                : `現在のテーマ（${
                    isRetro ? "昭和純喫茶・和レトロ" : "80s シティポップ"
                  }）のFAQ一覧リンクを共有します`}
            </p>
          </div>

          <ShareButtonGroup
            url={shareUrl}
            title={shareTitle}
            text={shareText}
            theme={theme}
            statusIdPrefix="inline-share"
          />
        </section>
      </div>

      <MobileStickyShareBar
        url={shareUrl}
        title={shareTitle}
        text={shareText}
        theme={theme}
        footerId={footerId}
      />
    </div>
  );
}

export default FaqPreviewClient;
