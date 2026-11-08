import { serializeFaqJsonLd } from "@/lib/faq-jsonld";
import type { FaqItem } from "@/lib/faq-types";

export interface FaqJsonLdProps {
  items: readonly FaqItem[];
  scriptId: string;
}

export function FaqJsonLd({ items, scriptId }: FaqJsonLdProps) {
  const jsonLdString = serializeFaqJsonLd(items);

  return (
    <script
      id={scriptId}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLdString }}
    />
  );
}
