import { Chip } from "@mui/material";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function computeElapsedDays(
  activatedAt: string | null,
  completedAt: string | null
): number | null {
  if (!activatedAt) return null;
  const start = new Date(activatedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  return Math.max(0, Math.floor((end - start) / MS_PER_DAY));
}

function colorForDays(days: number): "default" | "warning" | "error" {
  if (days <= 2) return "default";
  if (days <= 7) return "warning";
  return "error";
}

type ElapsedDaysChipProps = {
  activatedAt: string | null;
  completedAt: string | null;
};

export function ElapsedDaysChip({
  activatedAt,
  completedAt,
}: ElapsedDaysChipProps) {
  const days = computeElapsedDays(activatedAt, completedAt);
  if (days === null) {
    return null;
  }

  return (
    <Chip
      label={`${days} día${days === 1 ? "" : "s"}`}
      size="small"
      color={colorForDays(days)}
    />
  );
}
