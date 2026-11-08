# FAQアコーディオン 検品記録

検品日：2026-11-08

対象：`.agents/runs/1/spec.md`、`design.md`、`build-log.md`、`app/`・`components/`・`hooks/`・`lib/`・`data/` の全ソース、package.json、package-lock.json、TypeScript／Next.js／PostCSS／ESLint設定、.gitignore。

方法：ソースの静的照合とロックファイルの依存情報確認。ビルド・型チェック・lint・ブラウザ実行は行っていない。「合格」は静的に確認できる実装についての判定であり、実機検証の完了を意味しない。重大度は、高＝主要要件・操作継続に影響、中＝条件付きの機能不良・設計契約違反、低＝局所的な品質・保守性の問題。

## 1. globals.css の基本機能：合格

`app/globals.css:1` 以降に Tailwind v4 の @import／@theme、テーマ変数、pb-safe／px-safe がある。`@supports` 内で interpolate-size: allow-keywords、::details-content の block-size: 0 → auto、opacity、content-visibility の遷移、transition-behavior: allow-discrete、@starting-style を定義。非対応時も標準 details が残り、固定max-heightによる切り詰めはない。

flash は800ms×2回、0%／100%通常・50%強調の2往復。subtle は500ms×1回で影のみを変える。forced-colors はシステムカラー、装飾除去、開状態の境界線とフォーカスoutlineを定義。reduced-motion はFAQ・バーのtransitionと4種のanimationを止め、静的outlineに置換する。実ブラウザでのCSS対応差・Windows実表示は別途検証が必要。

## 2. 強調アニメーションの状態管理：要修正（重大度：中）

根拠：`components/AccordionFaq.tsx:40`、`:219` 付近の completedAnimToken とテーマ別クラス選択、`:248` 付近の animationend 処理。完了前にテーマを変更すると、同じtokenでも animation-name がテーマ別名へ変わり、強調を再開始する。設計§6の「テーマ変更では再生しない」と一致しない。

また reduced-motion では animationend が来ず、completedAnimToken は更新されない。別項目へURL変更しても以前の highlight 自体はhookに残るため、設定を通常motionへ戻す／以前の項目へ戻る際の再強調が操作と一致しない可能性がある。設計指定の「同イベントだけに依存させない」を満たしていない。テーマ変更で再生を開始させず、選択変更とmotion設定を含めて完了・静的強調の寿命を管理すること。

## 3. 両テーマ・単体コンポーネント：要修正（重大度：中）

Retro／CityPop のラッパー、共通本体、落款印、濃茶・朱色、ピンク・ミント、太黒枠、バブル角丸、ソリッド影は実装済み。プレビューは同一AccordionFaqのthemeだけ変更し、二重DOMを保持しない。

ただし `components/AccordionFaq.tsx:138` のsectionはdata-themeとw-fullのみ。`app/globals.css` の font-family 適用先はbodyと .faq-theme-root に限られる。CSS変数をsectionで変更しても、祖先で計算済みのfont-family継承値は変わらない。したがって各ラッパー単体では祖先テーマの字体となる（例：citypop祖先にRetroAccordionFaqを置いても明朝にならない）。設計§4の単体テーマ契約に合わせ、本体にもテーマのfont-familyを適用すること。プレビューでは親 .faq-theme-root により字体が切り替わる。

## 4. JSON-LD：合格

`lib/faq-jsonld.ts:16–33` は同じreadonly FAQ配列からFAQPage／Question／Answerを生成し、JSON.stringify後に `<` を `\\u003c` へ置換する。`components/FaqJsonLd.tsx:9–17` がapplication/ld+jsonとして出力。共通本体はincludeJsonLd既定trueで両ラッパーに同梱される。プレビューの本体は1つ、Suspense代替表示にはscriptがなく、2テーマ分の重複はない。8問の表示と構造化データは同じ正本を参照している。

## 5. 共有UIとフォールバック：要修正（重大度：低）

URL生成、X／LINEのURLSearchParamsエンコード、target／rel、新規タブの読み上げ名、hydration前の操作抑止は合格。`lib/share.ts:48–100` と `components/ShareButtonGroup.tsx:67–139` に、クリックからのWeb Share呼び出し、canShare、AbortError、Clipboardフォールバック、コピー専用ボタン、失敗時のラベル付きreadonly input・選択処理がある。通常共有とバーのstatus IDはuseIdで分離され、role=statusが常設されている。共有URLには検証済みstyle／qだけを含む。

局所的な表示不整合：同コンポーネント`:106–110` はWeb Share成功もstatus="copied"にするため、`:280` のコピー専用ボタンが、実際にはコピーしていないのに「コピー済」と表示される。共有成功の通知とコピー完了の状態を区別すること。

## 6. StickyBar の基本スクロール・safe area：合格

