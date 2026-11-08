import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Studio Miraie カフェ向けホームページ制作 FAQ",
    template: "%s | Studio Miraie FAQ",
  },
  description:
    "昭和純喫茶・和レトロと80sシティポップの2スタイルを切り替えられる、Studio Miraie（カフェ向けホームページ制作）のFAQアコーディオン。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" data-theme="retro">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
