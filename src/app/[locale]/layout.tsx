// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";

export function generateStaticParams() {
  return [{ locale: "fr" }, { locale: "en" }];
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  // Informe next-intl de la locale courante pour cette requête
  setRequestLocale(locale);

  // Récupère les messages (src/i18n/request.ts gère aussi le fallback "fr")
  const messages = await getMessages();

  // IMPORTANT : on ne rend PAS <html>/<body> ici (seulement dans le layout racine)
  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen mx-auto max-w-md p-4">{props.children}</div>
    </NextIntlClientProvider>
  );
}
