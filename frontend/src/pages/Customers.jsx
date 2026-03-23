import { useEffect, useState } from "react";
import api from "../services/api";

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ id: null, name: "", phone: "" });

  const fetchCustomers = async () => {
    const { data } = await api.get("/customers");
    setCustomers(data);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (form.id) await api.put(`/customers/${form.id}`, { name: form.name, phone: form.phone });
    else await api.post("/customers", { name: form.name, phone: form.phone });
    setForm({ id: null, name: "", phone: "" });
    fetchCustomers();
  };

  const edit = (c) => setForm({ id: c.id, name: c.name, phone: c.phone });
  const remove = async (id) => {
    await api.delete(`/customers/${id}`);
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Customers</h2>
        <p className="mt-1 text-sm text-slate-600">Manage customer records and billing insights.</p>
      </div>
      <form className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4" onSubmit={submit}>
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          placeholder="Phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          required
        />
        <button className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950" type="submit">
          {form.id ? "Update" : "Add"} Customer
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-3 py-2 text-left">Customer Name</th>
            <th className="px-3 py-2 text-left">Phone Number</th>
            <th className="px-3 py-2 text-left">Total Sessions</th>
            <th className="px-3 py-2 text-left">Total Hours Played</th>
            <th className="px-3 py-2 text-left">Total Paid</th>
            <th className="px-3 py-2 text-left">Total Pending</th>
            <th className="px-3 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-t border-slate-200">
              <td className="px-3 py-2">{c.name}</td>
              <td className="px-3 py-2">{c.phone}</td>
              <td className="px-3 py-2">{c.totalSessions}</td>
              <td className="px-3 py-2">{c.totalHoursPlayed}</td>
              <td className="px-3 py-2">{c.totalPaid}</td>
              <td className="px-3 py-2">{c.totalPending}</td>
              <td className="px-3 py-2">
                <button className="mr-2 rounded border border-slate-300 px-2 py-1 text-xs text-slate-700" onClick={() => edit(c)}>
                  Edit
                </button>
                <button className="rounded border border-rose-500/60 px-2 py-1 text-xs text-rose-300" onClick={() => remove(c.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default Customers;
