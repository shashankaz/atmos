import { IconSunrise, IconSunset } from "@tabler/icons-react";

import { weatherConfig } from "@/lib/env";

import type { Weather } from "@/types/weather";

const clockTime = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
});

const coordinate = (value: number, positive: string, negative: string) =>
  `${Math.abs(value).toFixed(2)}°${value >= 0 ? positive : negative}`;

const Item = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <span className="flex items-center gap-1.5">
    <span className="text-accent/70">{icon}</span>
    {children}
  </span>
);

export const StatusRail = ({ weather }: { weather: Weather | null }) => (
  <header className="text-ink/55 flex items-start justify-between gap-6 font-mono text-[0.58rem] tracking-[0.28em] uppercase sm:text-[0.62rem]">
    <div className="flex flex-col gap-1.5">
      <span className="text-ink tracking-[0.5em]">Atmos</span>
      {weatherConfig && (
        <span className="text-ink/40 tracking-[0.2em]">
          {coordinate(weatherConfig.lat, "N", "S")}{" "}
          {coordinate(weatherConfig.lon, "E", "W")}
        </span>
      )}
    </div>

    <div className="flex flex-col items-end gap-1.5">
      {weather && (
        <>
          <span className="text-ink tracking-[0.3em]">
            {weather.city}
            {weather.country && `, ${weather.country}`}
          </span>
          <span className="text-ink/40 flex items-center gap-4 tabular-nums">
            <Item icon={<IconSunrise size={13} stroke={1.2} />}>
              {clockTime.format(weather.sunrise)}
            </Item>
            <Item icon={<IconSunset size={13} stroke={1.2} />}>
              {clockTime.format(weather.sunset)}
            </Item>
          </span>
        </>
      )}
    </div>
  </header>
);
