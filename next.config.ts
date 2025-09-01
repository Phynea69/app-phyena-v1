// next.config.ts
import createNextIntlPlugin from "next-intl/plugin";

// IMPORTANT : pointer vers la *request config*
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl({
  reactStrictMode: true
});
