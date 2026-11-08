"use client";

import { AccordionFaq } from "@/components/AccordionFaq";
import type { AccordionFaqBaseProps } from "@/lib/faq-types";

export type RetroAccordionFaqProps = AccordionFaqBaseProps;

export function RetroAccordionFaq(props: RetroAccordionFaqProps) {
  return <AccordionFaq {...props} theme="retro" />;
}

export default RetroAccordionFaq;
