export const formatDurationFromStart = (start) => {
  const diffMs = Date.now() - new Date(start).getTime();
  const totalSec = Math.max(0, Math.floor(diffMs / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};

export const formatDurationFromSeconds = (totalSeconds) => {
  const totalSec = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};
