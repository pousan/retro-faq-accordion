"use client";

import { AccordionFaq } from "@/components/AccordionFaq";
import type { AccordionFaqBaseProps } from "@/lib/faq-types";

export type CityPopAccordionFaqProps = AccordionFaqBaseProps;

export function CityPopAccordionFaq(props: CityPopAccordionFaqProps) {
  return <AccordionFaq {...props} theme="citypop" />;
}

export default CityPopAccordionFaq;
