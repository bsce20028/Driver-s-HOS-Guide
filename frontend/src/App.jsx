import { useState } from "react";
import {
  Box,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { extractError, planTrip } from "./api";
import TripForm from "./components/TripForm";
import TripSummary from "./components/TripSummary";
import RouteMap from "./components/RouteMap";
import LogSheet from "./components/LogSheet";
import TruckBanner from "./components/TruckBanner";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError("");
    try {
      const data = await planTrip(payload);
      setResult(data);
    } catch (err) {
      setError(extractError(err));
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const tripMeta = result && {
    from: result.locations.pickup.label,
    to: result.locations.dropoff.label,
  };

  return (
    <Box sx={{ minHeight: "100vh", pb: 8 }}>
      <Box
        sx={{
          borderBottom: "1px solid rgba(15,23,42,0.08)",
          backdropFilter: "blur(8px)",
          background: "rgba(255,255,255,0.75)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 1.75 }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.5,
                  display: "grid",
                  placeItems: "center",
                  background: "linear-gradient(135deg,#0ea5e9,#2563eb)",
                  boxShadow: "0 10px 24px -8px rgba(2,132,199,0.6)",
                }}
              >
                <LocalShippingIcon sx={{ color: "#fff" }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
                  RouteLogic
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ELD Trip Planner & Daily Log Generator
                </Typography>
              </Box>
            </Stack>
            <Chip
              label="FMCSA · Property · 70hr/8day"
              size="small"
              sx={{
                bgcolor: "rgba(2,132,199,0.1)",
                color: "primary.dark",
                fontWeight: 600,
                display: { xs: "none", sm: "flex" },
              }}
            />
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
              width: { xs: "100%", md: 360 },
              flexShrink: 0,
              position: { md: "sticky" },
              top: { md: 88 },
              background: "#ffffff",
              boxShadow: "0 18px 50px -28px rgba(15,23,42,0.35)",
            }}
          >
            <TruckBanner />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Enter your route and remaining cycle hours. We compute HOS-compliant
              stops and draw your daily logs.
            </Typography>
            <TripForm onSubmit={handleSubmit} loading={loading} error={error} />
          </Paper>

          <Box sx={{ flex: 1, width: "100%", minWidth: 0 }}>
            {!result ? (
              <EmptyState />
            ) : (
              <Stack spacing={3} sx={{ animation: "fadeUp 0.5s ease" }}>
                <TripSummary
                  route={result.route}
                  logs={result.logs}
                  stops={result.stops}
                />

                <Paper
                  elevation={0}
                  sx={{ borderRadius: 4, overflow: "hidden", height: 440 }}
                >
                  <SectionLabel
                    icon={<MapOutlinedIcon fontSize="small" />}
                    title="Route & stops"
                  />
                  <Box sx={{ height: "calc(100% - 49px)" }}>
                    <RouteMap
                      route={result.route}
                      stops={result.stops}
                      locations={result.locations}
                    />
                  </Box>
                </Paper>

                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 1.5 }}
                  >
                    <DescriptionOutlinedIcon fontSize="small" color="primary" />
                    <Typography variant="h6">
                      Daily log sheets
                    </Typography>
                    <Chip
                      size="small"
                      label={`${result.logs.days.length} ${
                        result.logs.days.length === 1 ? "sheet" : "sheets"
                      }`}
                      sx={{ bgcolor: "rgba(2,132,199,0.1)", color: "primary.dark", fontWeight: 600 }}
                    />
                  </Stack>
                  <Stack spacing={2.5}>
                    {result.logs.days.map((day) => (
                      <LogSheet key={day.day_number} day={day} tripMeta={tripMeta} />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

function SectionLabel({ icon, title }) {
  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ px: 2, py: 1.5 }}
      >
        <Box sx={{ color: "primary.main", display: "flex" }}>{icon}</Box>
        <Typography variant="subtitle2">{title}</Typography>
      </Stack>
      <Divider />
    </>
  );
}

function EmptyState() {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        minHeight: 520,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        p: 4,
        background:
          "radial-gradient(600px 300px at 50% 0%, rgba(2,132,199,0.1), transparent 70%), #ffffff",
      }}
    >
      <Box sx={{ maxWidth: 420 }}>
        <Box
          sx={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            mx: "auto",
            mb: 2.5,
            background: "rgba(2,132,199,0.1)",
          }}
        >
          <MapOutlinedIcon sx={{ fontSize: 38, color: "primary.main" }} />
        </Box>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Your route appears here
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Fill in the trip details on the left and hit{" "}
          <strong>Plan trip</strong>. You'll get an interactive map with fuel,
          break and rest stops, plus fully drawn FMCSA daily log sheets — one for
          every day of the journey.
        </Typography>
      </Box>
    </Paper>
  );
}
