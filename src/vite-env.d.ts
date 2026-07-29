interface ImportMetaEnv {
  readonly VITE_OPENWEATHER_API_KEY?: string;
  readonly VITE_WEATHER_LAT?: string;
  readonly VITE_WEATHER_LON?: string;
  readonly VITE_WEATHER_UNITS?: "metric" | "imperial" | "standard";
  readonly VITE_BACKGROUND_IMAGE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
