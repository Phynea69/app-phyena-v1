// src/app/layout.tsx
import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CureCoach",
  description: "Coach de cure — PWA"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Next 15 : cookies() doit être awaited
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value ?? "fr";

  return (
    <html lang={cookieLocale} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
