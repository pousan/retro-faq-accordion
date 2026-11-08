import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { FaqPreviewClient } from "@/components/FaqPreviewClient";
import { SiteFooter } from "@/components/SiteFooter";
import { FAQ_CATEGORY_LABELS, STUDIO_MIRAIE_CAFE_FAQS } from "@/data/faqs";

export const metadata: Metadata = {
  title: "よくあるご質問（FAQ）プレビュー",
  description:
    "Studio Miraie のカフェ向けホームページ制作に関するよくあるご質問（料金・保守・ドメイン名義・契約条件など全8問）。昭和純喫茶・和レトロと80sシティポップの2スタイルに対応。",
};

const FOOTER_ID = "faq-preview-footer";
const INSTANCE_ID = "preview-faq";

function FaqStaticFallback() {
  return (
    <section
      aria-labelledby="fallback-faq-heading"
      data-theme="retro"
      className="mx-auto w-full max-w-4xl space-y-6"
    >
      <div className="rounded-sm border-2 border-[#3a2212] bg-[#fffdf8] p-4 text-[#28180d] shadow-[4px_4px_0px_#3a2212] sm:p-6">
        <h2 id="fallback-faq-heading" className="text-xl font-bold sm:text-2xl">
          カフェ向けホームページ制作 よくあるご質問
        </h2>
        <p className="mt-1 text-xs text-[#593d26] sm:text-sm">
          全{STUDIO_MIRAIE_CAFE_FAQS.length}問・項目をクリックして回答を開閉できます
        </p>
      </div>

      <div className="faq-list flex flex-col gap-4">
        {STUDIO_MIRAIE_CAFE_FAQS.map((item, index) => {
          const qNumber = index + 1;
          return (
            <details
              key={item.id}
              id={`fallback-${item.id}`}
              name="fallback-preview-faq"
              className="faq-details faq-card rounded-sm border-2 border-[#3a2212] bg-[#fffdf8] text-[#28180d] shadow-[4px_4px_0px_#3a2212]"
            >
              <summary className="flex min-h-[56px] cursor-pointer items-center justify-between gap-3 p-4 sm:p-5">
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="faq-q-badge inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xs border-2 border-[#3a2212] bg-[#a82417] text-sm font-bold text-[#fffdf8]"
                  >
                    Q{qNumber}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <span className="break-words text-base font-bold sm:text-lg">
                      {item.question}
                    </span>
                    <span className="faq-category-badge inline-flex w-fit shrink-0 items-center rounded-xs border border-[#3a2212] bg-[#efe3ca] px-2.5 py-0.5 text-xs font-semibold">
                      {FAQ_CATEGORY_LABELS[item.category]}
                    </span>
                  </span>
                </span>
              </summary>
              <div className="faq-answer border-t-2 border-dashed border-[#3a2212] px-4 pb-5 pt-4 sm:px-6">
                <p className="text-sm leading-relaxed sm:text-base">
                  {item.answer}
                </p>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}

export default function FaqPreviewPage() {
  return (
    <div className="faq-theme-root flex min-h-screen flex-col justify-between">
      <div>
        <header className="px-safe mx-auto max-w-4xl pb-6 pt-8 sm:pt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center rounded-xs border-2 border-current px-3 py-1 text-xs font-bold tracking-wider">
              Studio Miraie — カフェ向けホームページ制作
            </span>
            <Link
              href="/"
              className="faq-focusable inline-flex min-h-[44px] items-center rounded-xs px-2 text-xs font-bold underline sm:text-sm"
            >
              ← トップへ戻る
            </Link>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            昭和レトロ &amp; 80sシティポップ FAQアコーディオン
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-relaxed opacity-90 sm:text-base">
            料金・公開後の保守・ドメイン名義・契約条件など、お問い合わせ前によくいただくご質問をまとめています。テーマ切り替えや質問の開閉状態はURLクエリ（
            <code className="rounded-xs bg-black/10 px-1.5 py-0.5 font-mono text-xs">
              ?style=retro|citypop&amp;q=1..8
            </code>
            ）と連動し、そのまま共有できます。
          </p>
        </header>

        <main className="px-safe pb-8">
          <Suspense fallback={<FaqStaticFallback />}>
            <FaqPreviewClient
              items={STUDIO_MIRAIE_CAFE_FAQS}
              instanceId={INSTANCE_ID}
              footerId={FOOTER_ID}
            />
          </Suspense>
        </main>
      </div>

      <SiteFooter footerId={FOOTER_ID} />
    </div>
  );
}
