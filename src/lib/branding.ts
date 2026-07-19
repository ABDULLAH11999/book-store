export const BRAND_NAME = "IslamicPlay";
export const BRAND_SLUG = "islamic-play";
export const BRAND_TAGLINE = "Islamic-inspired shopping";
export const BRAND_DOMAIN = "islamicplay.pk";
export const BRAND_SITE_URL = `https://${BRAND_DOMAIN}`;
export const BRAND_DARK_GREEN = "#2f3c2f";
export const BRAND_LOGO_PATH = "/ui-image/Logo.avif";
export const BRAND_BANNER_PATH = "/ui-image/banner.webp";
export const BRAND_SUPPORT_EMAIL = `hello@${BRAND_DOMAIN}`;
export const BRAND_NO_REPLY_EMAIL = `no-reply@${BRAND_DOMAIN}`;
export const BRAND_ADMIN_EMAIL = `admin@${BRAND_DOMAIN}`;

export const BACKUP_FILE_PREFIX = `${BRAND_SLUG}-backup`;

export function createBackupFilename(date = new Date()) {
  return `${BACKUP_FILE_PREFIX}-${date.toISOString().replace(/[:.]/g, "-")}.json`;
}
