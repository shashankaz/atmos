import { useCallback, useEffect, useState } from "react";

import { readCookie, writeCookie } from "@/lib/cookies";
import { weatherConfig } from "@/lib/env";
import { fetchWeather } from "@/lib/weather";

import type { Weather } from "@/types/weather";

const COOKIE_NAME = "atmos_weather";
const CACHE_TTL = 15 * 60 * 1000;

export type WeatherStatus = "unconfigured" | "loading" | "ready" | "error";

const readCache = (): Weather | null => {
  try {
    const stored = readCookie(COOKIE_NAME);
    if (!stored) return null;

    const cached = JSON.parse(stored) as Weather;
    return Date.now() - cached.fetchedAt < CACHE_TTL ? cached : null;
  } catch {
    return null;
  }
};

const writeCache = (weather: Weather) => {
  try {
    writeCookie(COOKIE_NAME, JSON.stringify(weather), CACHE_TTL / 1000);
  } catch {}
};

export const useWeather = () => {
  const [weather, setWeather] = useState<Weather | null>(() =>
    weatherConfig ? readCache() : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!weatherConfig) return;

    setIsLoading(true);

    try {
      const next = await fetchWeather(weatherConfig, signal);
      if (signal?.aborted) return;

      setWeather(next);
      setError(null);
      writeCache(next);
    } catch (cause) {
      if (signal?.aborted) return;
      setError(
        cause instanceof Error ? cause.message : "Could not load weather",
      );
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!weatherConfig) return;

    const controller = new AbortController();
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      if (readCache()) return;
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
  }, [load]);

  const status: WeatherStatus = !weatherConfig
    ? "unconfigured"
    : weather
      ? "ready"
      : error
        ? "error"
        : "loading";

  return {
    weather,
    error,
    status,
    isRefreshing: isLoading,
    refresh: () => void load(),
  };
};
