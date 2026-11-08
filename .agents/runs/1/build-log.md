# Build Log (2026-11-08)

## 1. やったこと

- **プロジェクト土台の作成・依存関係の固定**
  - `package.json`: Next.js `16.4.5`、React / React DOM `19.2.9`、Tailwind CSS / `@tailwindcss/postcss` `4.1.18`、TypeScript `5.9.3`、ESLint `9.39.5` / `eslint-config-next` `16.4.5` を具体的なパッチ番号で固定し、`npm install` により `package-lock.json` を生成（`npx tsc --noEmit` 型チェック通過確認済み）。
  - `postcss.config.mjs`（`@tailwindcss/postcss` のみ）、`tsconfig.json`（`strict: true`、`@/*` エイリアス）、`next.config.ts`、`eslint.config.mjs`、`.gitignore` を作成。
- **スタイル・アニメーション・アクセシビリティ定義 (`app/globals.css`)**
  - Tailwind CSS v4 形式（`@import "tailwindcss"`、`@theme`、`@utility pb-safe` / `px-safe`）および `[data-theme="retro"]` / `[data-theme="citypop"]` のCSS変数を定義。
  - `@supports (interpolate-size: allow-keywords) and selector(details::details-content)` によるネイティブ `block-size: auto` 開閉アニメーション、`transition-behavior: allow-discrete`、`@starting-style` による初期描画時のアニメーション開始状態、非対応環境での標準 `<details>` 即時開閉フォールバックを実装。
  - 初期ディープリンク到達時の2往復点滅（`.animate-flash-retro`, `.animate-flash-citypop`）と手動開閉時の1回パルス（`.animate-subtle-retro`, `.animate-subtle-citypop`）を定義。
  - `@media (forced-colors: active)`（システムカラー `Canvas`/`CanvasText`/`ButtonText`/`Highlight` の適用と装飾除去）および `@media (prefers-reduced-motion: reduce)`（アニメーション・トランジション停止と静的アウトライン代替）を実装。
- **データ・型・純粋関数 (`lib/`, `data/`)**
  - `lib/faq-types.ts`: `FaqTheme`、`FaqCategory`、`FaqItem`、`AccordionFaqBaseProps`、`AccordionFaqProps`、共有UI props 等の型定義。
  - `data/faqs.ts`: Studio Miraie（カフェ向けホームページ制作）のサンプルFAQ 8問（料金148,000円、モニター98,000円、保守月額5,000〜10,000円、店名義ドメイン、非リース、検索順位保証なし、制作相談、事例確認）を誇大表現なしで定義。
  - `lib/faq-query.ts`: `?style=retro|citypop` と `?q=1..8` の厳密な検証・正規化（重複・小数・範囲外・不正文字列の排除）と既存クエリ・ハッシュを保持したURL生成関数を実装。
  - `lib/faq-jsonld.ts`: `FAQPage` 構造化データ生成と `<` の `\u003c` エスケープによるスクリプト注入防止を実装。
  - `lib/share.ts`: 検証済みクエリのみを含む共有URL生成、X / LINE 共有URLエンコード、Web Share API（`canShare` 確認・`AbortError` 分岐）と Clipboard API フォールバック関数を実装。
- **カスタムフック・コンポーネント・ページ (`hooks/`, `components/`, `app/`)**
  - `hooks/useFaqQuerySync.ts`: `useSearchParams` によるURL単一正本管理、`window.history.replaceState` による履歴を汚さない同期、初回有効 `q` 指定時の1回限定フォーカス＆スムーズスクロール（事前操作検知での中断、`prefers-reduced-motion` 配慮）を実装。
  - `hooks/useStickyShareBar.ts`: `requestAnimationFrame` 集約のスクロール方向判定（上下12px閾値、先頭24px以内での再表示）、`IntersectionObserver` + `ResizeObserver` + `visualViewport` によるフッター吸着（`bottom` 補正）・スクロール退避（`transform` + `inert` + `visibility: hidden`）・フォーカス保護を実装。
  - `components/AccordionFaq.tsx` / `RetroAccordionFaq.tsx` / `CityPopAccordionFaq.tsx` / `FaqJsonLd.tsx`: `<details name="...">` による排他開閉、非対応ブラウザ向け排他補助、閉イベントと開イベントの競合を回避する次フレーム `[open]` 再確認、JSON-LD同梱を実装。
  - `components/ShareButtonGroup.tsx` / `components/MobileStickyShareBar.tsx` / `components/SiteFooter.tsx`: X / LINE / Web Share / URLコピー / 手動コピー用読み取り専用欄 / `aria-live="polite"` ステータス通知を実装。
  - `app/layout.tsx`（`lang="ja"`、`viewportFit: "cover"`）、`app/page.tsx`（プレビューへの導線）、`app/faq-preview/page.tsx`（Server Component + `<Suspense>` 境界 + 静的代替表示 + `FaqPreviewClient`）を実装。

