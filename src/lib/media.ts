export function normalizeMediaUrl(url: string) {
  const trimmed = (url || "").trim();
  if (!trimmed) return trimmed;
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  const withoutQuery = trimmed.split("?")[0].split("#")[0];
  const normalized = withoutQuery
    .replace(/^\/uploads\/products\//, "/books/")
    .replace(/^\/uploads\/watch\//, "/books/")
    .replace(/^\/uploads\/testimonials\//, "/testimonials/")
    .replace(/^\/watch\//, "/books/")
    .replace(/^\/watches\//, "/books/")
    .replace(/^\/testimonial\//, "/testimonials/");

  return normalized;
}
