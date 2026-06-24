import { useEffect, useRef } from "react";
import { Box, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import { DUTY_ROWS, STATUS_META, formatHours } from "../constants";

const PADDING_LEFT = 116;
const PADDING_RIGHT = 70;
const PADDING_TOP = 34;
const ROW_HEIGHT = 46;
const HOUR_LABELS = [
  "Mid", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11",
  "Noon", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "Mid",
];

function drawGrid(canvas, day) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const gridWidth = width - PADDING_LEFT - PADDING_RIGHT;
  const height = PADDING_TOP + ROW_HEIGHT * 4 + 26;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);
  ctx.font = "11px Inter, sans-serif";
  ctx.textBaseline = "middle";

  const hourWidth = gridWidth / 24;
  const xForHour = (h) => PADDING_LEFT + h * hourWidth;
  const yForRow = (i) => PADDING_TOP + i * ROW_HEIGHT;

  ctx.fillStyle = "#64748b";
  ctx.textAlign = "center";
  HOUR_LABELS.forEach((label, i) => {
    ctx.fillText(label, xForHour(i), PADDING_TOP - 16);
  });

  for (let h = 0; h <= 24; h += 1) {
    const x = xForHour(h);
    ctx.strokeStyle = h % 24 === 0 ? "#475569" : "rgba(100,116,139,0.22)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, PADDING_TOP);
    ctx.lineTo(x, PADDING_TOP + ROW_HEIGHT * 4);
    ctx.stroke();

    if (h < 24) {
      for (let q = 1; q < 4; q += 1) {
        const qx = x + (hourWidth * q) / 4;
        const tickHeight = q === 2 ? 9 : 5;
        for (let r = 0; r < 4; r += 1) {
          const baseY = yForRow(r) + ROW_HEIGHT;
          ctx.strokeStyle = "rgba(100,116,139,0.32)";
          ctx.beginPath();
          ctx.moveTo(qx, baseY);
          ctx.lineTo(qx, baseY - tickHeight);
          ctx.stroke();
        }
      }
    }
  }

  DUTY_ROWS.forEach((row, i) => {
    const y = yForRow(i);
    ctx.fillStyle = i % 2 === 0 ? "rgba(15,23,42,0.015)" : "rgba(15,23,42,0.04)";
    ctx.fillRect(PADDING_LEFT, y, gridWidth, ROW_HEIGHT);

    ctx.strokeStyle = "rgba(100,116,139,0.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING_LEFT, y);
    ctx.lineTo(PADDING_LEFT + gridWidth, y);
    ctx.stroke();

    ctx.fillStyle = "#334155";
    ctx.textAlign = "right";
    ctx.font = "700 11px Inter, sans-serif";
    ctx.fillText(row.short, PADDING_LEFT - 12, y + ROW_HEIGHT / 2 - 7);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px Inter, sans-serif";
    ctx.fillText(row.label.split(" ")[0], PADDING_LEFT - 12, y + ROW_HEIGHT / 2 + 7);

    const total = day.totals[row.key] || 0;
    ctx.fillStyle = total > 0 ? row.color : "#94a3b8";
    ctx.textAlign = "left";
    ctx.font = "700 12px 'Roboto Mono', monospace";
    ctx.fillText(formatHours(total), PADDING_LEFT + gridWidth + 12, y + ROW_HEIGHT / 2);
  });

  const bottomY = yForRow(4);
  ctx.strokeStyle = "rgba(100,116,139,0.35)";
  ctx.beginPath();
  ctx.moveTo(PADDING_LEFT, bottomY);
  ctx.lineTo(PADDING_LEFT + gridWidth, bottomY);
  ctx.stroke();

  const rowIndex = { off_duty: 0, sleeper_berth: 1, driving: 2, on_duty: 3 };
  const centerY = (status) => yForRow(rowIndex[status]) + ROW_HEIGHT / 2;

  const sorted = [...day.segments].sort((a, b) => a.start - b.start);
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  let previous = null;
  sorted.forEach((seg) => {
    const meta = STATUS_META[seg.status];
    const y = centerY(seg.status);
    const xStart = xForHour(seg.start);
    const xEnd = xForHour(seg.end);

    if (previous && Math.abs(previous.y - y) > 1) {
      const connectX = xForHour(seg.start);
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(connectX, previous.y);
      ctx.lineTo(connectX, y);
      ctx.stroke();
    }

    ctx.strokeStyle = meta.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(xStart, y);
    ctx.lineTo(xEnd, y);
    ctx.stroke();

    previous = { y, x: xEnd };
  });
}

export default function LogSheet({ day, tripMeta }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const render = () => drawGrid(canvas, day);
    render();
    const observer = new ResizeObserver(render);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [day]);

  const onDutyTotal =
    (day.totals.driving || 0) + (day.totals.on_duty || 0);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 4,
        background: "#ffffff",
        boxShadow: "0 16px 40px -28px rgba(15,23,42,0.3)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="overline" color="primary" sx={{ letterSpacing: 2 }}>
            Driver's Daily Log
          </Typography>
          <Typography variant="h6">Day {day.day_number}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            size="small"
            label={`Driving ${formatHours(day.totals.driving || 0)}`}
            sx={{ bgcolor: "rgba(2,132,199,0.12)", color: "#0369a1", fontWeight: 600 }}
          />
          <Chip
            size="small"
            label={`On-duty ${formatHours(onDutyTotal)}`}
            sx={{ bgcolor: "rgba(217,119,6,0.14)", color: "#b45309", fontWeight: 600 }}
          />
        </Stack>
      </Stack>

      <Box sx={{ overflowX: "auto" }}>
        <canvas ref={canvasRef} style={{ width: "100%", minWidth: 640, display: "block" }} />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ mb: 1.5 }}>
        <MetaItem label="From" value={tripMeta.from} />
        <MetaItem label="To" value={tripMeta.to} />
        <MetaItem label="Cycle rule" value="70 hr / 8 day" />
      </Stack>

      {day.remarks.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Remarks
          </Typography>
          <Stack spacing={0.75}>
            {day.remarks.map((remark, idx) => (
              <Stack
                key={idx}
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: "rgba(15,23,42,0.04)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "'Roboto Mono', monospace",
                    color: "primary.dark",
                    fontWeight: 600,
                    minWidth: 78,
                  }}
                >
                  {remark.time}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {remark.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {remark.location}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}

function MetaItem({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, maxWidth: 240 }} noWrap>
        {value}
      </Typography>
    </Box>
  );
}