## 2. 根拠（設計書の該当箇所）

- **§1 前提と技術選定**: Next.js 16.x (`16.4.5`)、React 19.2.x (`19.2.9`)、Tailwind CSS 4.1.x (`4.1.18`)、TypeScript 5.x (`5.9.3`) の採用と CSS ベース設定（`tailwind.config.ts` 不使用）。
- **§2 ディレクトリと責務**: `app/`、`components/`、`hooks/`、`lib/`、`data/` のファイル分割と責務分離。
- **§3 データモデルと8問の文案**: `FaqItem` 型、`q=1..8` と固定配列順の対応、仕様記載の既知条件のみに基づく8問の質問・回答文案。
- **§4 コンポーネント契約・DOM・状態**: 共通 props 契約、`<details name="...">` と `<summary>` のDOM構造、次フレーム `[open]` 確認による排他開閉同期、`<` を `\u003c` に置換する `FAQPage` JSON-LD 出力、1テーマ単一描画によるDOM・重複script防止。
- **§5 faq-preview・クエリ同期**: Server Component の `app/faq-preview/page.tsx` と `<Suspense>` ラップ、URL正本管理、`history.replaceState` 同期、初回有効 `q` のみのスムーズスクロール＆フォーカス移動。
- **§6 globals.css**: `@theme`、`@utility pb-safe`、`interpolate-size: allow-keywords`、`details::details-content`、`transition-behavior: allow-discrete`、`@starting-style`、`.animate-flash-*`（2往復）・`.animate-subtle-*`（1回）、`prefers-reduced-motion: reduce`、`forced-colors: active`。
- **§7 共有UIの仕様**: `ShareButtonGroup`（X / LINE / Web Share / コピー / 手動コピー欄 / 独立した status ID）と `MobileStickyShareBar`（rAFスクロール監視、フッターsentinel監視、safe area対応スペーサー、`inert` 退避）。
- **§8 アクセシビリティ・品質条件**: ネイティブ `details/summary` キーボード操作保持、4.5:1以上の文字コントラスト（ピンク・ミント上の濃色文字）、44×44px以上のターゲット領域、色だけに頼らない選択表示。

## 3. 未確認のこと

- 開発サーバー起動（`npm run dev`）および本番ビルド（`npm run build` / `npm run start`）の実行確認（指示により検証担当のスコープのため未実行）。
- 実ブラウザ（Chromium / Firefox / Safari / iOS実機）での表示確認、レスポンシブ幅（320px〜デスクトップ）、Safe Area、スクロール・フッター吸着挙動、Web Share / Clipboard API の実機動作確認。
- スクリーンリーダーおよび Windows ハイコントラストモード（`forced-colors: active`）実環境での視覚・読み上げ確認。

## 4. 検品指摘への修正記録 (2026-11-08)

`.agents/runs/1/check-log.md` の指摘事項（および検証担当による実測再現）に対し、以下の修正を実施した。

- **【高】項目10 初期スクロール・フォーカス (`hooks/useFaqQuerySync.ts`)**
  - `initialNavHandledRef`（boolean）を `initialNavStatusRef`（`"idle" | "scheduled" | "completed"`）へ変更し、予約中（`"scheduled"`）と実行完了（`"completed"`）を分離。Strict Mode の `setup → cleanup → setup` で最初の cleanup 時に `"scheduled"` から `"idle"` へ戻すことで、2回目の setup で二重 `requestAnimationFrame` が再予約され、対象 `<summary>` への `focus({ preventScroll: true })` と `scrollIntoView` が確実に1回実行されるよう修正。
  - 初期強調トークン発行も `initialHighlightDispatchedRef` で分離し、Strict Mode 再実行で重複インクリメントしないよう整理。
  - 事前操作検知リスナーに `scroll` イベントを追加し、初期移動実行前にユーザーがスクロールした場合はフォーカス・スクロール移動を抑止。プログラムによる `scrollIntoView` 実行直前に `scroll` リスナーを解除し、自身のスムーズスクロールをユーザー操作と誤認しないよう制御。
