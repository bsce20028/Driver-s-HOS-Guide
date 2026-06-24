import { Box, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import StraightenIcon from "@mui/icons-material/Straighten";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarIcon from "@mui/icons-material/CalendarMonthOutlined";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import HotelIcon from "@mui/icons-material/HotelOutlined";
import CoffeeIcon from "@mui/icons-material/FreeBreakfastOutlined";
import { formatHours } from "../constants";

function StatCard({ icon, label, value, accent }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        flex: 1,
        minWidth: 140,
        background: "#ffffff",
        boxShadow: "0 10px 28px -22px rgba(15,23,42,0.4)",
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: `${accent}22`,
            color: accent,
          }}
        >
          {icon}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
    </Paper>
  );
}

export default function TripSummary({ route, logs, stops }) {
  const summary = logs.summary;
  const counts = stops.counts;
  const cyclePct = Math.min(
    100,
    (summary.ending_cycle_hours / summary.cycle_limit) * 100
  );

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <StatCard
          icon={<StraightenIcon fontSize="small" />}
          label="Total distance"
          value={`${route.distance_miles.toLocaleString()} mi`}
          accent="#38bdf8"
        />
        <StatCard
          icon={<ScheduleIcon fontSize="small" />}
          label="Drive time"
          value={formatHours(summary.driving_hours)}
          accent="#0ea5e9"
        />
        <StatCard
          icon={<CalendarIcon fontSize="small" />}
          label="Log days"
          value={summary.total_days}
          accent="#a78bfa"
        />
      </Stack>

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <StatCard
          icon={<LocalGasStationIcon fontSize="small" />}
          label="Fuel stops"
          value={counts.fuel_stops}
          accent="#f59e0b"
        />
        <StatCard
          icon={<CoffeeIcon fontSize="small" />}
          label="30-min breaks"
          value={counts.breaks}
          accent="#34d399"
        />
        <StatCard
          icon={<HotelIcon fontSize="small" />}
          label="10-hr resets"
          value={counts.rest_periods}
          accent="#f472b6"
        />
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: 2.25,
          borderRadius: 3,
          background: "#ffffff",
          boxShadow: "0 10px 28px -22px rgba(15,23,42,0.4)",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="baseline"
          spacing={1.5}
          sx={{ mb: 1 }}
        >
          <Typography variant="subtitle2">70-hour cycle usage</Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              whiteSpace: "nowrap",
              color: cyclePct > 90 ? "error.main" : "primary.dark",
            }}
          >
            {summary.ending_cycle_hours} / {summary.cycle_limit} hrs
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={cyclePct}
          sx={{
            height: 10,
            borderRadius: 6,
            bgcolor: "rgba(15,23,42,0.08)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 6,
              background:
                cyclePct > 90
                  ? "linear-gradient(90deg,#d97706,#dc2626)"
                  : "linear-gradient(90deg,#0284c7,#16a34a)",
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          Started at {summary.starting_cycle_hours} hrs of on-duty time already used this cycle.
        </Typography>
      </Paper>
    </Stack>
  );
}
