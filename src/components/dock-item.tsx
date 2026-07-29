import { useEffect, useRef, useState } from "react";
import { IconX } from "@tabler/icons-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";

import { faviconUrl, hostnameOf } from "@/lib/bookmarks";

import type { Bookmark } from "@/types/bookmark";

interface DockItemProps {
  bookmark: Bookmark;
  index: number;
  isEditing: boolean;
  cursorX: MotionValue<number>;
  base: number;
  onEdit: () => void;
  onRemove: () => void;
  onHover: (id: string | null) => void;
  onDragStart: () => void;
  onDragEnter: () => void;
}

const FALLOFF = 80;
const MAX_SCALE = 1.4;

const SPRING = { mass: 0.1, stiffness: 400, damping: 12 };

const glass = {
  rest: { opacity: 0.08 },
  hover: { opacity: 0.2 },
};

export const DockItem = ({
  bookmark,
  index,
  isEditing,
  cursorX,
  base,
  onEdit,
  onRemove,
  onHover,
  onDragStart,
  onDragEnter,
}: DockItemProps) => {
  const [hasIcon, setHasIcon] = useState(true);
  const ref = useRef<HTMLLIElement>(null);

  const icon = faviconUrl(bookmark.url);

  const baseSize = useMotionValue(base);

  useEffect(() => {
    baseSize.set(base);
  }, [base, baseSize]);

  const distance = useTransform(cursorX, (x) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Number.POSITIVE_INFINITY;

    return x - (bounds.left + bounds.width / 2);
  });

  const target = useTransform([distance, baseSize], ([gap, size]: number[]) =>
    Number.isFinite(gap)
      ? size * (1 + (MAX_SCALE - 1) * Math.exp(-((gap / FALLOFF) ** 2)))
      : size,
  );

  const size = useSpring(target, SPRING);

  const tile = (
    <>
      <motion.span
        variants={glass}
        className="absolute inset-0 rounded-[1.15rem] bg-white"
      />
      <span className="absolute inset-0 rounded-[1.15rem] ring-1 ring-white/15" />
      {icon && hasIcon ? (
        <img
          src={icon}
          alt=""
          width={28}
          height={28}
          loading="lazy"
          onError={() => setHasIcon(false)}
          className="relative size-6 drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
        />
      ) : (
        <span className="text-ink font-display relative text-xl leading-none">
          {bookmark.title.charAt(0).toUpperCase()}
        </span>
      )}
    </>
  );

  const tileClasses =
    "relative grid size-full place-items-center rounded-[1.15rem] backdrop-blur-md";

  return (
    <motion.li
      ref={ref}
      data-dock-item
      style={{ width: size }}
      className="relative flex shrink-0 justify-center"
      initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.9,
        delay: 0.3 + index * 0.055,
        ease: [0.16, 1, 0.3, 1],
      }}
      draggable={isEditing}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onMouseEnter={() => onHover(bookmark.id)}
      onMouseLeave={() => onHover(null)}
    >
      {isEditing && (
        <motion.button
          type="button"
          onClick={onRemove}
          title={`Remove ${bookmark.title}`}
          aria-label={`Remove ${bookmark.title}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.15, backgroundColor: "rgb(239 68 68 / 0.9)" }}
          whileTap={{ scale: 0.9 }}
          style={{ backgroundColor: "rgb(0 0 0 / 0.7)" }}
          className="text-ink absolute -top-1 -right-1 z-10 grid size-5 place-items-center rounded-full ring-1 ring-white/25"
        >
          <IconX size={11} stroke={2.2} />
        </motion.button>
      )}

      <motion.div
        style={{ width: size, height: size }}
        animate={{ rotate: isEditing ? [-1.4, 1.4, -1.4] : 0 }}
        transition={{
          duration: 0.4,
          repeat: isEditing ? Infinity : 0,
          ease: "easeInOut",
        }}
      >
        {isEditing ? (
          <motion.button
            type="button"
            onClick={onEdit}
            title={`Edit ${bookmark.title}`}
            initial="rest"
            animate="rest"
            whileHover="hover"
            className={`${tileClasses} cursor-grab active:cursor-grabbing`}
          >
            {tile}
          </motion.button>
        ) : (
          <motion.a
            href={bookmark.url}
            title={hostnameOf(bookmark.url) || bookmark.url}
            initial="rest"
            animate="rest"
            whileHover="hover"
            className={tileClasses}
          >
            {tile}
          </motion.a>
        )}
      </motion.div>
    </motion.li>
  );
};
