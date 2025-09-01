// src/i18n/request.ts
import {getRequestConfig} from "next-intl/server";

const SUPPORTED = ["fr", "en"] as const;
type Locale = (typeof SUPPORTED)[number];

export default getRequestConfig(async ({locale}) => {
  // Normalise la locale (si undefined, "sw.js", etc. -> "fr")
  const safe: Locale = SUPPORTED.includes(locale as Locale) ? (locale as Locale) : "fr";

  const messages = (await import(`../../messages/${safe}.json`)).default;

  // Toujours renvoyer la locale retenue + messages
  return {
    locale: safe,
    messages
  };
});
