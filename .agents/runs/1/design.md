# FAQアコーディオン設計書

作成日: 2026-11-08 / 状態: 実装前の設計案

## 1. 前提と技術選定

`.agents/runs/1/spec.md` を要件の正本とする。調査時点でアプリの実装・package.json・ロックファイルは存在しない。今回は本書のみ作成し、アプリ生成や依存導入は行わない。

| 技術 | 採用する系列 | 理由 |
| --- | --- | --- |
| Next.js | 16.x の修正適用済み安定版 | App Router、Server Components、Suspense を使う。新規案件なので旧版への互換性維持は不要 |
| React / react-dom | 19.2.x の修正適用済み安定版、同一版 | Next.js 16 の対応系列。標準の details とクライアント境界を組み合わせる |
| Tailwind CSS / @tailwindcss/postcss | 4.1.x の修正適用済み安定版、系列を統一 | CSS ベース設定でテーマ・アニメーション・pb-safe を globals.css に集約 |
| TypeScript | 5.x 安定版、strict: true | FAQ型、テーマ、URL解析結果、DOM参照を型で制約 |
| Node.js / パッケージ管理 | Node.js 24 LTS / npm | 実装時に Next の engines と整合を確認し、package-lock.json をコミット |

これは採用系列の指定であり、最新版という主張ではない。実装開始時に各系列の配布状況・修正適用状況と peerDependencies を確認し、具体的なパッチ番号を package.json とロックファイルに固定する。互換性問題があれば設計書も更新する。

Tailwind v3 の tailwind.config.ts / content / plugin 方式は採用しない。v4 の `@import "tailwindcss"`、`@theme`、`@utility` を使用する。PostCSS は `@tailwindcss/postcss` のみを基本とする。独自アニメーションは静的クラスと通常の @keyframes で定義し、実行時に Tailwind クラス名を組み立てない。CSS の高度機能に未対応でも FAQ と共有操作は機能し、アニメーションだけ即時開閉へ劣化させる。

