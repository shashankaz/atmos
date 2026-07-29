import { z } from "zod";

import type { WeatherConfig, WeatherUnits } from "@/lib/env";

import type { Weather } from "@/types/weather";

const ENDPOINT = "https://api.openweathermap.org/data/2.5/weather";

const responseSchema = z.object({
  weather: z
    .array(z.object({ id: z.number(), description: z.string() }))
    .min(1),
  main: z.object({
    temp: z.number(),
    feels_like: z.number(),
    temp_min: z.number(),
    temp_max: z.number(),
    humidity: z.number(),
  }),
  wind: z.object({ speed: z.number(), deg: z.number().default(0) }),
  sys: z.object({
    country: z.string().optional(),
    sunrise: z.number(),
    sunset: z.number(),
  }),
  name: z.string(),
});

export const temperatureUnit = (units: WeatherUnits) =>
  units === "imperial" ? "°F" : units === "standard" ? "K" : "°C";

export const windUnit = (units: WeatherUnits) =>
  units === "imperial" ? "mph" : "m/s";

export const compassPoint = (degrees: number) => {
  const points = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return points[Math.round(degrees / 22.5) % 16];
};

export const fetchWeather = async (
  config: WeatherConfig,
  signal?: AbortSignal,
): Promise<Weather> => {
  const url = new URL(ENDPOINT);
  url.searchParams.set("lat", String(config.lat));
  url.searchParams.set("lon", String(config.lon));
  url.searchParams.set("units", config.units);
  url.searchParams.set("appid", config.apiKey);

  const response = await fetch(url, { signal });
  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const reason = z.object({ message: z.string() }).safeParse(body)
      .data?.message;

    throw new Error(reason ?? `OpenWeatherMap returned ${response.status}`);
  }

  const parsed = responseSchema.safeParse(body);
  if (!parsed.success)
    throw new Error("Unexpected response from OpenWeatherMap");

  const data = parsed.data;
  const condition = data.weather[0];

  return {
    conditionId: condition.id,
    description: condition.description,
    city: data.name,
    country: data.sys.country ?? "",
    temp: data.main.temp,
    feelsLike: data.main.feels_like,
    tempMin: data.main.temp_min,
    tempMax: data.main.temp_max,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    windDeg: data.wind.deg,
    sunrise: data.sys.sunrise * 1000,
    sunset: data.sys.sunset * 1000,
    fetchedAt: Date.now(),
  };
};
