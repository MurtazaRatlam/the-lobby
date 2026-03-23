import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import PCGrid from "../components/PCGrid";
import LoginModal from "../components/LoginModal";
import LogoutModal from "../components/LogoutModal";
import CustomLogoutModal from "../components/CustomLogoutModal";
import EndSessionPaymentModal from "../components/EndSessionPaymentModal";

const Dashboard = () => {
  const [pcs, setPcs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({
    activePCs: 0,
    todaysSessions: 0,
    todaysEarnings: 0,
    totalPendingAmount: 0
  });
  const [selectedPC, setSelectedPC] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showCustomLogout, setShowCustomLogout] = useState(false);
  const [showEndSessionPayment, setShowEndSessionPayment] = useState(false);
  const [tick, setTick] = useState(0);
  const [products, setProducts] = useState([]);

  const fetchData = async () => {
    const [pcsRes, customersRes, summaryRes, productsRes] = await Promise.all([
      api.get("/pcs"),
      api.get("/customers"),
      api.get("/sessions/dashboard-summary"),
      api.get("/products")
    ]);
    setPcs(pcsRes.data);
    setCustomers(customersRes.data);
    setSummary(summaryRes.data);
    setProducts(productsRes.data);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshPcsOnly = async () => {
    const { data } = await api.get("/pcs");
    setPcs(data);
    setSelectedPC((prev) => {
      if (!prev) return prev;
      const updated = data.find((p) => p.id === prev.id);
      return updated || prev;
    });
  };

  const handleCardClick = (pc) => {
    setSelectedPC(pc);
    if (pc.status === "available") setShowLoginModal(true);
    else setShowLogoutModal(true);
  };

  const closeAll = () => {
    setSelectedPC(null);
    setShowLoginModal(false);
    setShowLogoutModal(false);
    setShowCustomLogout(false);
    setShowEndSessionPayment(false);
  };

  const startSession = async (payload) => {
    try {
      await api.post("/sessions/start", payload);
      toast.success(`Session started on PC${payload.pcId}`);
      closeAll();
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to start session");
    }
  };

  const normalLogout = async (paidAmount) => {
    try {
      const payload = {};
      if (paidAmount !== "") payload.paidAmount = Number(paidAmount);
      await api.patch(`/sessions/${selectedPC.activeSession.id}/logout`, payload);
      toast.success(`Session ended on PC${selectedPC.id}`);
      closeAll();
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to end session");
    }
  };

  const customLogout = async (time) => {
    try {
      const loginDate = new Date(selectedPC.activeSession.loginTime);
      const [hours, minutes] = time.split(":").map(Number);

      const finalLogoutDate = new Date(loginDate);
      finalLogoutDate.setHours(hours, minutes, 0, 0);

      // If chosen time is earlier than login time, carry over to next day.
      if (finalLogoutDate < loginDate) {
        finalLogoutDate.setDate(finalLogoutDate.getDate() + 1);
      }

      await api.patch(`/sessions/${selectedPC.activeSession.id}/logout`, {
        customLogoutTime: finalLogoutDate.toISOString()
      });
      toast.success(`Custom end time saved for PC${selectedPC.id}`);
      closeAll();
      fetchData();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to save custom end time");
    }
  };

  const pauseSession = async () => {
    try {
      await api.post(`/sessions/${selectedPC.activeSession.id}/pause`);
      toast.success(`Session paused on PC${selectedPC.id}`);
      await refreshPcsOnly();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to pause session");
    }
  };

  const resumeSession = async () => {
    try {
      await api.post(`/sessions/${selectedPC.activeSession.id}/resume`);
      toast.success(`Session resumed on PC${selectedPC.id}`);
      await refreshPcsOnly();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resume session");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="mt-1 text-sm text-slate-600">Manage sessions across 15 gaming PCs.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-widest text-slate-600">Active PCs</p>
          <p className="mt-2 text-2xl font-bold">{summary.activePCs}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-widest text-slate-600">Today Sessions</p>
          <p className="mt-2 text-2xl font-bold">{summary.todaysSessions}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-widest text-slate-600">Today Earnings</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">Rs {summary.todaysEarnings}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-widest text-slate-600">Pending Amount</p>
          <p className="mt-2 text-2xl font-bold text-rose-600">Rs {summary.totalPendingAmount}</p>
        </div>
      </div>

      <PCGrid pcs={pcs} onCardClick={handleCardClick} tick={tick} />

      {showLoginModal && selectedPC && (
        <LoginModal
          customers={customers}
          pc={selectedPC}
          onClose={closeAll}
          onSubmit={startSession}
        />
      )}
      {showLogoutModal && selectedPC && (
        <LogoutModal
          pc={selectedPC}
          products={products}
          onSessionProductsChanged={refreshPcsOnly}
          onPause={pauseSession}
          onResume={resumeSession}
          onClose={closeAll}
          onEndNow={async () => {
            await refreshPcsOnly();
            setShowLogoutModal(false);
            setShowEndSessionPayment(true);
          }}
          onCustom={() => {
            setShowLogoutModal(false);
            setShowCustomLogout(true);
          }}
        />
      )}
      {showEndSessionPayment && selectedPC && (
        <EndSessionPaymentModal
          pc={selectedPC}
          tick={tick}
          onClose={closeAll}
          onConfirm={normalLogout}
        />
      )}
      {showCustomLogout && (
        <CustomLogoutModal
          loginTime={selectedPC?.activeSession?.loginTime}
          onClose={closeAll}
          onSubmit={customLogout}
        />
      )}
    </div>
  );
};

export default Dashboard;
