import type { SiteContentMap } from "@/features/site";

export function contentText(
  values: SiteContentMap,
  key: string,
  fallback = "",
): string {
  const value = values[key];
  return value && value.trim().length > 0 ? value : fallback;
}

export function contentJson<T>(
  values: SiteContentMap,
  key: string,
  fallback: T,
): T {
  const raw = values[key];
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function phoneHref(phone: string): string {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : "#";
}

export function mailHref(email: string): string {
  return email ? `mailto:${email}` : "#";
}
