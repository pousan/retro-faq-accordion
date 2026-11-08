import type { FaqItem } from "@/lib/faq-types";

export interface FaqPageJsonLd {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

export function createFaqJsonLdObject(items: readonly FaqItem[]): FaqPageJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function serializeFaqJsonLd(items: readonly FaqItem[]): string {
  const payload = createFaqJsonLdObject(items);
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}
