import { useEffect, useState } from "react";
import {
  IconCurrentLocation,
  IconEye,
  IconEyeOff,
  IconLoader2,
  IconSettings,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";

import { DEFAULT_SETTINGS, parseDraft, toDraft, UNITS } from "@/lib/settings";
import type {
  Settings,
  SettingsDraft,
  SettingsErrors,
  WeatherUnits,
} from "@/lib/settings";

interface SettingsDialogProps {
  settings: Settings;
  onSave: (settings: Settings) => void;
  onClose: () => void;
}

const UNIT_LABELS: Record<WeatherUnits, { symbol: string; caption: string }> = {
  metric: { symbol: "°C", caption: "Metric" },
  imperial: { symbol: "°F", caption: "Imperial" },
  standard: { symbol: "K", caption: "Kelvin" },
};

const KEYS_URL = "https://home.openweathermap.org/api_keys";

const labelClasses =
  "text-ink/40 font-mono text-[0.55rem] tracking-[0.34em] uppercase";

const ghostClasses =
  "text-ink/40 hover:text-accent font-mono text-[0.55rem] tracking-[0.24em] uppercase";

const Field = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  action,
  mono,
  type = "text",
  autoFocus,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  action?: React.ReactNode;
  mono?: boolean;
  type?: "text" | "password";
  autoFocus?: boolean;
}) => (
  <div className="min-w-0">
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      {action}
    </div>

    <input
      id={id}
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      autoFocus={autoFocus}
      spellCheck={false}
      autoComplete="off"
      className={`text-ink placeholder:text-ink/20 mt-2 w-full border-b bg-transparent pb-2 outline-none ${
        mono
          ? "font-mono text-[0.85rem] tracking-[0.06em]"
          : "font-display text-2xl"
      } ${error ? "border-rose-300/60" : "border-ink/15 focus:border-accent"}`}
    />

    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-2 font-mono text-[0.55rem] tracking-[0.2em] text-rose-300/85 uppercase"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

export const SettingsDialog = ({
  settings,
  onSave,
  onClose,
}: SettingsDialogProps) => {
  const [draft, setDraft] = useState<SettingsDraft>(() => toDraft(settings));
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const update = (patch: Partial<SettingsDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch))
        delete next[key as keyof SettingsDraft];
      return next;
    });
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setErrors((current) => ({
        ...current,
        lat: "This browser has no location service",
      }));
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        update({
          lat: position.coords.latitude.toFixed(4),
          lon: position.coords.longitude.toFixed(4),
        });
        setIsLocating(false);
      },
      (cause) => {
        setErrors((current) => ({ ...current, lat: cause.message }));
        setIsLocating(false);
      },
      { timeout: 10_000, maximumAge: 60_000 },
    );
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const result = parseDraft(draft);
    if (result.errors) {
      setErrors(result.errors);
      return;
    }

    onSave(result.settings);
  };

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
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/55 p-6 backdrop-blur-md"
    >
      <motion.form
        onSubmit={submit}
        aria-label="Settings"
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="my-auto w-full max-w-lg rounded-3xl bg-white/8 p-8 ring-1 ring-white/15 backdrop-blur-2xl"
      >
        <div className="flex items-center gap-4">
          <span className="text-accent grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/15">
            <IconSettings size={20} stroke={1.2} />
          </span>
          <div className="min-w-0">
            <h2 className="text-ink/50 font-mono text-[0.6rem] tracking-[0.34em] uppercase">
              Settings
            </h2>
            <p className="text-ink/30 mt-1.5 font-mono text-[0.55rem] leading-relaxed tracking-[0.14em]">
              Kept in this browser only. The key is sent to OpenWeatherMap and
              nowhere else.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-7">
          <Field
            id="settings-api-key"
            label="OpenWeatherMap key"
            value={draft.apiKey}
            onChange={(apiKey) => update({ apiKey })}
            placeholder="0123456789abcdef0123456789abcdef"
            error={errors.apiKey}
            type={isRevealed ? "text" : "password"}
            mono
            autoFocus
            action={
              <span className="flex shrink-0 items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsRevealed((value) => !value)}
                  aria-pressed={isRevealed}
                  className="text-ink/40 hover:text-accent"
                  title={isRevealed ? "Hide key" : "Show key"}
                  aria-label={isRevealed ? "Hide key" : "Show key"}
                >
                  {isRevealed ? (
                    <IconEyeOff size={14} stroke={1.4} />
                  ) : (
                    <IconEye size={14} stroke={1.4} />
                  )}
                </button>
                <a
                  href={KEYS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className={ghostClasses}
                >
                  Get one
                </a>
              </span>
            }
          />

          <div>
            <div className="flex items-baseline justify-between gap-3">
              <span className={labelClasses}>Coordinates</span>
              <motion.button
                type="button"
                onClick={locate}
                disabled={isLocating}
                whileTap={{ scale: 0.96 }}
                className={`flex shrink-0 items-center gap-1.5 ${ghostClasses}`}
              >
                {isLocating ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1.1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="flex"
                  >
                    <IconLoader2 size={13} stroke={1.6} />
                  </motion.span>
                ) : (
                  <IconCurrentLocation size={13} stroke={1.4} />
                )}
                Use my location
              </motion.button>
            </div>

            <div className="mt-1 grid grid-cols-2 gap-5">
              <Field
                id="settings-lat"
                label="Latitude"
                value={draft.lat}
                onChange={(lat) => update({ lat })}
                placeholder="12.9716"
                error={errors.lat}
              />
              <Field
                id="settings-lon"
                label="Longitude"
                value={draft.lon}
                onChange={(lon) => update({ lon })}
                placeholder="77.5946"
                error={errors.lon}
              />
            </div>
          </div>

          <div>
            <span className={labelClasses}>Units</span>

            <div className="border-ink/15 mt-2.5 flex rounded-full border p-1">
              {UNITS.map((unit) => {
                const isActive = draft.units === unit;

                return (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => update({ units: unit })}
                    aria-pressed={isActive}
                    className="relative flex-1 rounded-full px-3 py-2.5"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="units-pill"
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute inset-0 rounded-full bg-white/12 ring-1 ring-white/15"
                      />
                    )}
                    <span
                      className={`relative flex items-center justify-center gap-2 font-mono text-[0.6rem] tracking-[0.26em] uppercase ${
                        isActive ? "text-ink" : "text-ink/35"
                      }`}
                    >
                      <span className={isActive ? "text-accent" : ""}>
                        {UNIT_LABELS[unit].symbol}
                      </span>
                      {UNIT_LABELS[unit].caption}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Field
            id="settings-background"
            label="Background image"
            value={draft.backgroundImage}
            onChange={(backgroundImage) => update({ backgroundImage })}
            placeholder="Empty for the animated sky"
            error={errors.backgroundImage}
            mono
          />
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          <motion.button
            type="button"
            onClick={() => {
              setDraft(toDraft(DEFAULT_SETTINGS));
              setErrors({});
            }}
            whileTap={{ scale: 0.96 }}
            className={ghostClasses}
          >
            Clear all
          </motion.button>

          <div className="flex items-center gap-2">
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
        </div>
      </motion.form>
    </motion.div>
  );
};