技術根拠: [Next.js 16](https://nextjs.org/blog/next-16)、[React 19.2](https://react.dev/blog/2025/10/01/react-19-2)、[Tailwind 4.1](https://tailwindcss.com/blog/tailwindcss-v4-1)、[Tailwind の独自スタイル](https://tailwindcss.com/docs/adding-custom-styles)。

## 2. ディレクトリと責務

```text
app/
  layout.tsx                   # lang=ja、metadata、viewport-fit=cover、globals.css読込
  globals.css                  # Tailwind v4設定、テーマ、アニメーション、アクセシビリティ
  page.tsx                     # /faq-previewへの入口リンク
  faq-preview/
    page.tsx                   # Server Component、ページ枠、Suspense、フッター
components/
  FaqPreviewClient.tsx         # URL同期、テーマ選択、FAQと共有UIの統合
  RetroAccordionFaq.tsx       # retroの薄いラッパー、共通FAQとJSON-LDを同梱
  CityPopAccordionFaq.tsx     # citypopの薄いラッパー、共通FAQとJSON-LDを同梱
  AccordionFaq.tsx            # details/summary、排他開閉、toggle通知、DOM参照
  FaqJsonLd.tsx               # 同じデータからFAQPageを安全にシリアライズ
  ShareButtonGroup.tsx       # X / LINE / Web Share / コピー、操作結果通知
  MobileStickyShareBar.tsx   # モバイル表示、スクロール・フッター位置判定
  SiteFooter.tsx             # フッターの実体、バー境界の参照先
hooks/
  useFaqQuerySync.ts          # 検証・正規化・URL更新・初期ナビゲーション
  useStickyShareBar.ts        # rAF、ResizeObserver、IntersectionObserverの管理
lib/
  faq-types.ts               # FaqItem、FaqTheme、共有の型
  faq-query.ts               # クエリ解析と直列化の純粋関数
  faq-jsonld.ts              # 構造化データの純粋な生成関数
  share.ts                   # 共有URL組立て、機能検出、コピー処理
data/
  faqs.ts                    # 表示順が固定された8問の正本
package.json                 # dev/build/start/typecheck/lint
package-lock.json            # 具体的依存版
postcss.config.mjs           # v4 PostCSS連携
tsconfig.json                # strictと@/*エイリアス
next.config.ts               # 最小設定、実験的機能は不要
```

FAQ、URL、共有のロジックは両テーマで共用する。テーマ選択には追加の状態管理ライブラリ、CSS-in-JS、アニメーションライブラリを導入しない。

## 3. データモデルと8問の文案

```ts
type FaqTheme = 'retro' | 'citypop';
type FaqCategory = 'pricing' | 'maintenance' | 'ownership' | 'contract' | 'seo' | 'process';
type FaqItem = Readonly<{
  id: string;              // 永続的なDOM/共有識別子。例: faq-price
  question: string;
  answer: string;          // プレーンテキスト。段落は改行で表現
  category: FaqCategory;
}>;
```

`readonly FaqItem[]` を両テーマ・JSON-LDで共有する。idは重複させず、qの番号は固定配列の1始まりの位置に対応する。既存の共有リンクを壊さないよう並び替え・途中への挿入は行わない。将来必要ならクエリの移行を別途設計する。category は表示ラベルに使用し、今回は絞り込み機能を追加しない。回答を HTML として解釈しない。

以下は仕様書に記された既知条件だけに基づくサンプル文案。外部公開情報を独自に確認したという表示はしない。税区分、対象範囲、キャンペーン期限、納期等の未確認事項は断定しない。

| q / id / category | 質問 | 回答案 |
| --- | --- | --- |
| 1 / faq-price / pricing | ホームページ制作の料金はいくらですか？ | 通常の制作料金は148,000円です。制作内容や対象範囲など、詳しい条件はご相談時にご確認ください。 |
| 2 / faq-monitor / pricing | モニター料金はありますか？ | モニター料金は98,000円です。募集状況や適用条件はお問い合わせください。 |
| 3 / faq-maintenance / maintenance | 公開後の保守料金はいくらですか？ | 保守料金は月額5,000〜10,000円です。対応内容や契約条件は事前にご確認ください。 |
| 4 / faq-domain / ownership | ドメインは誰の名義になりますか？ | ドメインはお店の名義で取得・管理する方針です。取得や更新の手続きについてはご相談ください。 |
| 5 / faq-lease / contract | リース契約になりますか？ | リース契約ではありません。制作や保守の契約内容は、お申し込み前にご確認ください。 |
| 6 / faq-ranking / seo | 検索順位の保証はありますか？ | 検索順位の保証はありません。検索結果はさまざまな要因で変動します。 |
| 7 / faq-materials / process | カフェのサイト制作では何を相談できますか？ | メニューや店舗情報など、サイトに載せたい内容をお聞かせください。必要な素材や制作範囲はご相談のうえで確認します。 |
| 8 / faq-results / process | 制作事例を見てから相談できますか？ | 公開可能な制作事例の有無や閲覧方法については、お問い合わせください。 |

「多数の制作実績」「売上向上」「最短○日」「修正無制限」「モニター募集中」等の裏付けのない表現を入れない。事例そのもの、顧客名、口コミを作らない。

## 4. コンポーネント契約・DOM・状態

### FAQ両テーマと共通本体

共通 props は `items: readonly FaqItem[]`、`title?: string`、`instanceId: string`、`selectedId: string | null`、`onOpenChange?: (id: string | null) => void`、`highlight?: { id: string; mode: 'flash' | 'subtle'; token: number }`、`includeJsonLd?: boolean`（既定true）。共通本体には追加で `theme: FaqTheme` を渡す。外部の selectedId はDOMへ反映する同期入力であり、個々の open を React の別stateへ複製しない。

```html
<section aria-labelledby="preview-faq-heading" data-theme="retro">
  <h2 id="preview-faq-heading">よくあるご質問</h2>
  <div class="faq-list">
    <details id="preview-faq-price" name="preview-faq">
      <summary id="preview-faq-price-summary">
        <span aria-hidden="true">Q</span>
        <span>ホームページ制作の料金はいくらですか？</span>
        <svg aria-hidden="true"><!-- 開閉装飾 --></svg>
      </summary>
      <div class="faq-answer"><p>通常の制作料金は148,000円です。…</p></div>
    </details>
  </div>
  <script type="application/ld+json">…</script>
</section>
```

summary は details の最初の子とする。summary 内にボタン・リンクを入れない。各項目は同一の name によるブラウザ標準の排他開閉とし、全閉も許可する。nameとDOM idには instanceId を付け、ページ内の他グループと衝突させない。propsの配列順からq番号を算出する。

内部は details の Map参照、最新コールバックのref、アニメーション再実行用tokenのみ。ユーザーの toggle 後、グループ全体の `[open]` を次のフレームで再確認し、実際の開項目を通知する。閉イベントで即座にqを消さない（新項目が開く際に旧項目の閉イベントも来るため）。URL反映中のtoggleは、目標値と一致する限り無視する。非対応ブラウザではtoggleで他のdetails.openをfalseにする補助を入れ、name対応環境でも冪等に動くようにする。URLからの指定変更は先に他項目を閉じ、対象だけopenにする。

Retro は生成り・濃茶・朱色のトークン、落款印風の装飾、明朝系システムフォント、ソリッドシャドウを使う。CityPop はホットピンクとミントを面・装飾に使い、文字は濃色、太黒枠、バブル角丸を使う。装飾の「Q」や印章は読み上げから除外し、必要な内容はテキストで提供する。

### JSON-LD

FaqJsonLd props は `items` と `scriptId`。内部状態なし。`@context: https://schema.org`、`@type: FAQPage`、`mainEntity` に各 `Question { name, acceptedAnswer: { @type: Answer, text } }` を生成する。改行を含むプレーンテキスト回答を表示と共用する。`JSON.stringify(payload).replace(/</g, '\\u003c')` でscript終了タグの注入を防ぎ、scriptに出力する。

両テーマ単体でJSON-LDを同梱できる契約とする。プレビューは一度に1テーマだけ表示し、同じ位置の共通本体のdata-themeだけ変更する。2テーマ分のFAQやscriptをCSSで隠して重複保持しない。複数グループを同ページに置く場合はページ責任でまとめたJSON-LDを1つ出し、個別のincludeJsonLdをfalseにする。構造化データは検索結果の特別表示を保証しない。

## 5. faq-preview・クエリ同期

page.tsx はServer Componentとし、見出し・説明・フッターを出力する。`<Suspense fallback={<FAQの静的な代替表示 />}>` の子に FaqPreviewClient を置く。useSearchParamsを呼ぶhookも必ずその内側に置く。代替表示には両テーマ共通の8問を標準detailsで表示し、JSON-LDは本体と同時に重複しない構成とする。親page自体ではuseSearchParamsを呼ばない。この境界は静的ルートの本番ビルドにも必要。[Next.js公式説明](https://nextjs.org/docs/app/api-reference/functions/use-search-params)

URLをテーマ・選択項目の唯一の正本とし、テーマ用useStateやlocalStorageを併用しない。解析結果は `{ theme, selectedId, validExplicitQuestion }`。`style`欠落・不正はretro、q欠落・不正は全閉。qは文字列全体が正の10進整数で1〜8のみ有効とし、`1abc`、小数、0、範囲外、重複したqは無効。style重複も不正とする。初回に不正URLを自動修正して履歴を増やすことはしない。

テーマUIはfieldset/legendを持つradio group（昭和レトロ／シティポップ）。変更時は同一URLのコピーを作りstyleをset、妥当なqは維持する。不正な既知パラメータは次の操作で正規化する。他のクエリとhashは保持する。開項目変更時はqをset、全閉時はdeleteする。

同期はNext.jsが統合する `window.history.replaceState(null, '', url)` を使用し、useSearchParamsの更新へ反映する。連続開閉で履歴を埋めず、スクロールを起こさない。同じURLなら更新しない。各更新の直前に現在のlocationから組み立て、テーマ操作とtoggleによる古いクエリの上書きを防ぐ。戻る・進むや外部からのURL変更もuseSearchParamsの解析結果からDOMへ反映する。将来「各開閉を戻るで辿る」仕様に変える場合のみpush方式へ変更する。

### 初期スクロールとフォーカス

初回のhydration後、明示された有効qがあり、対象summaryがDOMへ登録済みで、ユーザーがまだキー入力・ポインター操作・スクロールをしていない場合に限り1回実行する。qなし・不正qなら位置とフォーカスを変えない。クエリ対象をopenにし、描画後にsummary.focus({ preventScroll: true })とscrollIntoView({ behavior: 'smooth', block: 'start' })を実行する。summaryにscroll-margin-block-startを設ける。開くtransitionによる位置変化後は必要な場合だけ一度補正する。

reduced-motionならbehaviorはauto。Strict ModeのEffect再実行でも一度に抑えるrefを持ち、rAF・イベントをcleanupする。テーマ切替、通常開閉、戻る・進むでは自動スクロール／フォーカス移動を再実行しない。テーマ切替でも同じDOMと選択項目を保持する。

## 6. globals.css

### v4設定とsafe area

冒頭に `@import "tailwindcss";`。`@theme`でフォント・色・共通間隔を宣言し、テーマごとの実値は `[data-theme="retro"]` / `[data-theme="citypop"]` のCSS変数に設定する。共有バーまで包む共通ルートにdata-themeを付ける。

`@utility pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }` を定義する。バー外側はpb-safe、内側は通常のpyを使い、同一要素にpb-4を競合させない。app/layout.tsxのviewportでviewportFit: 'cover'を指定する。バー高さはsafe area込みで実測し、ページ末尾のスペーサーを同じ高さにする。iOS横向きには左右のsafe areaも確保する。

### ネイティブ開閉の段階的拡張

基本は標準detailsの即時開閉。`@supports (interpolate-size: allow-keywords) and selector(details::details-content)` 内でFAQ領域に `interpolate-size: allow-keywords` を指定する。`details::details-content` を閉時 `block-size: 0; opacity: 0; overflow: clip`、開時 `block-size: auto; opacity: 1` とする。約240msのblock-size/opacity transitionに加え、`content-visibility` の離散遷移と `transition-behavior: allow-discrete` を指定し、閉じる途中で内容が消えるのを遅らせる。

`@starting-style` の `details[open]::details-content` にblock-size:0 / opacity:0を定義し、初期open描画も開始状態を持てるようにする。初期移動対象の位置補正とは別に扱う。displayをJSで切り替えたり、固定max-heightで回答を切ったりしない。実ブラウザで機能ごとに確認し、未対応時は素のdetailsを使う。[MDN ::details-content](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::details-content)

### 強調アニメーション

- `.animate-flash-retro` / `.animate-flash-citypop`: 対象summaryの背景とリングをテーマ色で変化。1サイクル800ms、`0%,100%`通常・`50%`強調、iteration-count:2とし、通常→強調→通常を2往復させる。ページ全体を明滅させない。
- `.animate-subtle-retro` / `.animate-subtle-citypop`: summaryのリング・影を約500msで通常→拡大→通常へ1回だけ変化。レイアウト寸法と文字の不透明度は変えない。
- 有効qでの初回到達はflash、ユーザーが開いた項目はsubtle。テーマ変更と自動排他閉鎖では再生しない。全クラスは固定文字列の対応表を使用する。
- animationendでクラスを除去し、次の操作で再生可能にする。reduced-motion時はanimationendが来ないので、状態解除を同イベントだけに依存させない。

`@media (prefers-reduced-motion: reduce)` を最後側で定義し、対象のanimation:none、transition:none、scroll-behavior:auto。強調は静的outline / outline-offsetで代替し、選択変更まで表示する。バーの上下移動も即時とする。

`@media (forced-colors: active)` ではCanvas/CanvasText/ButtonText/Highlightを利用し、影・背景装飾を除去する。太い境界線、選択状態、focus-visibleのoutlineを残す。原則forced-color-adjust:autoとし、ブランドカラー固定を避ける。開閉アイコンはcurrentColorで描画する。

## 7. 共有UIの仕様

### ShareButtonGroup

props: `url: string | null`、`title: string`、`text?: string`、`theme: FaqTheme`、`compact?: boolean`。内部状態は `status: 'idle' | 'sharing' | 'copied' | 'error'`、通知文、操作中フラグ。DOMはラベル付きgroup内にX/LINEのa、共有button、コピーボタン、常設の `role="status" aria-live="polite"`。

共有URLはhydration後のlocation.originとpathnameに、検証済みstyleと有効qのみを付けて作成する。計測クエリや個人情報の可能性がある任意クエリは共有に含めない。origin未取得時は操作をdisabledにし、render中にwindowを参照しない。style/q変更時は通常共有と固定バーのURLを同時更新する。

Xは `https://twitter.com/intent/tweet` のtext/url、LINEは `https://social-plugins.line.me/lineit/share` のurlをURLSearchParamsでエンコードする。外部リンクはtarget=_blank、rel="noopener noreferrer"、新しいタブを開くことをアクセシブル名または隣接説明で伝える。

共有ボタンのクリックから直接navigator.share({ title, text, url })を呼ぶ。navigator.canShareが存在するときは可否も確認する。成功は完了を通知し、AbortErrorはキャンセルとしてエラー扱いにせず終了する。非対応またはその他失敗ではclipboard.writeTextへフォールバックする。共有待機後にユーザーアクティベーションが失われてコピーも失敗した場合は、明示的な「URLをコピー」ボタンから再操作できるようにする。

コピー専用ボタンは常時提供する。Clipboard API非対応・権限拒否・非secure contextでは、読み取り専用inputにURLを表示して選択し、手動コピーを案内する。非推奨execCommandを必須にしない。通常表示とバーでstatus用IDを共用しない。

### MobileStickyShareBar

props: ShareButtonGroupに必要な値に加え `footerId: string`。内部状態はscroll方向、方向ごとの累積距離、hiddenByScroll、footerOverlap、実測barHeight。DOMは専用ラベル付きaside、共有group、ページ末尾のスペーサー。幅768px未満で表示し、以上はdisplay:none。

スクロール監視はpassive listenerからrequestAnimationFrameに集約する。上下それぞれ12px以上の累積移動で判定し、方向反転で累積値をリセットする。下向きでtranslateYにより退避、上向きまたはページ先頭付近（24px以内）で再表示する。バウンスによる負のscrollYは0に丸める。バー内にfocusがある間は非表示にしない。退避中はinertとvisibility:hiddenでTab対象から外し、aria-hiddenだけで済ませない。

フッター境界はfooter先頭のsentinelをIntersectionObserverで監視し、接近中のみ位置計測する。バーのResizeObserverでsafe area込みの高さを取得する。通常は `position:fixed; bottom:0`。footerが表示領域下端より上に来た場合、`overlap = max(0, viewportBottom - footerTop)` を求め、bottom:overlapでバー下辺をfooter上端へ吸着させる。scroll/resizeでもrAF経由で再計測する。表示領域の上まで移動した場合は非表示とし、フッター上へ重ねない。footer未検出時は固定表示に劣化する。

フッター吸着中もフォーカス中は操作可能な位置を維持する。visualViewportが存在する場合はresize/scrollも購読し、ソフトキーボード表示時は非フォーカス状態のバーを退避してフォームを覆わない。各observer/listener/rAFはunmount時に解除する。スクロール中にReact全体を毎フレーム更新せず、状態値の変化時だけ更新する。

テーマはURL由来のtheme propと共通CSS変数で連動し、バーが別のテーマstateを持たない。footer吸着とスクロール隠蔽は別値として管理し、位置補正はbottom、隠蔽はtransformを使う。

## 8. アクセシビリティ・品質条件

- lang=ja、main、見出しの階層、sectionラベルを設定する。FAQは標準details/summaryのTab移動とEnter/Spaceによる開閉を保持し、独自キーハンドラで二重発火させない。矢印キーによる移動は標準必須ではないため追加しない。
- summaryにrole=buttonや手動aria-expandedを重ねず、ブラウザのネイティブ状態を使う。回答には必要以上のrole=regionを付けない。装飾SVGと印章はaria-hidden。
- 全操作にfocus-visibleの2px以上のoutlineとoffsetを設ける。summaryのoutlineをoverflowで切らない。ラジオの選択・FAQの開閉・共有の状態を色だけで区別しない。
- 文字のコントラストは通常4.5:1以上、大きい文字3:1以上、操作境界とフォーカス表示は背景に対して3:1以上を満たす。ピンク／ミント上の白い小文字を避け、実配色を測定する。
- 操作領域は原則44×44 CSS px以上。320px幅、200%ズームと400%リフローでも横方向のページスクロールを起こさない。長い回答・共有URLは折り返す。
- 自動フォーカスは有効な初期深いリンクの場合だけ。通常開閉・共有・テーマ切替では操作元を保持する。固定バーがコンテンツとキーボードフォーカスを覆わない。
- 静的HTMLのFAQはJavaScriptなしでも開閉して読めることを目標とする。テーマ選択・共有・クエリ連動にはJavaScriptが必要と説明できる構成にする。

## 9. 実装後の受け入れ確認

本書の作成時点ではアプリ未実装のため、以下は未実行。

1. `npm run build`、`npx tsc --noEmit`、設定したlintを実行。本番startでもSuspense境界とhydration警告を確認する。
2. 両スタイル×モバイル/デスクトップを実ブラウザで確認する。Chromium・Firefox・Safariで標準開閉とCSS非対応時の劣化を確認し、iOS safe areaも検証する。
3. q=1〜8、欠落、不正、重複、style切替、全閉、連続クリック、戻る・進むを確認する。排他閉イベントが新しいqを消さないこと、DOMのopenとURLが一致することを重点確認する。
4. 有効深いリンクのみ初期スクロール・focusが1回発生し、ユーザーが先に操作した場合は奪わない。テーマ切替後も開項目と操作元のfocusを保持する。
5. Web Share成功/キャンセル/失敗/非対応、Clipboard成功/拒否、手動コピー、X/LINEのURLエンコードを確認する。
6. 上下スクロール・フッター接近/離脱・画面回転・キーボード表示・フォーカス中のバー表示・safe area・本文末尾の隠れを確認する。
7. reduced-motion、forced-colors、キーボードのみ、スクリーンリーダー、コントラスト、320px・ズームを確認する。flashは2往復、subtleは1回、非表示バーへTabが入らないことを確認する。
8. JSON-LDは8問、表示文案と一致、ページ内1つ、script終端文字を安全にエスケープしていることを確認する。検索結果の表示保証や架空実績が文案に紛れ込んでいないことも確認する。
