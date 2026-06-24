# RouteLogic — ELD Trip Planner & Daily Log Generator

A full-stack application that takes trip details (current, pickup and drop-off
locations + hours already used in the current 70-hour cycle) and produces:

- An **interactive route map** with every required stop (start, pickup, fuel,
  30-minute breaks, 10-hour resets, drop-off) drawn on free OpenStreetMap tiles.
- **FMCSA daily log sheets** drawn on a 24-hour grid — one sheet per day of the
  trip — with the duty-status line, per-status hour totals and remarks filled in.

Built for a **property-carrying driver on the 70 hr / 8 day cycle**, assuming no
adverse driving conditions, fueling at least every 1,000 miles, and 1 hour each
for pickup and drop-off.

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Backend | Django 6 + Django REST Framework |
| Frontend | React 19 (Vite) + Material UI (MUI) |
| Map | Leaflet + react-leaflet, CARTO Voyager tiles |
| Routing | OSRM (`router.project-osrm.org`) — free, no key |
| Geocoding | Nominatim (`nominatim.openstreetmap.org`) — free, no key |

No API keys are required to run the app.

---

## Project structure

The backend is split into focused Django apps so each concern is isolated and
easy to maintain:

```
backend/
  config/            # project settings + root urls
  routing/           # geocoding + OSRM route services (no models)
  eldlogs/           # HOS engine: turns a route into duty-status segments
                     #   constants.py  -> all FMCSA rule numbers
                     #   engine.py     -> shift/cycle simulation
                     #   builder.py    -> splits the timeline into daily logs
  trips/             # orchestrator: Trip model, serializers, DRF endpoints
                     #   services.py   -> ties routing + eldlogs together
frontend/
  src/
    components/      # TripForm, RouteMap, TripSummary, LogSheet
    api.js           # axios client
    theme.js         # MUI light theme
    constants.js     # duty-status colors / formatters
```

### How the HOS logic works (`eldlogs`)

The engine simulates the drive minute-by-mile and enforces every limit from the
FMCSA driver's guide:

- **11-hour** driving limit per shift
- **14-hour** on-duty driving window
- **30-minute** break required after 8 cumulative driving hours
- **10 consecutive hours** off duty to reset the daily clocks
- **70 hr / 8 day** cycle (seeded with the `current_cycle_used` input)
- **Fuel stop** (30 min, on-duty) every 1,000 miles
- **Pickup / drop-off** = 1 hour on-duty each

Average planning speed is **55 mph**. The continuous timeline is then sliced into
24-hour calendar days; each day's four duty rows always total exactly 24 hours.

---

## Run locally

### 1. Backend (Django) — port 8000

```bash
cd backend
python -m venv ../backend_venv
# Windows:  ../backend_venv/Scripts/activate
# macOS/Linux:  source ../backend_venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

### 2. Frontend (React) — port 5173

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` to Django, so
no extra config is needed for local development.

---

## Manual testing guide

> There are no automated tests. Verify behavior manually as follows.

### A. API smoke test (backend only)

```bash
curl http://127.0.0.1:8000/api/health/
# -> {"status":"ok"}

curl -X POST http://127.0.0.1:8000/api/plan/ \
  -H "Content-Type: application/json" \
  -d '{"current_location":"Dallas, TX","pickup_location":"Houston, TX","dropoff_location":"New Orleans, LA","current_cycle_used":8}'
```

Confirm the response contains `route.distance_miles`, a `route.geometry` array,
`stops.counts`, and a `logs.days` array.

### B. UI walk-through (full app)

1. Open http://localhost:5173 — you should see the empty state on the right.
2. Click a **Quick sample** (e.g. *Chicago → Denver → Los Angeles*) or type your
   own three locations and drag the cycle slider.
3. Click **Plan trip & generate logs**.
4. Verify:
   - **Stat cards** show distance, drive time, log days, fuel stops, breaks,
     resets, and a 70-hour cycle usage bar.
   - **Map** draws the route line with A / P / D pin markers; clicking a pin
     shows the full place name.
   - **Daily log sheets** — one per day — render the 24-hour grid with a
     continuous duty-status line, right-side hour totals, and a remarks list.

### C. Accuracy checks (what to look for)

| Trip | Expect |
| --- | --- |
| Short (e.g. Dallas → Houston → New Orleans, ~590 mi) | 1 log day, 0 fuel stops, 1 break |
| Long (e.g. Chicago → Denver → LA, ~2,000 mi) | ~4 log days, 2 fuel stops, several resets |

For **every** day, confirm the four duty totals add up to 24h and driving never
exceeds 11h. A fuel stop should appear roughly every 1,000 miles, and a 30-min
break before driving passes 8 cumulative hours in a shift.

### D. Validation / error handling

- Submit a nonsense location (e.g. `asdkjhasd`) → a clear inline error appears.
- Cycle slider is clamped to 0–70 and is sent as a number.

---

## Inputs & outputs (assessment spec)

**Inputs:** current location, pickup location, drop-off location, current cycle
used (hrs).
**Outputs:** route map with stops/rests, and filled-out daily log sheets
(multiple sheets for longer trips).
