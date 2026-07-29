import { IconSettings } from "@tabler/icons-react";
import { motion } from "framer-motion";

export const SettingsButton = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    type="button"
    onClick={onClick}
    aria-label="Settings"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
    whileHover="hover"
    whileTap={{ scale: 0.96 }}
    className="text-ink/40 hover:text-ink fixed right-6 bottom-[clamp(1rem,3vh,2.25rem)] z-40 flex items-center gap-3 sm:right-10"
  >
    <motion.span
      variants={{ hover: { opacity: 1, x: 0 } }}
      initial={{ opacity: 0, x: 6 }}
      className="font-mono text-[0.55rem] tracking-[0.34em] uppercase"
    >
      Settings
    </motion.span>

    <motion.span
      variants={{
        hover: { rotate: 45, backgroundColor: "rgb(255 255 255 / 0.12)" },
      }}
      style={{ backgroundColor: "rgb(255 255 255 / 0)" }}
      className="grid size-9 place-items-center rounded-full ring-1 ring-white/10 backdrop-blur-md"
    >
      <IconSettings size={16} stroke={1.4} />
    </motion.span>
  </motion.button>
);
