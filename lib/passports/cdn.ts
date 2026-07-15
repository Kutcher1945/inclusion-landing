export const CDN_BASE = "https://opendata.smartalmaty.kz";

export function toAbsoluteUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${CDN_BASE}${url.startsWith("/") ? "" : "/"}${url}`;
}
