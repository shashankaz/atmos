import { useEffect, useState } from "react";

export const useNow = () => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timeout = 0;

    const schedule = (from: Date) => {
      timeout = window.setTimeout(() => {
        const next = new Date();
        setNow(next);
        schedule(next);
      }, 1000 - from.getMilliseconds());
    };

    schedule(new Date());

    return () => window.clearTimeout(timeout);
  }, []);

  return now;
};
