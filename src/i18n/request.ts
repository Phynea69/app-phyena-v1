// src/i18n/request.ts
import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async ({locale}) => {
  // Sécurise la locale reçue
  const supported = ['fr', 'en'] as const;
  const resolved = (supported as readonly string[]).includes(locale) ? locale : 'fr';

  // Mapping statique = plus robuste pour le bundler
  const dictionaries: Record<string, () => Promise<{default: any}>> = {
    fr: () => import('../../messages/fr.json'),
    en: () => import('../../messages/en.json')
  };

  const messages = (await dictionaries[resolved]()).default;

  return {
    locale: resolved,
    messages
  };
});
