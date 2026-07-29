import { useCallback, useEffect, useState } from "react";

import { readCookie, writeCookie } from "@/lib/cookies";
import type { WeatherConfig } from "@/lib/settings";
import { fetchWeather } from "@/lib/weather";

import type { Weather } from "@/types/weather";

const COOKIE_NAME = "atmos_weather";
const CACHE_TTL = 15 * 60 * 1000;

export type WeatherStatus = "unconfigured" | "loading" | "ready" | "error";

interface CacheEntry {
  signature: string;
  weather: Weather;
}

interface Reading {
  signature: string;
  weather: Weather | null;
  error: string | null;
}

const signatureOf = (config: WeatherConfig | null) =>
  config ? `${config.lat}:${config.lon}:${config.units}` : "";

const readCache = (config: WeatherConfig): Weather | null => {
  try {
    const stored = readCookie(COOKIE_NAME);
    if (!stored) return null;

    const cached = JSON.parse(stored) as CacheEntry;
    if (cached.signature !== signatureOf(config)) return null;

    return Date.now() - cached.weather.fetchedAt < CACHE_TTL
      ? cached.weather
      : null;
  } catch {
    return null;
  }
};

const writeCache = (config: WeatherConfig, weather: Weather) => {
  try {
    const entry: CacheEntry = { signature: signatureOf(config), weather };
    writeCookie(COOKIE_NAME, JSON.stringify(entry), CACHE_TTL / 1000);
  } catch {}
};

const initialReading = (config: WeatherConfig | null): Reading => ({
  signature: signatureOf(config),
  weather: config ? readCache(config) : null,
  error: null,
});

export const useWeather = (config: WeatherConfig | null) => {
  const [reading, setReading] = useState<Reading>(() => initialReading(config));

  const signature = signatureOf(config);

  const current =
    reading.signature === signature ? reading : initialReading(config);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!config) return;

      const key = signatureOf(config);

      try {
        const next = await fetchWeather(config, signal);
        if (signal?.aborted) return;

        setReading({ signature: key, weather: next, error: null });
        writeCache(config, next);
      } catch (cause) {
        if (signal?.aborted) return;

        const message =
          cause instanceof Error ? cause.message : "Could not load weather";

        setReading((previous) => ({
          signature: key,
          weather: previous.signature === key ? previous.weather : null,
          error: message,
        }));
      }
    },
    [config],
  );

  useEffect(() => {
    if (!config) return;

    const controller = new AbortController();

    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      if (readCache(config)) return;

      void load(controller.signal);
    };

    refresh();

    const interval = window.setInterval(refresh, CACHE_TTL);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [config, load]);

  const status: WeatherStatus = !config
    ? "unconfigured"
    : current.weather
      ? "ready"
      : current.error
        ? "error"
        : "loading";

  return {
    weather: current.weather,
    error: current.error,
    status,
    refresh: () => void load(),
  };
};
