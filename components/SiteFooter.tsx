export interface SiteFooterProps {
  footerId: string;
}

export function SiteFooter({ footerId }: SiteFooterProps) {
  return (
    <footer
      id={footerId}
      className="faq-card relative mt-12 border-t-2 border-current/30 bg-black/5 text-current"
    >
      <div
        id={`${footerId}-sentinel`}
        aria-hidden="true"
        className="pointer-events-none h-px w-full"
      />
      <div className="px-safe mx-auto max-w-4xl py-8 text-xs leading-relaxed sm:text-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold">
              Studio Miraie — カフェ向けホームページ制作 FAQプレビュー
            </p>
            <p className="mt-1 opacity-85">
              掲載内容はご案内用のサンプルFAQです。制作範囲・契約条件・最新の募集状況はお問い合わせ時にご確認ください。
            </p>
          </div>
          <p className="shrink-0 font-semibold opacity-80">
            © Studio Miraie
          </p>
        </div>
      </div>
    </footer>
  );
}
