import { useMemo, useSyncExternalStore } from "react";

import {
  getSettings,
  subscribeToSettings,
  weatherConfigFrom,
} from "@/lib/settings";

export const useSettings = () =>
  useSyncExternalStore(subscribeToSettings, getSettings, getSettings);

export const useWeatherConfig = () => {
  const settings = useSettings();

  return useMemo(() => weatherConfigFrom(settings), [settings]);
};
