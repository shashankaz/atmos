export const readCookie = (name: string): string | null => {
  const prefix = `${encodeURIComponent(name)}=`;

  const entry = document.cookie
    .split("; ")
    .find((item) => item.startsWith(prefix));

  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
};

export const writeCookie = (name: string, value: string, maxAge: number) => {
  document.cookie =
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}` +
    `; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
};
