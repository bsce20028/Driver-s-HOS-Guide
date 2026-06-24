import { Box, Typography } from "@mui/material";

export default function TruckBanner() {
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        mb: 2.5,
        height: 132,
        background: "linear-gradient(160deg, #0c4a6e 0%, #0284c7 55%, #38bdf8 100%)",
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 400 140"
        preserveAspectRatio="xMidYMid slice"
        sx={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0c4a6e" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <rect width="400" height="140" fill="url(#sky)" />
        <circle cx="330" cy="40" r="22" fill="#fde68a" opacity="0.85" />

        <path d="M0 96 L150 70 L270 86 L400 64 L400 140 L0 140 Z" fill="#0b3b57" opacity="0.6" />
        <path d="M0 112 L120 96 L260 110 L400 92 L400 140 L0 140 Z" fill="#08344c" opacity="0.7" />

        <rect x="0" y="116" width="400" height="24" fill="#1e293b" />
        <g stroke="#fbbf24" strokeWidth="3" strokeDasharray="18 14">
          <line x1="0" y1="128" x2="400" y2="128" />
        </g>

        <g transform="translate(150 88)">
          <rect x="40" y="-2" width="70" height="34" rx="3" fill="#e2e8f0" />
          <rect x="40" y="-2" width="70" height="34" rx="3" fill="none" stroke="#94a3b8" strokeWidth="1" />
          <path d="M2 6 H40 V32 H2 Z" fill="#0ea5e9" />
          <path d="M2 6 H30 L40 18 V32 H2 Z" fill="#0284c7" />
          <rect x="8" y="10" width="16" height="11" rx="2" fill="#bae6fd" />
          <circle cx="16" cy="36" r="7" fill="#0f172a" />
          <circle cx="16" cy="36" r="3" fill="#64748b" />
          <circle cx="72" cy="36" r="7" fill="#0f172a" />
          <circle cx="72" cy="36" r="3" fill="#64748b" />
          <circle cx="90" cy="36" r="7" fill="#0f172a" />
          <circle cx="90" cy="36" r="3" fill="#64748b" />
          <rect x="0" y="22" width="6" height="6" fill="#fbbf24" />
        </g>
      </Box>

      <Box sx={{ position: "relative", p: 2, height: "100%", display: "flex", alignItems: "flex-end" }}>
        <Box>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.85)", letterSpacing: 1.5, fontWeight: 600 }}
          >
            HOURS OF SERVICE
          </Typography>
          <Typography variant="h6" sx={{ color: "#fff", lineHeight: 1.15, mt: 0.25 }}>
            Plan a compliant trip
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
