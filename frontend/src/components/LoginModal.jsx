import { useState } from "react";

const LoginModal = ({ customers, pc, onClose, onSubmit }) => {
  const [existingCustomerId, setExistingCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      pcId: pc.id,
      customerId: existingCustomerId || null,
      customerName: existingCustomerId ? null : customerName,
      customerPhone: existingCustomerId ? null : customerPhone
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]">
      <form className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onSubmit={submit}>
        <div className="mb-5 border-b border-slate-200 pb-4">
          <h3 className="text-xl font-semibold text-slate-900">Login Customer - PC{pc.id}</h3>
          <p className="mt-1 text-sm text-slate-500">Start a session by selecting an existing customer or adding a new one.</p>
        </div>

        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">Select Existing Customer</label>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            value={existingCustomerId}
            onChange={(e) => setExistingCustomerId(e.target.value)}
          >
            <option value="">-- Register New Customer --</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </div>

        {!existingCustomerId && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm font-medium text-slate-700">New Customer Details</p>
            <label className="mb-1 block text-sm text-slate-600">Name</label>
            <input
              className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <label className="mb-1 block text-sm text-slate-600">Phone</label>
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600" type="submit">
            Start Session
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginModal;