- **【高】項目7 StickyBar のフォーカス保護・接近時のみ計測 (`hooks/useStickyShareBar.ts`, `components/MobileStickyShareBar.tsx`)**
  - `window.visualViewport` の `offsetTop` と `height` を用いて可視領域の上端（`viewportTop`）・下端（`viewportBottom`）・レイアウトビューポート下端からのオフセット（`visualBottomOffset`）を算出。
  - バー内にフォーカスがある間（`hasFocusWithin`）は、退避を抑止するだけでなく、`footerOverlap`（CSS `bottom` 値）を `[visualBottomOffset, max(visualBottomOffset, floor(innerHeight - viewportTop - barHeight))]` の範囲にクランプし、フッターを大きくスクロールした場合やソフトキーボード表示・拡大時でもバーが可視領域外（画面上端より上・可視下端より下）へ押し出されないよう修正。`focusin` / `focusout` 時にも即座に `scheduleSync` で位置を再計算するよう連携。
  - `MobileStickyShareBar.tsx` でも `hasFocusWithin` の状態属性と `maxHeight: "100dvh"`、非負 `bottom` 指定を適用。
  - 性能改善（項目7・低）：`footerEl.getBoundingClientRect()` を `IntersectionObserver` が更新する `footerNearRef.current === true` のときのみ呼ぶように変更し、非接近時の毎フレーム計測を排除。
- **【中】項目9 URL同期・排他開閉 (`hooks/useFaqQuerySync.ts`, `components/AccordionFaq.tsx`)**
  - (a) `handleThemeChange` と `handleOpenChange` の各操作直前に `new URLSearchParams(window.location.search)` を `parseFaqQuery` で解析し、変更しない側の値（テーマ変更時の `selectedId`、開閉変更時の `theme`）を古い render 値ではなく現在URLから取得するよう修正。
  - (b) `AccordionFaq.tsx` で固定1フレームの `requestAnimationFrame` による `syncingTargetRef` 解除を廃止し、DOM変更が発生したときのみ `syncingTargetRef` を設定して `toggle` 側の次フレーム確認時に目標値との一致で消費するよう変更。さらに `selectedIdRef` と実DOMの `activeOpenId` が既に一致している場合は `onOpenChange` を通知しないようガードし、`useFaqQuerySync.ts` の `handleOpenChange` でも現在URLおよび `selectedId` と同一なら早期 return することで、`?style=invalid&q=1` の初期オープン時にプログラム由来 `toggle` でURLが無操作正規化される不具合を解消。
- **【中】項目2 強調アニメーションの状態管理 (`components/AccordionFaq.tsx`, `hooks/useFaqQuerySync.ts`)**
  - テーマ変更時（`trackedTheme !== theme`）に現在の `highlight.token` を即座に完了扱い（`completedAnimToken = highlight.token`）とし、テーマ切替で別テーマの `animation-name` が適用されて強調アニメーションが再生・再開始されないよう修正。
  - `animationend` イベントだけに依存せず、`prefers-reduced-motion: reduce` の一致監視（`matchMedia`）、アニメーション時間に応じたフォールバックタイマー（flash: 1700ms / subtle: 600ms）、および選択項目変更（`selectedId !== highlight.id`）時の完了・静的強調解除（`dismissedStaticToken` および `useFaqQuerySync` 側の `highlight` クリア）を実装。
- **【中】項目3 単体コンポーネントの字体 (`components/AccordionFaq.tsx`, `app/globals.css`)**
  - `AccordionFaq.tsx` の `<section>` に `faq-section` クラスを付与し、`app/globals.css` で `.faq-section, [data-theme="retro"], [data-theme="citypop"]` に `font-family: var(--faq-font)` を適用。単体ラッパー（`RetroAccordionFaq` / `CityPopAccordionFaq`）を任意の親要素下に配置してもテーマ固有の明朝／サンセリフ字体が適用されるよう修正。
- **【低】項目5 共有成功時の表示 (`components/ShareButtonGroup.tsx`)**
  - Web Share API 成功時（`outcome === "shared"`）に `status` を `"copied"` ではなく `"idle"` に設定し、ライブリージョン通知（`message: "共有を完了しました。"`）を行いつつ、コピー専用ボタンが「コピー済」に変わらないよう修正（Clipboard フォールバック成功時のみ `status === "copied"`）。
- **【低】項目13 型安全性 (`hooks/useStickyShareBar.ts`)**
  - `updateStateIfChanged` 内の `(next as any)[key] = val` および `eslint-disable` コメントを廃止し、スプレッドマージ `{ ...prev, ...partial }` と各プロパティの厳密等価比較による型安全な状態更新に置換。
- **項目14（アクセシビリティ）・項目16（build-log整合）**
  - 項目7（フォーカス中のバー位置維持）と項目10（初期深いリンクのフォーカス・スクロール）の修正によりアクセシビリティ上の指摘箇所を解消し、本記録に検品項目番号との対応を反映。実ブラウザ・ビルド・型チェック・lint による最終検証は検証担当へ引き継ぐ。