`hooks/useStickyShareBar.ts:88` 以降にpassive listener→rAF、12px累積・方向反転時リセット、先頭24pxで表示、負scrollYの丸め、フォーカス中のスクロール退避抑止、observer／listener／rAFのcleanupがある。`components/MobileStickyShareBar.tsx:27–58` は768px未満のみ、退避時inert＋visibility、bottomとtransformの役割分離、pb-safe外側＋py内側、px-safeを使用。ResizeObserverの実測高をスペーサーへ反映する。layoutはviewportFit: cover。テーマは同じURL由来propsを使用している。

## 7. StickyBar のフッター吸着・フォーカス保護：要修正（重大度：高）

根拠：`hooks/useStickyShareBar.ts:123–143`、`:146–152`、`components/MobileStickyShareBar.tsx:39–42`。

通常の吸着式 max(0, innerHeight - footerTop) とフッターsentinel監視はある。しかしフォーカス中でもbottom補正は上限なく増える一方、画面上への退避判定だけを無効化している。バーにフォーカスを置いてフッターを上方へスクロールすると、バーが画面外へ押し上げられたまま操作対象に残る。設計§7の「フッター吸着中もフォーカス中は操作可能な位置を維持」に違反する。フッターが短い現在のサンプルで再現しない場合も、画面高が小さい環境や再利用時には成立する条件である。

visualViewportはイベント購読とキーボード判定だけに使用され、フォーカス中はキーボード退避も抑止する。吸着のviewportBottomは常にinnerHeightで、visualViewportのheight／offsetTopを位置計算に使っていない。ソフトキーボードや拡大時の可視領域内にフォーカス操作を保つ処理が必要。フォーカス時の位置を可視領域に制限し、非フォーカス時の吸着・退避と両立させること。

さらに同hook`:128` はfooterNearに関係なく毎回getBoundingClientRectを呼ぶ。設計の「接近中のみ位置計測」に未達（この性能面のみは重大度：低）。

## 8. クエリ解析・正規化：合格

`lib/faq-query.ts:28–85` はstyle重複／不正をretro、q欠落／重複／不正／範囲外を全閉にする。文字列全体の正整数判定とsafe integer判定があり、1abc・小数・0は無効。qは固定配列の1始まり位置に対応する。`:88–106` は既知パラメータをset／deleteし、他のクエリとhashを保存する。URLが同一ならreplaceしない実装もある。

## 9. URL同期・排他開閉：要修正（重大度：中）

ネイティブdetails name、Map参照による非対応時の排他補助、全閉、次フレームで実際のopenを調べる仕組みはある。Reactに各openの別stateを複製せず、URL解析結果をDOMへ反映する方針も合っている。

(a) `hooks/useFaqQuerySync.ts:188–213` のテーマ変更はrender時のselectedId、開閉通知はrender時のthemeを渡す。`:172` では現在locationを読むが、その時点のstyle／qを再解析せず両方を上書きする。次render前にURL変更と別操作が重なると、最新styleまたはqが以前の値へ戻る。設計§5で明示された古いクエリの上書き防止を満たさない。各操作直前にlocationを解析し、変更しない側の値も現在URLから取得すること。

(b) `components/AccordionFaq.tsx:64–66` はURL→DOM同期の抑止値を次rAFで解除する。一方toggle通知も`:108–127` の次rAFで判定するため、先に登録された解除後に通知が実行される経路ではプログラムによるtoggleを利用者操作として通知する。例えば `?q=1&style=invalid` の初期openが通知されると、不正styleがユーザー操作なしにretroへ正規化され得る。設計の「初回に不正URLを自動修正しない」や初期操作判定に影響する。固定1フレームだけで抑止を解除せず、同期先との一致／現在selectedIdとの一致で不要通知を抑止すること。イベント順序を含む再現は検証担当へ引き継ぐ。

## 10. 初期スクロール・フォーカス：要修正（重大度：高）

根拠：`hooks/useFaqQuerySync.ts:54–164`。有効qだけの二重rAF、summaryへのfocus({preventScroll:true})、scrollIntoView、reduced-motion時auto、位置補正、cleanupは存在する。

しかし`:88` で実行前にinitialNavHandledRefをtrueにする。Strict Modeの setup→cleanup→setup では、最初のcleanupが予約rAFをキャンセルし、次のsetupは`:55` で早期returnする。結果として初期スクロールとフォーカスが一度も実行されない。設計§5で明示されたStrict Mode対応に未達。実処理の完了と予約中を区別し、cleanup後に未実行処理を再予約できるようにすること。

また事前操作監視はkeydown／pointerdown／wheel／touchmoveに限られ、scrollそのものを監視していない。スクロールバー操作・外部scroll変更等は検知できない（この点の重大度：中）。ユーザーが先にスクロールした場合にフォーカスと位置を奪わない条件も補完すること。

