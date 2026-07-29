import { motion } from "framer-motion";

import { Clock } from "@/components/clock";
import { Dock } from "@/components/dock";
import { Scene } from "@/components/scene";
import { StatusRail } from "@/components/status-rail";
import { WeatherReadout } from "@/components/weather-readout";

import { skyFor } from "@/lib/sky";

import { useNow } from "@/hooks/use-now";
import { useWeather } from "@/hooks/use-weather";

export const App = () => {
  const now = useNow();
  const { weather, status, error, refresh } = useWeather();

  const sky = skyFor(now, weather);

  return (
    <div
      style={
        {
          "--sky-ink": sky.ink,
          "--sky-accent": sky.accent,
        } as React.CSSProperties
      }
    >
      <Scene sky={sky} />

      <main className="text-ink relative grid h-dvh grid-rows-[auto_1fr_auto] gap-[clamp(0.75rem,3vh,2rem)] overflow-hidden px-6 py-[clamp(1rem,3vh,2.25rem)] sm:px-10">
        <StatusRail weather={weather} />

        <motion.div
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex min-h-0 flex-col items-center justify-center gap-[clamp(1.25rem,5vh,3rem)]"
        >
          <Clock />
          <WeatherReadout
            weather={weather}
            status={status}
            error={error}
            phase={sky.phase}
            onRefresh={refresh}
          />
        </motion.div>

        <Dock />
      </main>
    </div>
  );
};
