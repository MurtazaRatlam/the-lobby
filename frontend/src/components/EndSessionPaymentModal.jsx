import { useMemo, useState } from "react";

const RATE_PER_HOUR = 80;

const computePausedMsUntil = (session, untilDate) => {
  const completedMs = session.pausedMsSoFar || 0;
  if (!session.isPaused || !session.activePauseStart) return completedMs;
  const runningMs = Math.max(0, new Date(untilDate).getTime() - new Date(session.activePauseStart).getTime());
  return completedMs + runningMs;
};

const EndSessionPaymentModal = ({ pc, tick, onClose, onConfirm }) => {
  const [paidAmount, setPaidAmount] = useState("");
  const now = new Date();

  const productsTotal = useMemo(
    () =>
      (pc.activeSession?.sessionProducts ?? []).reduce(
        (s, l) => s + Number(l.lineTotal ?? 0),
        0
      ),
    [pc.activeSession?.sessionProducts]
  );

  const { totalHours, pcPayable, payableAmount } = useMemo(() => {
    const totalMs = new Date(now).getTime() - new Date(pc.activeSession.loginTime).getTime();
    const pausedMs = computePausedMsUntil(pc.activeSession, now);
    const effectiveMs = Math.max(0, totalMs - pausedMs);
    const total = Math.round((effectiveMs / (1000 * 60 * 60)) * 2) / 2;
    const pcPart = total * RATE_PER_HOUR;
    return {
      totalHours: total,
      pcPayable: pcPart,
      payableAmount: pcPart + productsTotal
    };
  }, [pc.activeSession.loginTime, now, productsTotal, tick]);

  const collected = paidAmount === "" ? payableAmount : Number(paidAmount);
  const pending = Math.max(0, payableAmount - collected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]">
      <form
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm(paidAmount);
        }}
      >
        <h3 className="mb-1 text-xl font-semibold text-slate-900">Close Session - PC{pc.id}</h3>
        <p className="mb-4 text-sm text-slate-600">Review payment before ending session.</p>

        <div className="mb-4 space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Total Hours</span>
            <span className="font-semibold text-slate-900">{totalHours}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">PC time (Rs {RATE_PER_HOUR}/hr)</span>
            <span className="font-semibold text-slate-900">Rs {pcPayable.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Products</span>
            <span className="font-semibold text-slate-900">Rs {productsTotal.toFixed(2)}</span>
          </div>
          <div className="border-t border-slate-200 pt-1 flex justify-between">
            <span className="text-slate-800 font-medium">Total to collect</span>
            <span className="font-semibold text-slate-900">Rs {payableAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Pending After Checkout</span>
            <span className="font-semibold text-rose-600">Rs {pending.toFixed(2)}</span>
          </div>
        </div>

        <label className="mb-1 block text-sm font-medium text-slate-700">Paid Amount (optional)</label>
        <input
          className="mb-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          type="number"
          min="0"
          step="1"
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
          placeholder={`Default: Rs ${payableAmount.toFixed(2)} (full paid)`}
        />
        <p className="mb-5 text-xs text-slate-500">
          Leave empty to mark full amount as paid.
        </p>

        <div className="flex justify-end gap-2">
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600" type="submit">
            Confirm & End
          </button>
        </div>
      </form>
    </div>
  );
};

export default EndSessionPaymentModal;
