import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import FlagIcon from "@mui/icons-material/FlagOutlined";
import RouteIcon from "@mui/icons-material/AltRoute";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const SAMPLES = [
  {
    label: "Dallas → Houston → New Orleans",
    values: {
      current_location: "Dallas, TX",
      pickup_location: "Houston, TX",
      dropoff_location: "New Orleans, LA",
      current_cycle_used: 8,
    },
  },
  {
    label: "Chicago → Denver → Los Angeles",
    values: {
      current_location: "Chicago, IL",
      pickup_location: "Denver, CO",
      dropoff_location: "Los Angeles, CA",
      current_cycle_used: 14,
    },
  },
];

export default function TripForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    current_cycle_used: 0,
  });

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...form, current_cycle_used: Number(form.current_cycle_used) });
  };

  const canSubmit =
    form.current_location.trim() &&
    form.pickup_location.trim() &&
    form.dropoff_location.trim();

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2.25}>
        <TextField
          label="Current location"
          placeholder="e.g. Dallas, TX"
          value={form.current_location}
          onChange={update("current_location")}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MyLocationIcon fontSize="small" sx={{ color: "#22c55e" }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Pickup location"
          placeholder="e.g. Houston, TX"
          value={form.pickup_location}
          onChange={update("pickup_location")}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <InventoryIcon fontSize="small" sx={{ color: "#38bdf8" }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Drop-off location"
          placeholder="e.g. New Orleans, LA"
          value={form.dropoff_location}
          onChange={update("dropoff_location")}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FlagIcon fontSize="small" sx={{ color: "#ef4444" }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ px: 0.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
            spacing={1.5}
          >
            <Typography variant="body2" color="text.secondary">
              Current cycle used
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "primary.main", whiteSpace: "nowrap" }}
            >
              {form.current_cycle_used} / 70 hrs
            </Typography>
          </Stack>
          <Slider
            value={Number(form.current_cycle_used)}
            onChange={(_, value) =>
              setForm((prev) => ({ ...prev, current_cycle_used: value }))
            }
            min={0}
            max={70}
            step={0.5}
            valueLabelDisplay="auto"
            sx={{ mt: 1 }}
          />
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={!canSubmit || loading}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <RouteIcon />
            )
          }
          sx={{ py: 1.25 }}
        >
          {loading ? "Planning route…" : "Plan trip & generate logs"}
        </Button>

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            Quick samples
          </Typography>
          <Stack spacing={1}>
            {SAMPLES.map((sample) => (
              <Button
                key={sample.label}
                size="small"
                variant="outlined"
                color="inherit"
                onClick={() => setForm(sample.values)}
                startIcon={<LocalShippingIcon fontSize="small" />}
                sx={{
                  justifyContent: "flex-start",
                  borderColor: "rgba(15,23,42,0.14)",
                  color: "text.secondary",
                  fontWeight: 500,
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "rgba(2,132,199,0.05)",
                    color: "primary.main",
                  },
                }}
              >
                {sample.label}
              </Button>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
