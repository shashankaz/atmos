import { useEffect, useRef, useState } from "react";
import { IconCheck, IconPencil, IconPlus } from "@tabler/icons-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";

import { BookmarkDialog } from "@/components/bookmark-dialog";
import { DockItem } from "@/components/dock-item";

import { createId, DEFAULT_BOOKMARKS, hostnameOf } from "@/lib/bookmarks";

import { useLocalStorage } from "@/hooks/use-local-storage";

import type { Bookmark } from "@/types/bookmark";

const STORAGE_KEY = "atmos:bookmarks";

type DialogTarget = null | "new" | string;

const controlClasses =
  "text-ink/45 hover:text-ink grid size-9 place-items-center rounded-full ring-1 ring-white/10 backdrop-blur-md";

const tileSize = (viewportHeight: number) =>
  Math.min(56, Math.max(40, viewportHeight * 0.06));

export const Dock = () => {
  const [bookmarks, setBookmarks] = useLocalStorage<Bookmark[]>(
    STORAGE_KEY,
    DEFAULT_BOOKMARKS,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [dialogTarget, setDialogTarget] = useState<DialogTarget>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const dragFrom = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const cursorX = useMotionValue(Number.POSITIVE_INFINITY);
  const magnify = !isEditing && !prefersReducedMotion;

  const [base, setBase] = useState(() => tileSize(window.innerHeight));

  useEffect(() => {
    const onResize = () => setBase(tileSize(window.innerHeight));

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const editing =
    dialogTarget && dialogTarget !== "new"
      ? (bookmarks.find((bookmark) => bookmark.id === dialogTarget) ?? null)
      : null;

  const hovered = bookmarks.find((bookmark) => bookmark.id === hoveredId);

  const save = (values: { title: string; url: string }) => {
    setBookmarks((current) =>
      editing
        ? current.map((bookmark) =>
            bookmark.id === editing.id ? { ...bookmark, ...values } : bookmark,
          )
        : [...current, { id: createId(), ...values }],
    );
    setDialogTarget(null);
  };

  const remove = (id: string) =>
    setBookmarks((current) => current.filter((bookmark) => bookmark.id !== id));

  const reorder = (to: number) => {
    const from = dragFrom.current;
    if (from === null || from === to) return;

    dragFrom.current = to;
    setBookmarks((current) => {
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  return (
    <nav
      aria-label="Bookmarks"
      className="mb-[clamp(1rem,5vh,3.5rem)] flex flex-col items-center gap-[clamp(0.6rem,2vh,1.25rem)]"
      onMouseLeave={() => {
        cursorX.set(Number.POSITIVE_INFINITY);
        setHoveredId(null);
      }}
    >
      <p className="text-ink/70 h-3 font-mono text-[0.58rem] tracking-[0.34em] uppercase">
        <AnimatePresence mode="wait">
          <motion.span
            key={hovered?.id ?? (isEditing ? "editing" : "idle")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="block"
          >
            {hovered ? (
              <>
                {hovered.title}
                <span className="text-ink/30">
                  {" "}
                  · {hostnameOf(hovered.url)}
                </span>
              </>
            ) : isEditing ? (
              <span className="text-ink/40">Drag to reorder</span>
            ) : (
              ""
            )}
          </motion.span>
        </AnimatePresence>
      </p>

      <div className="via-ink/20 h-px w-[min(86vw,44rem)] bg-linear-to-r from-transparent to-transparent" />

      <div className="flex items-end gap-4">
        <ul
          onMouseMove={(event) => {
            if (magnify) cursorX.set(event.clientX);
          }}
          onDragEnd={() => {
            dragFrom.current = null;
          }}
          className="flex items-end gap-2.5 sm:gap-3"
        >
          {bookmarks.map((bookmark, index) => (
            <DockItem
              key={bookmark.id}
              bookmark={bookmark}
              index={index}
              isEditing={isEditing}
              cursorX={cursorX}
              base={base}
              onEdit={() => setDialogTarget(bookmark.id)}
              onRemove={() => remove(bookmark.id)}
              onHover={setHoveredId}
              onDragStart={() => {
                dragFrom.current = index;
              }}
              onDragEnter={() => reorder(index)}
            />
          ))}
        </ul>

        <div className="bg-ink/15 mb-2 h-8 w-px" />

        <div className="mb-1.5 flex items-center gap-2">
          <motion.button
            type="button"
            onClick={() => setDialogTarget("new")}
            title="Add bookmark"
            aria-label="Add bookmark"
            style={{ backgroundColor: "rgb(255 255 255 / 0)" }}
            whileHover={{
              scale: 1.1,
              backgroundColor: "rgb(255 255 255 / 0.12)",
            }}
            whileTap={{ scale: 0.94 }}
            className={controlClasses}
          >
            <IconPlus size={16} stroke={1.4} />
          </motion.button>

          <motion.button
            type="button"
            onClick={() => {
              setIsEditing((value) => !value);
              cursorX.set(Number.POSITIVE_INFINITY);
            }}
            aria-pressed={isEditing}
            title={isEditing ? "Done" : "Edit bookmarks"}
            aria-label={isEditing ? "Done editing" : "Edit bookmarks"}
            animate={{
              backgroundColor: isEditing
                ? "rgb(255 255 255 / 0.15)"
                : "rgb(255 255 255 / 0)",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.94 }}
            className={controlClasses}
          >
            {isEditing ? (
              <IconCheck size={16} stroke={1.6} />
            ) : (
              <IconPencil size={15} stroke={1.4} />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {dialogTarget && (
          <BookmarkDialog
            key={dialogTarget}
            bookmark={editing}
            onSave={save}
            onClose={() => setDialogTarget(null)}
          />
        )}
      </AnimatePresence>
    </nav>
  );
};
