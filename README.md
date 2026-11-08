# retro-faq-accordion

昭和純喫茶・和レトロと80sシティポップ、2つのデザインを切り替えられるFAQアコーディオン（Next.js 16 App Router + React 19 + Tailwind CSS v4）。

- テーマ切替と開閉状態をURLクエリ（`?style=retro|citypop`、`?q=1..8`）に同期
- `<details name>` による排他開閉、JSON-LD（FAQPage）同梱
- X / LINE / Web Share API（フォールバック付き）共有UI、モバイル固定共有バー
- `prefers-reduced-motion` / `forced-colors` / iOSセーフエリア対応

## 使い方

```bash
npm install
npm run dev   # http://localhost:3000/faq-preview
```

サンプルFAQの文案はホームページ制作サービス「Studio Miraie」の案内用サンプルです。
