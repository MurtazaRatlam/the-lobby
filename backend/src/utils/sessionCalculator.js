const HOURLY_RATE = 80;

export const calculateRoundedHours = (loginTime, logoutTime) => {
  const ms = new Date(logoutTime).getTime() - new Date(loginTime).getTime();
  const hours = ms / (1000 * 60 * 60);
  return Math.round(hours * 2) / 2;
};

export const calculatePausedMilliseconds = (pauses = [], sessionEndTime = new Date()) => {
  return pauses.reduce((sum, pause) => {
    const start = new Date(pause.pauseStart).getTime();
    const end = pause.pauseEnd ? new Date(pause.pauseEnd).getTime() : new Date(sessionEndTime).getTime();
    return sum + Math.max(0, end - start);
  }, 0);
};

export const calculateRoundedHoursWithPaused = (loginTime, logoutTime, pausedMs = 0) => {
  const totalMs = new Date(logoutTime).getTime() - new Date(loginTime).getTime();
  const effectiveMs = Math.max(0, totalMs - pausedMs);
  const hours = effectiveMs / (1000 * 60 * 60);
  return Math.round(hours * 2) / 2;
};

export const calculateSessionAmounts = ({ loginTime, logoutTime, paidAmount = 0 }) => {
  const totalHours = calculateRoundedHours(loginTime, logoutTime);
  const payableAmount = totalHours * HOURLY_RATE;
  const pendingAmount = payableAmount - Number(paidAmount || 0);

  return {
    totalHours,
    payableAmount,
    pendingAmount
  };
};

/** PC time charge only (products added separately at logout). */
export const calculatePcPayableOnly = (loginTime, logoutTime) => {
  const totalHours = calculateRoundedHours(loginTime, logoutTime);
  const pcPayable = totalHours * HOURLY_RATE;
  return { totalHours, pcPayable };
};

export const calculatePcPayableWithPaused = (loginTime, logoutTime, pausedMs = 0) => {
  const totalHours = calculateRoundedHoursWithPaused(loginTime, logoutTime, pausedMs);
  const pcPayable = totalHours * HOURLY_RATE;
  return { totalHours, pcPayable };
};

export const RATE_PER_HOUR = HOURLY_RATE;
