import { z } from "zod";

const STORAGE_KEY = "atmos:settings";

export const UNITS = ["metric", "imperial", "standard"] as const;

export type WeatherUnits = (typeof UNITS)[number];

export interface Settings {
  apiKey: string;
  lat: number | null;
  lon: number | null;
  units: WeatherUnits;
  backgroundImage: string;
}

export interface WeatherConfig {
  apiKey: string;
  lat: number;
  lon: number;
  units: WeatherUnits;
}

export const DEFAULT_SETTINGS: Settings = {
  apiKey: "",
  lat: null,
  lon: null,
  units: "metric",
  backgroundImage: "",
};

const UNSAFE_SCHEME = /^\s*(javascript|vbscript|file):/i;

const storedSchema = z.object({
  apiKey: z.string().trim().catch(""),
  lat: z.number().min(-90).max(90).nullable().catch(null),
  lon: z.number().min(-180).max(180).nullable().catch(null),
  units: z.enum(UNITS).catch("metric"),
  backgroundImage: z
    .string()
    .trim()
    .refine((value) => !UNSAFE_SCHEME.test(value))
    .catch(""),
});

const read = (): Settings => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_SETTINGS;

    const parsed = storedSchema.safeParse(JSON.parse(stored));
    return parsed.success ? parsed.data : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const listeners = new Set<() => void>();
let snapshot = read();

const emit = () => {
  for (const listener of listeners) listener();
};

export const getSettings = () => snapshot;

export const subscribeToSettings = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const saveSettings = (next: Settings) => {
  snapshot = next;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {}

  emit();
};

window.addEventListener("storage", (event) => {
  if (event.key !== null && event.key !== STORAGE_KEY) return;

  snapshot = read();
  emit();
});

export const weatherConfigFrom = (settings: Settings): WeatherConfig | null =>
  settings.apiKey && settings.lat !== null && settings.lon !== null
    ? {
        apiKey: settings.apiKey,
        lat: settings.lat,
        lon: settings.lon,
        units: settings.units,
      }
    : null;

export interface SettingsDraft {
  apiKey: string;
  lat: string;
  lon: string;
  units: WeatherUnits;
  backgroundImage: string;
}

export type SettingsErrors = Partial<Record<keyof SettingsDraft, string>>;

export const toDraft = (settings: Settings): SettingsDraft => ({
  apiKey: settings.apiKey,
  lat: settings.lat === null ? "" : String(settings.lat),
  lon: settings.lon === null ? "" : String(settings.lon),
  units: settings.units,
  backgroundImage: settings.backgroundImage,
});

const coordinateSchema = (limit: number) =>
  z.coerce
    .number({ error: "Must be a number" })
    .min(-limit, { error: `Must be between −${limit} and ${limit}` })
    .max(limit, { error: `Must be between −${limit} and ${limit}` });

const parseCoordinate = (
  value: string,
  limit: number,
): { value: number | null; error?: string } => {
  const trimmed = value.trim();
  if (!trimmed) return { value: null };

  const parsed = coordinateSchema(limit).safeParse(trimmed);

  return parsed.success
    ? { value: parsed.data }
    : { value: null, error: parsed.error.issues[0].message };
};

type DraftResult =
  | { settings: Settings; errors: null }
  | { settings: null; errors: SettingsErrors };

export const parseDraft = (draft: SettingsDraft): DraftResult => {
  const errors: SettingsErrors = {};

  const apiKey = draft.apiKey.trim();
  const lat = parseCoordinate(draft.lat, 90);
  const lon = parseCoordinate(draft.lon, 180);
  const backgroundImage = draft.backgroundImage.trim();

  if (lat.error) errors.lat = lat.error;
  if (lon.error) errors.lon = lon.error;

  const started =
    Boolean(apiKey) || draft.lat.trim() !== "" || draft.lon.trim() !== "";

  if (started) {
    if (!apiKey) errors.apiKey = "Required to fetch weather";
    if (!lat.error && lat.value === null)
      errors.lat = "Required to fetch weather";
    if (!lon.error && lon.value === null)
      errors.lon = "Required to fetch weather";
  }

  if (UNSAFE_SCHEME.test(backgroundImage))
    errors.backgroundImage = "Use an image URL or a path under /";

  if (Object.keys(errors).length > 0) return { settings: null, errors };

  return {
    settings: {
      apiKey,
      lat: lat.value,
      lon: lon.value,
      units: draft.units,
      backgroundImage,
    },
    errors: null,
  };
};
