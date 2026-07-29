# Atmos

A Chrome home page that reacts to the weather outside. The sky palette, the
particle field and the accent colour are all derived from the current
OpenWeatherMap conditions and the time relative to your actual sunrise and
sunset — so midnight rain and a clear morning are visibly different pages.

The palette is Doom green — near-black viridian overhead falling to a toxic
emerald horizon. Over it sits an editorial layout: a 24-hour Instrument Serif
clock with hollow italic minutes, a two-tier monospace weather readout, and a
magnifying dock of bookmarks.

The page never scrolls. Every size is bounded by viewport height as well as
width, so the composition compresses to fit instead of overflowing.

Built with Vite, React 19 (React Compiler), Tailwind CSS v4, framer-motion, zod
and `@tabler/icons-react`.

All motion goes through framer-motion — there are no CSS keyframes or
`transition` utilities in the codebase. Reduced motion is honoured globally by
the `MotionConfig reducedMotion="user"` wrapper in `main.tsx`. Every component,
hook and helper is a named export.

## Setup

```bash
pnpm install
cp .env.example .env   # then fill it in
pnpm dev
```

| Variable                   | Required | Notes                                                                              |
| -------------------------- | -------- | ---------------------------------------------------------------------------------- |
| `VITE_OPENWEATHER_API_KEY` | yes      | From https://home.openweathermap.org/api_keys — new keys take ~10 min to activate. |
| `VITE_WEATHER_LAT`         | yes      | Latitude, e.g. `12.9716`                                                           |
| `VITE_WEATHER_LON`         | yes      | Longitude, e.g. `77.5946`                                                          |
| `VITE_WEATHER_UNITS`       | no       | `metric` (default), `imperial`, or `standard`                                      |
| `VITE_BACKGROUND_IMAGE`    | no       | Image URL or a path under `public/`. Empty = animated gradient.                    |

Vite only exposes variables prefixed with `VITE_`, and it reads `.env` at
**server start** — restart `pnpm dev` after editing it.

The app calls the OpenWeatherMap [Current Weather](https://openweathermap.org/current)
endpoint (`/data/2.5/weather`), which is included in the free tier.

Each reading is stored in an `atmos_weather` cookie with a 15-minute `Max-Age`.
**While that cookie is present the page reads from it and makes no request** —
opening tabs repeatedly costs nothing. Once it expires the next load refetches.
There is deliberately no manual refresh control; the only retry lives in the
error state, when there is nothing cached to show.

## Using it as your Chrome home page

Build and serve it, then point Chrome at the URL:

```bash
pnpm build
pnpm preview   # http://localhost:4173
```

In Chrome: **Settings → On startup → Open a specific page**, and
**Settings → Appearance → Show home button** → enter the URL.

Chrome only lets extensions replace the _new tab_ page, so for that you would
need to wrap `dist/` in a small extension with a `chrome_url_overrides.newtab`
manifest entry.

> The API key is compiled into the JavaScript bundle, as it must be for any
> client-only page. Keep the deployment private, and don't commit `.env`
> (it is gitignored).

## Bookmarks

Bookmarks live in `localStorage` under `atmos:bookmarks`; the starting set is in
`src/lib/bookmarks.ts`. The dock magnifies under the cursor, and the name of the
tile you're pointing at appears in the caption line above it.

**+** adds a bookmark. The pencil toggles edit mode, where tiles can be dragged
to reorder, clicked to rename, or removed with the ✕ badge. URLs can be typed
bare (`github.com`) — the scheme is added automatically. Icons come from
Google's favicon service, falling back to the first letter of the name.

Magnification is skipped in edit mode and whenever `prefers-reduced-motion` is
set.

## The sky system

`src/lib/sky.ts` turns a reading into a `Sky`: a **phase** (`dawn` / `day` /
`dusk` / `night`, taken from the real sunrise and sunset, falling back to the
clock) and a **mood** (`clear` / `clouds` / `rain` / `storm` / `snow` / `fog`,
from the condition id). Phase picks the gradient and accent; mood picks the
tint and the particle mode. The tint is held back at night, since a night sky
stays dark whatever the weather.

`--sky-ink` and `--sky-accent` are set on the root element and mapped to the
`ink` and `accent` Tailwind colours, so every hairline and label shifts with the
sky. `ambient-canvas.tsx` renders the particles — rain streaks, drifting snow,
twinkling stars with the occasional meteor, daylight motes, cloud banks, fog —
and draws a single static frame when `prefers-reduced-motion` is set.

To preview a palette you're not currently living in, hard-code `mood` and
`phase` at the top of `skyFor`.

## Layout

```
src/
├── app.tsx                     page shell; owns the clock and weather state
├── components/
│   ├── scene.tsx               gradient, wash, canvas, grain, vignette
│   ├── ambient-canvas.tsx      the weather-reactive particle field
│   ├── status-rail.tsx         wordmark, coordinates, sunrise/sunset
│   ├── clock.tsx               greeting, time, day and date
│   ├── weather-readout.tsx     two-tier readout + loading/error states
│   ├── weather-glyph.tsx       Tabler icon per condition
│   ├── dock.tsx                bookmark dock, magnification, edit mode
│   ├── dock-item.tsx
│   └── bookmark-dialog.tsx
├── hooks/                      use-now, use-weather, use-local-storage
├── lib/                        env (zod), weather client, sky, cookies, time,
│                               bookmarks
└── types/
```

## Scripts

| Command        | Description                     |
| -------------- | ------------------------------- |
| `pnpm dev`     | Dev server with HMR             |
| `pnpm build`   | Type-check and build to `dist/` |
| `pnpm preview` | Serve the production build      |
| `pnpm lint`    | ESLint                          |
