import { formatDurationFromSeconds, formatDurationFromStart } from "../utils/timeCalculator";
import { Monitor } from "lucide-react";

const PCCard = ({ pc, onClick, tick }) => {
  const inUse = pc.status === "in_use";
  const isPaused = Boolean(pc.activeSession?.isPaused);
  const pauseSeconds = isPaused
    ? (pc.activeSession?.pausedMsSoFar || 0) / 1000 +
      (Date.now() - new Date(pc.activeSession?.activePauseStart).getTime()) / 1000
    : (pc.activeSession?.pausedMsSoFar || 0) / 1000;
  return (
    <button
      className={[
        "w-full aspect-square min-h-[170px] rounded-2xl border p-4 text-left transition",
        "grid grid-rows-[auto_1fr_auto]",
        "hover:-translate-y-0.5",
        isPaused
          ? "border-amber-300 bg-amber-500 text-white"
          : inUse
            ? "border-red-300 bg-red-500 text-white"
            : "border-emerald-300 bg-emerald-500 text-white"
      ].join(" ")}
      onClick={onClick}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-lg font-semibold">PC{pc.id}</div>
        <div
          className={[
            "rounded-full px-2 py-1 text-xs font-semibold",
            inUse ? "bg-white/20 text-white" : "bg-white/20 text-white"
          ].join(" ")}
        >
          {inUse ? (isPaused ? "Paused" : "In Use") : "Available"}
        </div>
      </div>
      <div className="flex items-center justify-center">
        <div className="rounded-xl bg-white/20 p-3">
          <Monitor size={34} className="text-white" />
        </div>
      </div>
      {inUse && (
        <div className="space-y-1 self-end">
          <div className="truncate text-sm text-white/90">{pc.activeSession?.customer?.name}</div>
          <div className="font-mono text-sm text-white">
            {formatDurationFromStart(pc.activeSession?.loginTime, tick)}
          </div>
          {isPaused && (
            <div className="font-mono text-xs text-white/90">
              Pause: {formatDurationFromSeconds(pauseSeconds)}
            </div>
          )}
        </div>
      )}
      {!inUse && <div />}
    </button>
  );
};

export default PCCard;
