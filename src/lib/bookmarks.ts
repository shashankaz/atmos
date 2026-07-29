import type { Bookmark } from "@/types/bookmark";

export const DEFAULT_BOOKMARKS: Bookmark[] = [
  { id: "youtube", title: "YouTube", url: "https://youtube.com" },
  { id: "gmail", title: "Gmail", url: "https://mail.google.com/mail/u/1" },
  { id: "github", title: "GitHub", url: "https://github.com" },
  { id: "linkedin", title: "LinkedIn", url: "https://www.linkedin.com/feed" },
];

export const createId = () =>
  globalThis.crypto?.randomUUID?.() ?? `bm-${Date.now().toString(36)}`;

export const normalizeUrl = (input: string) => {
  const trimmed = input.trim();
  if (!trimmed) return "";

  return /^[a-z][\w+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

export const hostnameOf = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

export const faviconUrl = (url: string) => {
  const hostname = hostnameOf(url);
  if (!hostname) return "";

  return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
};

export const titleFor = (title: string, url: string) =>
  title.trim() || hostnameOf(url) || "Untitled";
