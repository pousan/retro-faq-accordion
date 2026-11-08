import type {
  FaqItem,
  FaqQueryParseResult,
  FaqTheme,
} from "@/lib/faq-types";

export interface SearchParamsLike {
  getAll(name: string): string[];
}

const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

export function isValidFaqTheme(value: string | null | undefined): value is FaqTheme {
  return value === "retro" || value === "citypop";
}

export function getQuestionNumberById(
  items: readonly FaqItem[],
  selectedId: string | null
): number | null {
  if (!selectedId) {
    return null;
  }
  const index = items.findIndex((item) => item.id === selectedId);
  return index >= 0 ? index + 1 : null;
}

export function parseFaqQuery(
  searchParams: SearchParamsLike,
  items: readonly FaqItem[]
): FaqQueryParseResult {
  const styleValues = searchParams.getAll("style");
  const rawStyle = styleValues.length === 1 ? styleValues[0] : null;
  const theme: FaqTheme = isValidFaqTheme(rawStyle) ? rawStyle : "retro";

  const qValues = searchParams.getAll("q");
  if (qValues.length !== 1) {
    return {
      theme,
      selectedId: null,
      validExplicitQuestion: false,
      questionIndex: null,
    };
  }

  const rawQ = qValues[0];
  if (!POSITIVE_INTEGER_PATTERN.test(rawQ)) {
    return {
      theme,
      selectedId: null,
      validExplicitQuestion: false,
      questionIndex: null,
    };
  }

  const parsedNumber = Number(rawQ);
  if (
    !Number.isSafeInteger(parsedNumber) ||
    parsedNumber < 1 ||
    parsedNumber > items.length
  ) {
    return {
      theme,
      selectedId: null,
      validExplicitQuestion: false,
      questionIndex: null,
    };
  }

  const targetItem = items[parsedNumber - 1];
  if (!targetItem) {
    return {
      theme,
      selectedId: null,
      validExplicitQuestion: false,
      questionIndex: null,
    };
  }

  return {
    theme,
    selectedId: targetItem.id,
    validExplicitQuestion: true,
    questionIndex: parsedNumber,
  };
}

export function buildNextRelativeUrl(
  currentHref: string,
  nextState: {
    theme: FaqTheme;
    selectedId: string | null;
  },
  items: readonly FaqItem[]
): string {
  const url = new URL(currentHref);
  url.searchParams.set("style", nextState.theme);

  const qNumber = getQuestionNumberById(items, nextState.selectedId);
  if (qNumber !== null) {
    url.searchParams.set("q", String(qNumber));
  } else {
    url.searchParams.delete("q");
  }

  return `${url.pathname}${url.search}${url.hash}`;
}
