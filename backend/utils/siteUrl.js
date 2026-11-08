// Public address of the website, used for links in emails (buttons,
// password reset). Set SITE_URL to change it; FRONTEND_URL is not used here
// because an old value pointed links at someone else's site.
const DEFAULT_SITE_URL = "https://wheelz-sand.vercel.app";

exports.siteUrl = () => (process.env.SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
