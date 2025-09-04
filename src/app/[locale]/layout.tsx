// src/app/[locale]/layout.tsx
import { Toaster } from 'sonner'
import { NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

export function generateStaticParams() {
  return [{ locale: 'fr' }, { locale: 'en' }]
}

const dictionaries: Record<string, () => Promise<{ default: any }>> = {
  fr: () => import('../../../messages/fr.json'),
  en: () => import('../../../messages/en.json')
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const messagesLoader = dictionaries[locale] ?? dictionaries.fr
  const messages = (await messagesLoader()).default

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* base lisible */}
      <div className="min-h-screen mx-auto max-w-md p-4 bg-white text-neutral-900 antialiased">
        {children}
        <Toaster position="top-center" richColors closeButton />
      </div>
    </NextIntlClientProvider>
  )
}
