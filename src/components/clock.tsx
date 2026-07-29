import { isoWeek } from "@/lib/time";

import { useNow } from "@/hooks/use-now";

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const greetingFor = (hour: number) => {
  if (hour < 5) return "Still awake";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  return "Good night";
};

const Rule = () => (
  <span className="h-px w-8 bg-current opacity-40 sm:w-14" aria-hidden="true" />
);

export const Clock = () => {
  const now = useNow();

  const parts = timeFormatter.formatToParts(now);
  const partValue = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return (
    <div className="flex flex-col items-center">
      <p className="text-accent flex items-center gap-4 font-mono text-[0.65rem] tracking-[0.42em] uppercase">
        <Rule />
        {greetingFor(now.getHours())}
        <Rule />
      </p>

      <h1 className="text-ink font-display relative mt-[clamp(0.5rem,2vh,1.25rem)] flex items-start leading-[0.8] font-normal">
        <time
          dateTime={now.toISOString()}
          className="flex items-center text-[clamp(3.75rem,min(18.5vw,25vh),14rem)] tracking-[-0.02em]"
        >
          <span>{partValue("hour")}</span>

          <span
            aria-hidden="true"
            className="mx-[0.11em] flex translate-y-[-0.03em] flex-col gap-[0.13em]"
          >
            <span className="bg-accent size-[0.068em] rounded-full" />
            <span className="bg-accent size-[0.068em] rounded-full" />
          </span>

          <span className="text-hollow italic">{partValue("minute")}</span>
        </time>
      </h1>

      <p className="text-ink/85 mt-[clamp(1.1rem,3.4vh,2rem)] flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center font-mono text-[0.72rem] tracking-[0.3em] uppercase sm:text-[0.82rem] sm:tracking-[0.38em]">
        <span>{weekdayFormatter.format(now)}</span>
        <span className="text-accent/70" aria-hidden="true">
          /
        </span>
        <span>{dateFormatter.format(now)}</span>
        <span className="text-accent/70" aria-hidden="true">
          /
        </span>
        <span className="text-ink/50">Week {isoWeek(now)}</span>
      </p>
    </div>
  );
};
