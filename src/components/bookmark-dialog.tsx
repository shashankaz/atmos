import { useEffect, useState } from "react";
import { IconWorld } from "@tabler/icons-react";
import { motion } from "framer-motion";

import { faviconUrl, normalizeUrl, titleFor } from "@/lib/bookmarks";

import type { Bookmark } from "@/types/bookmark";

interface BookmarkDialogProps {
  bookmark: Bookmark | null;
  onSave: (values: { title: string; url: string }) => void;
  onClose: () => void;
}

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  required?: boolean;
}) => (
  <label className="block">
    <span className="text-ink/40 font-mono text-[0.55rem] tracking-[0.34em] uppercase">
      {label}
    </span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      required={required}
      spellCheck={false}
      className="text-ink placeholder:text-ink/20 border-ink/15 focus:border-accent font-display mt-2 w-full border-b bg-transparent pb-2 text-2xl outline-none"
    />
  </label>
);

export const BookmarkDialog = ({
  bookmark,
  onSave,
  onClose,
}: BookmarkDialogProps) => {
  const [title, setTitle] = useState(bookmark?.title ?? "");
  const [url, setUrl] = useState(bookmark?.url ?? "");

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const normalized = normalizeUrl(url);
    if (!normalized) return;

    onSave({ title: titleFor(title, normalized), url: normalized });
  };

  const preview = faviconUrl(normalizeUrl(url));

  return (
    <motion.div
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-6 backdrop-blur-md"
    >
      <motion.form
        onSubmit={submit}
        aria-label={bookmark ? "Edit bookmark" : "Add bookmark"}
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rounded-3xl bg-white/8 p-8 ring-1 ring-white/15 backdrop-blur-2xl"
      >
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            {preview ? (
              <img
                src={preview}
                alt=""
                width={24}
                height={24}
                className="size-5"
              />
            ) : (
              <IconWorld size={20} stroke={1.2} className="text-ink/40" />
            )}
          </span>
          <h2 className="text-ink/50 font-mono text-[0.6rem] tracking-[0.34em] uppercase">
            {bookmark ? "Edit bookmark" : "New bookmark"}
          </h2>
        </div>

        <div className="mt-8 flex flex-col gap-7">
          <Field
            label="Name"
            value={title}
            onChange={setTitle}
            placeholder="GitHub"
            autoFocus
          />
          <Field
            label="Address"
            value={url}
            onChange={setUrl}
            placeholder="github.com"
            required
          />
        </div>

        <div className="mt-10 flex items-center justify-end gap-2">
          <motion.button
            type="button"
            onClick={onClose}
            style={{ backgroundColor: "rgb(255 255 255 / 0)" }}
            whileHover={{ backgroundColor: "rgb(255 255 255 / 0.1)" }}
            whileTap={{ scale: 0.96 }}
            className="text-ink/45 hover:text-ink rounded-full px-5 py-2.5 font-mono text-[0.6rem] tracking-[0.28em] uppercase"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            style={{ backgroundColor: "rgb(255 255 255 / 0.15)" }}
            whileHover={{ backgroundColor: "rgb(255 255 255 / 0.26)" }}
            whileTap={{ scale: 0.96 }}
            className="text-ink rounded-full px-5 py-2.5 font-mono text-[0.6rem] tracking-[0.28em] uppercase ring-1 ring-white/25"
          >
            Save
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
};
