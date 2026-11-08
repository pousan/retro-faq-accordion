import type { FaqCategory, FaqItem } from "@/lib/faq-types";

export const FAQ_CATEGORY_LABELS: Readonly<Record<FaqCategory, string>> = {
  pricing: "料金・プラン",
  maintenance: "公開後の保守",
  ownership: "権利・名義",
  contract: "契約条件",
  seo: "検索・SEO",
  process: "制作の進め方",
};

export const STUDIO_MIRAIE_CAFE_FAQS: readonly FaqItem[] = [
  {
    id: "faq-price",
    question: "ホームページ制作の料金はいくらですか？",
    answer:
      "通常の制作料金は148,000円です。制作内容や対象範囲など、詳しい条件はご相談時にご確認ください。",
    category: "pricing",
  },
  {
    id: "faq-monitor",
    question: "モニター料金はありますか？",
    answer:
      "モニター料金は98,000円です。募集状況や適用条件はお問い合わせください。",
    category: "pricing",
  },
  {
    id: "faq-maintenance",
    question: "公開後の保守料金はいくらですか？",
    answer:
      "保守料金は月額5,000〜10,000円です。対応内容や契約条件は事前にご確認ください。",
    category: "maintenance",
  },
  {
    id: "faq-domain",
    question: "ドメインは誰の名義になりますか？",
    answer:
      "ドメインはお店の名義で取得・管理する方針です。取得や更新の手続きについてはご相談ください。",
    category: "ownership",
  },
  {
    id: "faq-lease",
    question: "リース契約になりますか？",
    answer:
      "リース契約ではありません。制作や保守の契約内容は、お申し込み前にご確認ください。",
    category: "contract",
  },
  {
    id: "faq-ranking",
    question: "検索順位の保証はありますか？",
    answer:
      "検索順位の保証はありません。検索結果はさまざまな要因で変動します。",
    category: "seo",
  },
  {
    id: "faq-materials",
    question: "カフェのサイト制作では何を相談できますか？",
    answer:
      "メニューや店舗情報など、サイトに載せたい内容をお聞かせください。必要な素材や制作範囲はご相談のうえで確認します。",
    category: "process",
  },
  {
    id: "faq-results",
    question: "制作事例を見てから相談できますか？",
    answer:
      "公開可能な制作事例の有無や閲覧方法については、お問い合わせください。",
    category: "process",
  },
] as const;
