export const DUTY_ROWS = [
  { key: "off_duty", label: "Off Duty", short: "OFF", color: "#64748b" },
  { key: "sleeper_berth", label: "Sleeper Berth", short: "SB", color: "#7c3aed" },
  { key: "driving", label: "Driving", short: "D", color: "#0284c7" },
  { key: "on_duty", label: "On Duty (Not Driving)", short: "ON", color: "#d97706" },
];

export const STATUS_META = DUTY_ROWS.reduce((acc, row) => {
  acc[row.key] = row;
  return acc;
}, {});

export const STOP_STYLES = {
  start: { color: "#22c55e", label: "Start" },
  pickup: { color: "#0ea5e9", label: "Pickup" },
  dropoff: { color: "#ef4444", label: "Drop-off" },
};

export function formatHours(value) {
  const whole = Math.floor(value);
  const minutes = Math.round((value - whole) * 60);
  if (minutes === 0) return `${whole}h`;
  return `${whole}h ${minutes}m`;
}

export function formatClock(dayHour) {
  const totalMinutes = Math.round(dayHour * 60);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const suffix = hours < 12 ? "AM" : "PM";
  let display = hours % 12;
  if (display === 0) display = 12;
  return `${display}:${String(minutes).padStart(2, "0")} ${suffix}`;
}
