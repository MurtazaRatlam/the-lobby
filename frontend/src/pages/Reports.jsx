import { useEffect, useState } from "react";
import api from "../services/api";

const Reports = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({
    totalEarnings: 0,
    totalPayable: 0,
    totalPaid: 0,
    totalPending: 0,
    totalHours: 0
  });

  const fetchReports = async () => {
    const { data } = await api.get("/reports", { params: { from, to } });
    setRows(data.rows);
    setTotals(data.totals);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const downloadCsv = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    window.open(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/reports/csv?${params}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Reports</h2>
        <p className="mt-1 text-sm text-slate-600">Track earnings, payable, pending and session details.</p>
      </div>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-4">
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <button className="rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950" onClick={fetchReports}>
          Apply Filter
        </button>
        <button className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700" onClick={downloadCsv}>
          Download CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">Total Earnings: Rs {totals.totalEarnings}</div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">Total Payable: Rs {totals.totalPayable}</div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">Total Paid: Rs {totals.totalPaid}</div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">Total Pending: Rs {totals.totalPending}</div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">Total Hours: {totals.totalHours}</div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-full text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-3 py-2 text-left">Customer Name</th>
            <th className="px-3 py-2 text-left">PC Number</th>
            <th className="px-3 py-2 text-left">Login Time</th>
            <th className="px-3 py-2 text-left">Logout Time</th>
            <th className="px-3 py-2 text-left">Total Hours</th>
            <th className="px-3 py-2 text-left">Payable Amount</th>
            <th className="px-3 py-2 text-left">Paid Amount</th>
            <th className="px-3 py-2 text-left">Pending Amount</th>
            <th className="px-3 py-2 text-left">Custom Logout</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-slate-200">
              <td className="px-3 py-2">{r.customerName}</td>
              <td className="px-3 py-2">PC{r.pcNumber}</td>
              <td className="px-3 py-2">{new Date(r.loginTime).toLocaleString()}</td>
              <td className="px-3 py-2">{new Date(r.logoutTime).toLocaleString()}</td>
              <td className="px-3 py-2">{r.totalHours}</td>
              <td className="px-3 py-2">{r.payableAmount}</td>
              <td className="px-3 py-2">{r.paidAmount}</td>
              <td className="px-3 py-2">{r.pendingAmount}</td>
              <td className="px-3 py-2">{r.isCustomLogout ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default Reports;
