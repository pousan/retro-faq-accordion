export type FaqTheme = "retro" | "citypop";

export type FaqCategory =
  | "pricing"
  | "maintenance"
  | "ownership"
  | "contract"
  | "seo"
  | "process";

export type FaqItem = Readonly<{
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
}>;

export type FaqHighlightMode = "flash" | "subtle";

export type FaqHighlight = Readonly<{
  id: string;
  mode: FaqHighlightMode;
  token: number;
}>;

export type AccordionFaqBaseProps = Readonly<{
  items: readonly FaqItem[];
  title?: string;
  instanceId: string;
  selectedId: string | null;
  onOpenChange?: (id: string | null) => void;
  highlight?: FaqHighlight;
  includeJsonLd?: boolean;
}>;

export type AccordionFaqProps = AccordionFaqBaseProps &
  Readonly<{
    theme: FaqTheme;
  }>;

export type FaqQueryParseResult = Readonly<{
  theme: FaqTheme;
  selectedId: string | null;
  validExplicitQuestion: boolean;
  questionIndex: number | null;
}>;

export type ShareStatus = "idle" | "sharing" | "copied" | "error";

export type ShareButtonGroupProps = Readonly<{
  url: string | null;
  title: string;
  text?: string;
  theme: FaqTheme;
  compact?: boolean;
  statusIdPrefix?: string;
}>;

export type MobileStickyShareBarProps = Readonly<{
  url: string | null;
  title: string;
  text?: string;
  theme: FaqTheme;
  footerId: string;
}>;
