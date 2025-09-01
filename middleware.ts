import createMiddleware from "next-intl/middleware";
import intlConfig from "./next-intl.config";

export default createMiddleware(intlConfig);

export const config = {
  matcher: [
    "/",
    "/((?!api|_next|.*\\..*).*)" // exclut /api, /_next et tous les fichiers (.*)
  ]
};