## 11. Suspense・ページ構成：合格

`app/faq-preview/page.tsx:104–111` はServer ComponentからSuspenseでFaqPreviewClientを包む。useSearchParamsは境界内のhookのみ。代替表示は標準detailsの8問。lang=ja、main、h1→h2、sectionのラベルがあり、JSON-LD重複も避けている。CSR bail-outの本番ビルド確認は検証担当の範囲。

## 12. props・データモデル・ファイル構成・バージョン：合格

`lib/faq-types.ts` のFaqTheme／FaqCategory／Readonly FaqItem、共通props、共有props、footerIdは設計に一致。statusIdPrefixやquestionIndexの追加は契約を壊さない。指定ファイルは揃っている。8件のidは一意、配列順・文案・カテゴリも設計どおり。

package.jsonとpackage-lock.jsonはNext 16.4.5、React／react-dom 19.2.9、Tailwind／PostCSS 4.1.18、TypeScript 5.9.3で一致。指定系列とパッチ固定を満たす。ロック上のNextのReact peer範囲、react-domのReact peer範囲、Node enginesは組み合わせと整合する。実行環境はNode v24.22.1、package enginesは>=24。修正適用状況・脆弱性・外部レジストリ上の最新性は今回認定していない。

## 13. TypeScript の型安全性：要修正（重大度：低）

strict: true、props・FAQ・DOM ref・戻り値の型は概ね明示され、ソース照合でprops不一致や明確な未定義参照は見つからない。faq-queryには範囲と対象項目の存在確認がある。

`hooks/useStickyShareBar.ts:41–46` の `(next as any)[key] = val` とlint抑止が唯一の明示anyで、keyと値の型の対応を迂回している。濫用ではないが設計の型制約方針から改善が必要。型を保つオブジェクトマージ等で更新できる。型チェック成功はbuild-logの申告であり、本検品では未実行。

## 14. アクセシビリティ：要修正（重大度：高）

summaryはdetails最初の子で、内部にリンク・ボタンを入れず、role=button／手動aria-expanded／独自キーハンドラもない。装飾Q／A／印章／SVGはaria-hidden。ラジオはfieldset／legend／label付き、共有にはラベルとlive statusがある。FAQ・共有ボタンの主要操作域は44px以上、summary等のfocus-visibleは3pxで、outlineを切るdetailsのoverflow指定はない。文字は濃色中心で、架空のaria状態は付加していない。

ただし項目7のフォーカス対象バーの画面外移動と項目10の初期フォーカス欠落があるため全体合格にはできない。通常フォーカスを固定バーが覆わないこと、320px・200%／400%表示、実配色のコントラスト測定、スクリーンリーダー、forced-colorsは実機未確認。bodyのoverflow-x: clipは内容が収まる証拠にはならず、横にはみ出した内容の切れも検証すること。

## 15. FAQ文案とStudio Miraie条件：合格

`data/faqs.ts:12–69` は通常148,000円、モニター98,000円、保守5,000〜10,000円／月、店名義ドメイン、リースなし、検索順位保証なしを明記し、仕様書に提示された公開条件と矛盾しない。募集状況・契約範囲は確認を促す表現で、未確認の税区分・期限・納期を断定しない。制作事例は有無を問い合わせる表現に留め、顧客名・口コミ・実績数・売上成果を作っていない。フッターもサンプルFAQであることを説明する。

これは仕様書記載条件との照合であり、外部公開サイトの最新条件を独自に確認したとの判定ではない。

## 16. build-logとの整合：要修正（重大度：中）

ファイル作成・依存固定・主要機能の存在は記録と一致する。一方、Strict Modeでの初期移動、同期時のtoggle通知抑止、最新URLを使う競合回避、フォーカス中のバー位置維持は、実装の存在だけで達成済みと判断できない。上記の修正・再検品結果を記録へ反映すること。コントラスト値や実機操作に関する未測定事項は、実証済みの品質保証と分けて記述する必要がある。

## 検証担当への引き継ぎ

修正後、両テーマ×モバイル／デスクトップに加え、Strict Mode下の有効q初期訪問、連続テーマ変更と開閉、初期不正style＋有効q、戻る／進む、フッター上でバーにフォーカスしたスクロール、可視領域縮小、Web Share成功時のコピー表示、Clipboard拒否、motion設定変更を重点確認すること。ビルド・型チェック・lintおよび設計§9のブラウザ検証は別担当で実施する。

## 総合判定：要修正（重大度：高）

主要機能・文案・データ・JSON-LD・Suspenseの骨格は揃っているが、初期スクロール＆フォーカスと固定バーのフォーカス保護に主要な未達がある。URL同期と強調状態の設計差分も修正が必要。現時点では検品合格としない。実装ソースは変更していない。
