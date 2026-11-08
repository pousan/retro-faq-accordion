# 仕様： 昭和レトロ & 80sシティポップ FAQアコーディオン（ユーザーのタスク引き継ぎ指示書 2026-11-08 より）

Next.js (App Router) + Tailwind CSS。2つのレトロデザイン（昭和純喫茶・和レトロ / 80sシティポップ）を
切り替え可能な高機能FAQアコーディオンコンポーネント群を新規作成する。
※引き継ぎ書は「実装済み」と記していたが、実ファイルはMac側・Muse側の双方で存在しないことを確認済み。
本プロジェクトは同書を仕様として新規に実装する（ユーザー決定 2026-11-08）。

## app/globals.css の要件
- `interpolate-size: allow-keywords`（ネイティブ height: auto 伸縮）
- `@starting-style` および `transition-behavior: allow-discrete`
- 2往復点滅アニメーション（`.animate-flash-retro`, `.animate-flash-citypop`）
- 1回パルスアニメーション（`.animate-subtle-retro`, `.animate-subtle-citypop`）
- `prefers-reduced-motion: reduce` 対応（アニメーション停止・アウトライン代替）
- `forced-colors: active`（Windowsハイコントラストモード最適化）
- `pb-safe`（iOS Safe Area Inset 対応）

## コンポーネント
- `components/RetroAccordionFaq.tsx`: 昭和純喫茶・和レトロ風（落款印風バッジ、ソリッドシャドウ、明朝体、JSON-LD同梱）
- `components/CityPopAccordionFaq.tsx`: 80sシティポップ風（ホットピンク×ミントグリーン、太黒枠、バブル角丸、JSON-LD同梱）
- `components/ShareButtonGroup.tsx`: X（Twitter）、LINE、Web Share API / クリップボードコピー統合UI
- `components/MobileStickyShareBar.tsx`: スマホ専用下部固定バー（上下スクロール連動隠蔽、フッター吸着境界判定、テーマ連動）

## app/faq-preview/page.tsx の要件
- URLクエリ同期（`?style=retro|citypop`、`?q=1|2|...`）
- 排他開閉（`<details name="...">`）
- 初期アクセス時の自動スムーズスクロール & フォーカス
- `<Suspense>` ラップによる CSR bail-out 防止

## FAQサンプルデータ
ホームページ制作サービス（Studio Miraie のカフェ向け制作）のFAQをサンプルとして8問程度。
料金や条件は既存の公開情報（通常148,000円・モニター98,000円・保守5,000〜10,000円/月、ドメインは店名義、
リースなし、順位保証なし）と矛盾させないこと。実績の捏造はしない。

## 検証（引き継ぎ書 Step 1 以降が未達のため、もちが定義）
- `npm run build` 成功、`npx tsc --noEmit` エラーなし
- 実ブラウザで /faq-preview を両スタイル×（モバイル/デスクトップ）表示確認、はみ出し・JSエラーなし
- クエリ同期（?style=, ?q=）と排他開閉の動作確認
