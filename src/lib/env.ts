import { z } from "zod";

const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const field = <T extends z.ZodType>(schema: T) =>
  z.preprocess(blankToUndefined, schema);

const weatherEnvSchema = z.object({
  VITE_OPENWEATHER_API_KEY: field(z.string().trim().min(1)),
  VITE_WEATHER_LAT: field(z.coerce.number().min(-90).max(90)),
  VITE_WEATHER_LON: field(z.coerce.number().min(-180).max(180)),
  VITE_WEATHER_UNITS: field(
    z.enum(["metric", "imperial", "standard"]).default("metric"),
  ),
});

const appEnvSchema = z.object({
  VITE_BACKGROUND_IMAGE: field(z.string().trim().optional()),
});

const weatherEnv = weatherEnvSchema.safeParse(import.meta.env);
const appEnv = appEnvSchema.safeParse(import.meta.env);

export type WeatherUnits = z.infer<
  typeof weatherEnvSchema
>["VITE_WEATHER_UNITS"];

export interface WeatherConfig {
  apiKey: string;
  lat: number;
  lon: number;
  units: WeatherUnits;
}

export const weatherConfig: WeatherConfig | null = weatherEnv.success
  ? {
      apiKey: weatherEnv.data.VITE_OPENWEATHER_API_KEY,
      lat: weatherEnv.data.VITE_WEATHER_LAT,
      lon: weatherEnv.data.VITE_WEATHER_LON,
      units: weatherEnv.data.VITE_WEATHER_UNITS,
    }
  : null;

export const weatherConfigIssues = weatherEnv.success
  ? []
  : weatherEnv.error.issues.map(
      (issue) => `${String(issue.path[0] ?? "env")} — ${issue.message}`,
    );

export const backgroundImage = appEnv.success
  ? (appEnv.data.VITE_BACKGROUND_IMAGE ?? "")
  : "";
