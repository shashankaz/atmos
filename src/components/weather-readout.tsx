import { Fragment } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { motion } from "framer-motion";

import { WeatherGlyph } from "@/components/weather-glyph";

import { weatherConfig, weatherConfigIssues } from "@/lib/env";
import type { SkyPhase } from "@/lib/sky";
import { compassPoint, temperatureUnit, windUnit } from "@/lib/weather";

import type { WeatherStatus } from "@/hooks/use-weather";

import type { Weather } from "@/types/weather";

interface WeatherReadoutProps {
  weather: Weather | null;
  status: WeatherStatus;
  error: string | null;
  phase: SkyPhase;
  onRefresh: () => void;
}

const units = weatherConfig?.units ?? "metric";
const round = (value: number) => Math.round(value).toString();

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline gap-2">
    <dt className="text-ink/40 text-[0.62rem] tracking-[0.26em] uppercase">
      {label}
    </dt>
    <dd className="text-ink/85 text-[0.78rem] tabular-nums">{value}</dd>
  </div>
);

const Divider = () => (
  <span aria-hidden="true" className="bg-ink/15 h-3.5 w-px shrink-0" />
);

const Notice = ({ children }: { children: React.ReactNode }) => (
  <p className="text-ink/55 flex max-w-md items-start gap-3 text-center font-mono text-[0.68rem] leading-relaxed tracking-[0.16em] uppercase">
    <IconAlertTriangle size={16} stroke={1.2} className="mt-px shrink-0" />
    <span className="text-left">{children}</span>
  </p>
);

export const WeatherReadout = ({
  weather,
  status,
  error,
  phase,
  onRefresh,
}: WeatherReadoutProps) => {
  if (status === "unconfigured") {
    return (
      <Notice>
        Weather is off — set VITE_OPENWEATHER_API_KEY, VITE_WEATHER_LAT and
        VITE_WEATHER_LON in .env, then restart the dev server.
        {weatherConfigIssues.length > 0 && (
          <span className="text-ink/35 mt-2 block normal-case">
            {weatherConfigIssues.join(" · ")}
          </span>
        )}
      </Notice>
    );
  }

  if (status === "loading") {
    return (
      <motion.p
        animate={{ opacity: [1, 0.35, 1] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        className="text-ink/40 font-mono text-[0.65rem] tracking-[0.42em] uppercase"
      >
        Reading the sky
      </motion.p>
    );
  }

  if (status === "error" || !weather) {
    return (
      <div className="flex flex-col items-center gap-3">
        <Notice>{error ?? "Weather unavailable"}</Notice>
        <motion.button
          type="button"
          onClick={onRefresh}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className="text-accent/80 hover:text-accent font-mono text-[0.6rem] tracking-[0.3em] uppercase"
        >
          Retry
        </motion.button>
      </div>
    );
  }

  const degrees = temperatureUnit(units);

  const metrics = [
    { label: "Feels", value: `${round(weather.feelsLike)}${degrees}` },
    { label: "Humidity", value: `${weather.humidity}%` },
    {
      label: "Wind",
      value: `${weather.windSpeed.toFixed(1)} ${windUnit(units)} ${compassPoint(weather.windDeg)}`,
    },
    {
      label: "Range",
      value: `${round(weather.tempMin)}° / ${round(weather.tempMax)}°`,
    },
  ];

  return (
    <div className="flex flex-col items-center gap-[clamp(0.6rem,1.8vh,1.1rem)]">
      <div className="flex items-center gap-[clamp(0.65rem,1.6vw,1rem)]">
        <WeatherGlyph
          conditionId={weather.conditionId}
          phase={phase}
          stroke={1}
          className="text-accent size-[clamp(1.7rem,4.2vh,2.5rem)] shrink-0"
        />

        <p className="text-ink font-display flex items-start text-[clamp(2.15rem,5.6vh,3.75rem)] leading-none">
          {round(weather.temp)}
          <span className="text-accent ml-[0.06em] text-[0.42em]">
            {degrees}
          </span>
        </p>

        <Divider />

        <p className="text-ink/65 font-mono text-[0.68rem] tracking-[0.26em] uppercase">
          {weather.description}
        </p>
      </div>

      <dl className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono sm:gap-x-4">
        {metrics.map((metric, index) => (
          <Fragment key={metric.label}>
            {index > 0 && <Divider />}
            <Metric {...metric} />
          </Fragment>
        ))}
      </dl>
    </div>
  );
};
