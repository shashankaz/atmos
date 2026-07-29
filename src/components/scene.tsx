import { AnimatePresence, motion } from "framer-motion";

import { AmbientCanvas } from "@/components/ambient-canvas";

import type { Sky } from "@/lib/sky";

export const Scene = ({
  sky,
  backgroundImage,
}: {
  sky: Sky;
  backgroundImage: string;
}) => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
  >
    <AnimatePresence initial={false}>
      <motion.div
        key={sky.gradient}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        style={{ backgroundImage: sky.gradient }}
        className="absolute inset-0"
      />
    </AnimatePresence>

    {backgroundImage && (
      <img
        src={backgroundImage}
        alt=""
        className="absolute inset-0 size-full scale-110 object-cover blur-xs"
      />
    )}

    <motion.div
      animate={{ backgroundColor: sky.wash }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      className="absolute inset-0"
    />

    <AmbientCanvas
      mode={sky.mode}
      particle={sky.particle}
      intensity={sky.intensity}
    />

    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/30 to-transparent" />

    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,transparent_32%,rgba(2,4,12,0.42)_100%)]" />

    <div className="bg-grain absolute inset-0 opacity-[0.16] mix-blend-overlay" />
  </div>
);
