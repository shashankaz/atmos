import type { Weather } from "@/types/weather";

export type SkyPhase = "dawn" | "day" | "dusk" | "night";
export type SkyMood = "clear" | "clouds" | "rain" | "storm" | "snow" | "fog";
export type AmbientMode =
  "stars" | "dust" | "rain" | "storm" | "snow" | "fog" | "clouds";

export interface Sky {
  phase: SkyPhase;
  mood: SkyMood;
  gradient: string;
  wash: string;
  accent: string;
  ink: string;
  particle: string;
  mode: AmbientMode;
  intensity: number;
}

const TWILIGHT = 50 * 60 * 1000;

const PHASE_GRADIENT: Record<SkyPhase, string> = {
  dawn: "linear-gradient(180deg,#04130d 0%,#0b2c1d 36%,#2c6640 70%,#9ec06a 100%)",
  day: "linear-gradient(180deg,#031a13 0%,#07402c 38%,#188055 72%,#8fd9ae 100%)",
  dusk: "linear-gradient(180deg,#020e0a 0%,#0a2a1c 38%,#2b6039 72%,#b0b45e 100%)",
  night:
    "linear-gradient(180deg,#010704 0%,#03150e 44%,#082c1e 78%,#0f4530 100%)",
};

const PHASE_ACCENT: Record<SkyPhase, string> = {
  dawn: "#a9f0a2",
  day: "#b9ffdb",
  dusk: "#8ef0ab",
  night: "#4ade80",
};

const MOOD_WASH: Record<SkyMood, [number, number, number, number]> = {
  clear: [0, 0, 0, 0],
  clouds: [96, 140, 116, 0.3],
  rain: [14, 46, 34, 0.46],
  storm: [3, 12, 8, 0.58],
  snow: [190, 228, 206, 0.3],
  fog: [126, 152, 138, 0.42],
};

const WASH_STRENGTH: Record<SkyPhase, number> = {
  dawn: 0.8,
  day: 1,
  dusk: 0.8,
  night: 0.45,
};

const washFor = (mood: SkyMood, phase: SkyPhase) => {
  const [r, g, b, alpha] = MOOD_WASH[mood];
  return `rgba(${r},${g},${b},${(alpha * WASH_STRENGTH[phase]).toFixed(3)})`;
};

const MOOD_PARTICLE: Record<SkyMood, string> = {
  clear: "198,255,214",
  clouds: "186,224,200",
  rain: "156,230,190",
  storm: "142,244,182",
  snow: "236,255,244",
  fog: "196,224,206",
};

export const moodFor = (conditionId: number): SkyMood => {
  const group = Math.floor(conditionId / 100);

  if (group === 2) return "storm";
  if (group === 3 || group === 5) return "rain";
  if (group === 6) return "snow";
  if (group === 7) return "fog";
  return conditionId <= 801 ? "clear" : "clouds";
};

export const phaseFor = (now: Date, weather: Weather | null): SkyPhase => {
  const time = now.getTime();

  if (weather) {
    if (Math.abs(time - weather.sunrise) <= TWILIGHT) return "dawn";
    if (Math.abs(time - weather.sunset) <= TWILIGHT) return "dusk";
    return time > weather.sunrise && time < weather.sunset ? "day" : "night";
  }

  const hour = now.getHours();
  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 18) return "day";
  if (hour >= 18 && hour < 20) return "dusk";
  return "night";
};

const modeFor = (mood: SkyMood, phase: SkyPhase): AmbientMode => {
  if (mood === "clear") return phase === "night" ? "stars" : "dust";
  return mood;
};

const intensityFor = (mood: SkyMood, conditionId: number) => {
  if (mood === "clear") return 0.35;
  if (mood === "fog" || mood === "clouds") return 0.5;

  const severity = conditionId % 100;
  return Math.min(1, 0.45 + severity / 40);
};

export const skyFor = (now: Date, weather: Weather | null): Sky => {
  const mood = weather ? moodFor(weather.conditionId) : "clear";
  const phase = phaseFor(now, weather);

  return {
    phase,
    mood,
    gradient: PHASE_GRADIENT[phase],
    wash: washFor(mood, phase),
    accent: PHASE_ACCENT[phase],
    ink: phase === "day" ? "#f4fff8" : "#edf6ef",
    particle: MOOD_PARTICLE[mood],
    mode: modeFor(mood, phase),
    intensity: weather ? intensityFor(mood, weather.conditionId) : 0.35,
  };
};
