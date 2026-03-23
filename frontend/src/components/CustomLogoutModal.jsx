import { useState } from "react";

const CustomLogoutModal = ({ onClose, onSubmit, loginTime }) => {
  const [customLogoutTime, setCustomLogoutTime] = useState("20:00");
  const loginDate = new Date(loginTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]">
      <form
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(customLogoutTime);
        }}
      >
        <h3 className="mb-1 text-xl font-semibold text-slate-900">Set Custom End Time</h3>
        <p className="mb-4 text-sm text-slate-600">
          Session started at {loginDate.toLocaleString()}. Pick the end time.
          If the selected time is earlier than login time, it will be treated as next day.
        </p>
        <label className="mb-1 block text-sm font-medium text-slate-700">End Time</label>
        <input
          className="mb-5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          type="time"
          value={customLogoutTime}
          onChange={(e) => setCustomLogoutTime(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600" type="submit">
            Save End Time
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomLogoutModal;
