import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

import type { AmbientMode } from "@/lib/sky";

interface AmbientCanvasProps {
  mode: AmbientMode;
  particle: string;
  intensity: number;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  alpha: number;
  phase: number;
}

const COUNTS: Record<AmbientMode, number> = {
  stars: 170,
  dust: 46,
  rain: 150,
  storm: 200,
  snow: 90,
  fog: 7,
  clouds: 7,
};

const random = (min: number, max: number) => min + Math.random() * (max - min);

const seed = (
  mode: AmbientMode,
  width: number,
  height: number,
  intensity: number,
): Particle[] =>
  Array.from({ length: Math.round(COUNTS[mode] * (0.6 + intensity)) }, () => {
    const base = {
      x: random(0, width),
      y: random(0, height),
      phase: random(0, Math.PI * 2),
    };

    switch (mode) {
      case "rain":
      case "storm":
        return {
          ...base,
          size: random(10, 26) * (0.7 + intensity),
          speed: random(9, 16) * (0.7 + intensity),
          drift: random(1.4, 2.4),
          alpha: random(0.18, 0.5),
        };
      case "snow":
        return {
          ...base,
          size: random(1, 3),
          speed: random(0.5, 1.5),
          drift: random(0.3, 0.9),
          alpha: random(0.4, 0.95),
        };
      case "stars":
        return {
          ...base,
          size: random(0.4, 1.4),
          speed: random(0.4, 1.6),
          drift: 0,
          alpha: random(0.25, 0.9),
        };
      case "dust":
        return {
          ...base,
          size: random(0.8, 2.4),
          speed: random(0.06, 0.2),
          drift: random(-0.14, 0.14),
          alpha: random(0.12, 0.4),
        };
      default:
        return {
          ...base,
          y: random(height * 0.05, height * 0.7),
          size: random(height * 0.16, height * 0.38),
          speed: random(0.05, 0.22),
          drift: 0,
          alpha: random(0.05, 0.13),
        };
    }
  });

export const AmbientCanvas = ({
  mode,
  particle,
  intensity,
}: AmbientCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let animation = 0;
    let flash = 0;
    let meteor: { x: number; y: number; life: number } | null = null;

    const rgba = (alpha: number) => `rgba(${particle},${alpha})`;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;

      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      particles = seed(mode, width, height, intensity);
    };

    const drawSoftBlob = (item: Particle) => {
      const gradient = context.createRadialGradient(
        item.x,
        item.y,
        0,
        item.x,
        item.y,
        item.size,
      );
      gradient.addColorStop(0, rgba(item.alpha));
      gradient.addColorStop(1, rgba(0));

      context.fillStyle = gradient;
      context.beginPath();
      context.arc(item.x, item.y, item.size, 0, Math.PI * 2);
      context.fill();
    };

    const step = (item: Particle, moving: boolean) => {
      if (!moving) return;

      switch (mode) {
        case "rain":
        case "storm":
          item.y += item.speed;
          item.x += item.speed / item.drift / 3;
          if (item.y > height) {
            item.y = -item.size;
            item.x = random(-width * 0.1, width);
          }
          break;
        case "snow":
          item.y += item.speed;
          item.x += Math.sin(frame / 60 + item.phase) * item.drift;
          if (item.y > height) {
            item.y = -item.size;
            item.x = random(0, width);
          }
          break;
        case "dust":
          item.y -= item.speed;
          item.x += Math.sin(frame / 180 + item.phase) * 0.3 + item.drift;
          if (item.y < -item.size) item.y = height + item.size;
          break;
        case "stars":
          break;
        default:
          item.x += item.speed;
          if (item.x - item.size > width) item.x = -item.size;
      }
    };

    const paint = (item: Particle) => {
      switch (mode) {
        case "rain":
        case "storm": {
          context.strokeStyle = rgba(item.alpha + flash * 0.4);
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(item.x, item.y);
          context.lineTo(
            item.x - item.size / item.drift / 4,
            item.y + item.size,
          );
          context.stroke();
          break;
        }

        case "snow":
          context.fillStyle = rgba(item.alpha);
          context.beginPath();
          context.arc(item.x, item.y, item.size, 0, Math.PI * 2);
          context.fill();
          break;

        case "stars": {
          const twinkle =
            0.45 + 0.55 * Math.abs(Math.sin(frame / 90 + item.phase));
          context.fillStyle = rgba(item.alpha * twinkle);
          context.beginPath();
          context.arc(item.x, item.y, item.size, 0, Math.PI * 2);
          context.fill();
          break;
        }

        case "dust":
          drawSoftBlob({ ...item, size: item.size * 4 });
          break;

        default:
          drawSoftBlob(item);
      }
    };

    const paintMeteor = () => {
      if (!meteor) {
        if (Math.random() < 0.0008) {
          meteor = {
            x: random(width * 0.1, width * 0.9),
            y: random(0, height * 0.4),
            life: 1,
          };
        }
        return;
      }

      const length = 120 * meteor.life;
      context.strokeStyle = rgba(meteor.life * 0.9);
      context.lineWidth = 1.4;
      context.beginPath();
      context.moveTo(meteor.x, meteor.y);
      context.lineTo(meteor.x - length, meteor.y + length * 0.55);
      context.stroke();

      meteor.x += 7;
      meteor.y += 3.85;
      meteor.life -= 0.018;

      if (meteor.life <= 0) meteor = null;
    };

    const render = (moving: boolean) => {
      context.clearRect(0, 0, width, height);

      if (mode === "storm") {
        if (flash > 0) flash = Math.max(0, flash - 0.045);
        else if (Math.random() < 0.0016)
          flash = Math.random() < 0.4 ? 0.5 : 0.85;

        if (flash > 0) {
          context.fillStyle = `rgba(226,238,255,${flash * 0.22})`;
          context.fillRect(0, 0, width, height);
        }
      }

      for (const item of particles) {
        step(item, moving);
        paint(item);
      }

      if (mode === "stars" && moving) paintMeteor();
    };

    const loop = () => {
      frame += 1;
      render(true);
      animation = window.requestAnimationFrame(loop);
    };

    resize();

    if (prefersReducedMotion) {
      render(false);
    } else {
      animation = window.requestAnimationFrame(loop);
    }

    const observer = new ResizeObserver(() => {
      resize();
      render(false);
    });
    observer.observe(canvas);

    return () => {
      window.cancelAnimationFrame(animation);
      observer.disconnect();
    };
  }, [mode, particle, intensity, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
};
