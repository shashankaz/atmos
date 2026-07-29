import {
  IconCloud,
  IconCloudFog,
  IconCloudRain,
  IconCloudSnow,
  IconCloudStorm,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";

import { moodFor } from "@/lib/sky";
import type { SkyPhase } from "@/lib/sky";

interface WeatherGlyphProps {
  conditionId: number;
  phase: SkyPhase;
  className?: string;
  stroke?: number;
}

export const WeatherGlyph = ({
  conditionId,
  phase,
  className,
  stroke = 1,
}: WeatherGlyphProps) => {
  const mood = moodFor(conditionId);

  let Icon;

  switch (mood) {
    case "storm":
      Icon = IconCloudStorm;
      break;
    case "rain":
      Icon = IconCloudRain;
      break;
    case "snow":
      Icon = IconCloudSnow;
      break;
    case "fog":
      Icon = IconCloudFog;
      break;
    case "clouds":
      Icon = IconCloud;
      break;
    default:
      Icon = phase === "night" ? IconMoon : IconSun;
  }

  return <Icon className={className} stroke={stroke} aria-hidden="true" />;
};
