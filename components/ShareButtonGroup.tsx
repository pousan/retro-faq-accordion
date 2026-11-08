"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  attemptNativeShare,
  buildLineShareUrl,
  buildXIntentUrl,
  copyToClipboard,
} from "@/lib/share";
import type { ShareButtonGroupProps, ShareStatus } from "@/lib/faq-types";

export function ShareButtonGroup({
  url,
  title,
  text,
  theme,
  compact = false,
  statusIdPrefix,
}: ShareButtonGroupProps) {
  const reactId = useId();
  const baseId = statusIdPrefix ? `${statusIdPrefix}-${reactId}` : reactId;
  const statusId = `${baseId}-share-status`;
  const manualInputId = `${baseId}-manual-url`;

  const [status, setStatus] = useState<ShareStatus>("idle");
  const [message, setMessage] = useState<string>("");
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [showManualCopy, setShowManualCopy] = useState<boolean>(false);

  const manualInputRef = useRef<HTMLInputElement | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const scheduleIdleReset = useCallback(() => {
    clearResetTimer();
    resetTimerRef.current = window.setTimeout(() => {
      setStatus("idle");
      setMessage("");
    }, 4000);
  }, [clearResetTimer]);

  useEffect(() => {
    return () => {
      clearResetTimer();
    };
  }, [clearResetTimer]);

  useEffect(() => {
    setShowManualCopy(false);
    setStatus("idle");
    setMessage("");
  }, [url]);

  useEffect(() => {
    if (showManualCopy && manualInputRef.current) {
      manualInputRef.current.focus();
      manualInputRef.current.select();
    }
  }, [showManualCopy]);

  const handleCopyClick = useCallback(async () => {
    if (!url || isBusy) {
      return;
    }
    clearResetTimer();
    setIsBusy(true);

    const copied = await copyToClipboard(url);
    setIsBusy(false);

    if (copied) {
      setShowManualCopy(false);
      setStatus("copied");
      setMessage("共有URLをクリップボードにコピーしました。");
      scheduleIdleReset();
    } else {
      setShowManualCopy(true);
      setStatus("error");
      setMessage(
        "自動コピーできなかったため、下のURL欄を選択して手動でコピーしてください。"
      );
    }
  }, [clearResetTimer, isBusy, scheduleIdleReset, url]);

  const handleNativeShareClick = useCallback(async () => {
    if (!url || isBusy) {
      return;
    }
    clearResetTimer();
    setIsBusy(true);
    setStatus("sharing");
    setMessage("共有メニューを開いています…");

    const outcome = await attemptNativeShare({
      title,
      text,
      url,
    });

    if (outcome === "shared") {
      setIsBusy(false);
      setShowManualCopy(false);
      setStatus("idle");
      setMessage("共有を完了しました。");
      scheduleIdleReset();
      return;
    }

    if (outcome === "aborted") {
      setIsBusy(false);
      setStatus("idle");
      setMessage("");
      return;
    }

    const fallbackCopied = await copyToClipboard(url);
    setIsBusy(false);

    if (fallbackCopied) {
      setShowManualCopy(false);
      setStatus("copied");
      setMessage(
        "お使いの環境では共有シートが利用できないため、URLをコピーしました。"
      );
      scheduleIdleReset();
    } else {
      setShowManualCopy(true);
      setStatus("error");
      setMessage(
        "共有に失敗しました。「URLをコピー」ボタンを押すか、下のURL欄から手動でコピーしてください。"
      );
    }
  }, [clearResetTimer, isBusy, scheduleIdleReset, text, title, url]);

  const isRetro = theme === "retro";
  const isDisabled = !url || isBusy;

  const xHref = url ? buildXIntentUrl({ url, title, text }) : undefined;
  const lineHref = url ? buildLineShareUrl({ url }) : undefined;

  const buttonBaseClass = isRetro
    ? "faq-focusable inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xs border-2 border-[#3a2212] bg-[#fffdf8] px-3 py-2 text-xs font-bold text-[#28180d] shadow-[2px_2px_0px_#3a2212] hover:bg-[#f9f2e2] active:translate-x-[1px] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
    : "faq-focusable inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full border-2 border-[#141026] bg-[#ffffff] px-3.5 py-2 text-xs font-bold text-[#141026] shadow-[3px_3px_0px_#141026] hover:bg-[#fff0f7] active:translate-x-[1px] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm";

  const accentButtonClass = isRetro
    ? "faq-focusable inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xs border-2 border-[#3a2212] bg-[#a82417] px-3 py-2 text-xs font-bold text-[#fffdf8] shadow-[2px_2px_0px_#3a2212] hover:bg-[#8f1d12] active:translate-x-[1px] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
    : "faq-focusable inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full border-2 border-[#141026] bg-[#ff79b4] px-3.5 py-2 text-xs font-black text-[#141026] shadow-[3px_3px_0px_#141026] hover:bg-[#ff5ca4] active:translate-x-[1px] active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm";

  const disabledLinkClass =
    "pointer-events-none cursor-not-allowed opacity-50";

  return (
    <div
      role="group"
      aria-label="現在の表示状態・質問リンクを共有"
      aria-describedby={statusId}
      className="w-full"
    >
      <div
        className={`flex flex-wrap items-center ${
          compact ? "justify-between gap-2" : "gap-2.5 sm:gap-3"
        }`}
      >
        {url && xHref ? (
          <a
            href={xHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X（旧Twitter）で共有（新しいタブで開きます）"
            className={`${buttonBaseClass} ${compact ? "flex-1" : ""}`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 shrink-0"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Xで共有</span>
          </a>
        ) : (
          <span
            role="link"
            aria-disabled="true"
            className={`${buttonBaseClass} ${disabledLinkClass} ${
              compact ? "flex-1" : ""
            }`}
          >
            <span>Xで共有</span>
          </span>
        )}

        {url && lineHref ? (
          <a
            href={lineHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LINEで共有（新しいタブで開きます）"
            className={`${buttonBaseClass} ${compact ? "flex-1" : ""}`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 shrink-0"
            >
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            <span>LINE</span>
          </a>
        ) : (
          <span
            role="link"
            aria-disabled="true"
            className={`${buttonBaseClass} ${disabledLinkClass} ${
              compact ? "flex-1" : ""
            }`}
          >
            <span>LINE</span>
          </span>
        )}

        <button
          type="button"
          onClick={handleNativeShareClick}
          disabled={isDisabled}
          className={`${accentButtonClass} ${compact ? "flex-1" : ""}`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span>共有</span>
        </button>

        <button
          type="button"
          onClick={handleCopyClick}
          disabled={isDisabled}
          className={`${buttonBaseClass} ${compact ? "flex-1" : ""}`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0"
          >
            {status === "copied" ? (
              <path d="M20 6L9 17l-5-5" />
            ) : (
              <>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </>
            )}
          </svg>
          <span>{status === "copied" ? "コピー済" : "URLをコピー"}</span>
        </button>
      </div>

      <div
        id={statusId}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={
          message
            ? `mt-2 rounded-xs px-2.5 py-1 text-xs font-semibold ${
                status === "error"
                  ? "border border-[#a82417] bg-[#f9dcd6] text-[#28180d]"
                  : isRetro
                  ? "border border-[#3a2212] bg-[#efe3ca] text-[#28180d]"
                  : "border-2 border-[#141026] bg-[#6bf0d2] text-[#141026]"
              }`
            : "sr-only"
        }
      >
        {message}
      </div>

      {showManualCopy && url ? (
        <div className="mt-2 flex flex-col gap-1">
          <label htmlFor={manualInputId} className="text-xs font-bold">
            共有URL（長押しまたは全選択してコピーしてください）
          </label>
          <input
            ref={manualInputRef}
            id={manualInputId}
            type="text"
            readOnly
            value={url}
            onClick={(e) => e.currentTarget.select()}
            className={
              isRetro
                ? "faq-focusable w-full rounded-xs border-2 border-[#3a2212] bg-[#fffdf8] px-2.5 py-1.5 font-mono text-xs text-[#28180d]"
                : "faq-focusable w-full rounded-lg border-2 border-[#141026] bg-[#ffffff] px-2.5 py-1.5 font-mono text-xs text-[#141026]"
            }
          />
        </div>
      ) : null}
    </div>
  );
}

export default ShareButtonGroup;
