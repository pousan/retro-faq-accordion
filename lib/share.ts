import { getQuestionNumberById } from "@/lib/faq-query";
import type { FaqItem, FaqTheme } from "@/lib/faq-types";

export function buildCleanShareUrl(params: {
  origin: string;
  pathname: string;
  theme: FaqTheme;
  selectedId: string | null;
  items: readonly FaqItem[];
}): string {
  const { origin, pathname, theme, selectedId, items } = params;
  const url = new URL(pathname, origin);
  url.searchParams.set("style", theme);

  const qNum = getQuestionNumberById(items, selectedId);
  if (qNum !== null) {
    url.searchParams.set("q", String(qNum));
  }

  return url.toString();
}

export function buildXIntentUrl(params: {
  url: string;
  text?: string;
  title: string;
}): string {
  const { url, text, title } = params;
  const shareText = text ? `${title} - ${text}` : title;
  const searchParams = new URLSearchParams();
  searchParams.set("text", shareText);
  searchParams.set("url", url);
  return `https://twitter.com/intent/tweet?${searchParams.toString()}`;
}

export function buildLineShareUrl(params: { url: string }): string {
  const searchParams = new URLSearchParams();
  searchParams.set("url", params.url);
  return `https://social-plugins.line.me/lineit/share?${searchParams.toString()}`;
}

export type WebShareOutcome =
  | "shared"
  | "aborted"
  | "unsupported"
  | "failed";

export async function attemptNativeShare(payload: {
  title: string;
  text?: string;
  url: string;
}): Promise<WebShareOutcome> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return "unsupported";
  }

  const shareData: ShareData = {
    title: payload.title,
    text: payload.text ?? payload.title,
    url: payload.url,
  };

  if (typeof navigator.canShare === "function") {
    try {
      if (!navigator.canShare(shareData)) {
        return "unsupported";
      }
    } catch {
      return "unsupported";
    }
  }

  try {
    await navigator.share(shareData);
    return "shared";
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return "aborted";
    }
    return "failed";
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (
    typeof navigator === "undefined" ||
    typeof window === "undefined" ||
    !window.isSecureContext ||
    !navigator.clipboard ||
    typeof navigator.clipboard.writeText !== "function"
  ) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
