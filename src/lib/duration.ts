const units = [
  { unit: "day", seconds: 60 * 60 * 24 },
  { unit: "hour", seconds: 60 * 60 },
  { unit: "minute", seconds: 60 },
  { unit: "second", seconds: 1 },
] as const;

export function formatDuration(totalSeconds: number) {
  const { unit, seconds } = units.find((u) => totalSeconds >= u.seconds) ?? units[3];
  const value = Math.round(totalSeconds / seconds);
  return `${value} ${unit}${value === 1 ? "" : "s"}`;
}
