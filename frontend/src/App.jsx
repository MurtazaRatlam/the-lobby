import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Sidebar from "./components/Sidebar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Reports from "./pages/Reports.jsx";
import Customers from "./pages/Customers.jsx";
import Products from "./pages/Products.jsx";

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:grid lg:grid-cols-[260px_1fr]">
      <Sidebar />
      <main className="p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#0f172a"
          }
        }}
      />
    </div>
  );
};

export default App;
