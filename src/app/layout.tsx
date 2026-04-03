import type { Metadata } from "next";
import { Bitter, Rubik } from "next/font/google";

import "./globals.css";

const headingFont = Bitter({
  variable: "--font-heading",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const bodyFont = Rubik({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Postly AI | Эмнэлгийн AI видео платформ",
  description:
    "Эмнэлэг, клиник, агентуудад зориулсан Монгол хэл дээрх AI видео үйлдвэрлэлийн SaaS платформ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mn"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
