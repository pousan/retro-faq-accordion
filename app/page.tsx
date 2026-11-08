import Link from "next/link";

export default function HomePage() {
  return (
    <main className="px-safe mx-auto flex min-h-screen max-w-3xl flex-col justify-center py-12">
      <div className="rounded-sm border-2 border-[#3a2212] bg-[#fffdf8] p-6 text-[#28180d] shadow-[5px_5px_0px_#3a2212] sm:p-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-xs border border-[#3a2212] bg-[#efe3ca] px-3 py-1 text-xs font-bold">
          <span>Studio Miraie サンプルFAQ</span>
        </div>

        <h1 className="text-2xl font-bold tracking-wide sm:text-3xl">
          昭和レトロ &amp; 80sシティポップ FAQアコーディオン
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[#593d26] sm:text-base">
          カフェ向けホームページ制作のよくあるご質問（全8問）を、2つのレトロデザインテーマ（昭和純喫茶・和レトロ／80sシティポップ）でプレビュー・共有できるページです。
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/faq-preview?style=retro"
            className="faq-focusable flex min-h-[56px] flex-col justify-between rounded-sm border-2 border-[#3a2212] bg-[#a82417] p-4 text-[#fffdf8] shadow-[3px_3px_0px_#3a2212] transition-transform hover:-translate-y-0.5"
          >
            <span className="text-xs font-semibold opacity-90">
              ?style=retro
            </span>
            <span className="mt-1 text-base font-bold">
              昭和純喫茶・和レトロで開く →
            </span>
          </Link>

          <Link
            href="/faq-preview?style=citypop"
            className="faq-focusable flex min-h-[56px] flex-col justify-between rounded-2xl border-[3px] border-[#141026] bg-[#ff79b4] p-4 text-[#141026] shadow-[4px_4px_0px_#141026] transition-transform hover:-translate-y-0.5"
          >
            <span className="text-xs font-bold">?style=citypop</span>
            <span className="mt-1 text-base font-black">
              80s シティポップで開く →
            </span>
          </Link>
        </div>

        <div className="mt-6 border-t border-dashed border-[#3a2212]/40 pt-4 text-xs text-[#593d26]">
          <p className="font-semibold">質問指定のディープリンク例：</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link
              href="/faq-preview?style=retro&q=1"
              className="faq-focusable underline hover:text-[#a82417]"
            >
              Q1. 制作料金（レトロ）
            </Link>
            <span>/</span>
            <Link
              href="/faq-preview?style=citypop&q=2"
              className="faq-focusable underline hover:text-[#a82417]"
            >
              Q2. モニター料金（シティポップ）
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
