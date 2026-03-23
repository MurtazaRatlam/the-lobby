import SessionProductsPanel from "./SessionProductsPanel.jsx";

const LogoutModal = ({
  pc,
  products,
  onSessionProductsChanged,
  onPause,
  onResume,
  onClose,
  onEndNow,
  onCustom
}) => {
  const session = pc.activeSession;
  const lines = session?.sessionProducts ?? [];
  const isPaused = Boolean(session?.isPaused);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="mb-1 text-xl font-semibold text-slate-900">End Session - PC{pc.id}</h3>
        <p className="mb-4 text-sm text-slate-600">
          Add products for this customer, then end the session. Product charges are included in the final bill at
          logout.
        </p>

        {session?.id && (
          <SessionProductsPanel
            sessionId={session.id}
            lines={lines}
            products={products}
            onChanged={onSessionProductsChanged}
          />
        )}

        <p className="mb-3 text-sm font-medium text-slate-800">End session</p>
        <div className="grid grid-cols-1 gap-2">
          <button
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
            onClick={isPaused ? onResume : onPause}
          >
            {isPaused ? "Resume Session" : "Pause Session"}
          </button>
          <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600" onClick={onEndNow}>
            End Session Now
          </button>
          <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={onCustom}>
            Set Custom End Time
          </button>
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
