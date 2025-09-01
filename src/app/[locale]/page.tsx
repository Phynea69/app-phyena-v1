"use client";
import {useTranslations} from "next-intl";
import Link from "next/link";

export default function Home() {
  const t = useTranslations();
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">{t("home.title")}</h1>
      <div className="p-4 rounded-xl bg-sky-100">Tailwind v4 OK</div>
      <Link href="/fr/today" className="inline-block bg-sky-600 text-white px-4 py-2 rounded-lg">
        {t("home.cta.start")}
      </Link>
    </main>
  );
}
