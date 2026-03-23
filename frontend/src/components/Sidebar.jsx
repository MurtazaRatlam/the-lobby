import { NavLink } from "react-router-dom";
import { BarChart3, Home, Package, Users } from "lucide-react";
import logo from "./logo (2).png";

const Sidebar = () => {
  const items = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/reports", label: "Reports", icon: BarChart3 },
    { to: "/customers", label: "Customers", icon: Users },
    { to: "/products", label: "Products", icon: Package }
  ];

  const linkClass = ({ isActive }) =>
    [
      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
      isActive
        ? "border-cyan-300 bg-cyan-50 text-cyan-700"
        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
    ].join(" ");

  return (
    <aside className="border-b border-slate-200 bg-white p-4 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-4">
      {/* <h1 className="mb-1 text-2xl font-bold text-cyan-700">The Lobby</h1> */}
      {/* <p className="mb-6 text-xs uppercase tracking-widest text-slate-500">Gaming Management</p> */}
      <img src={logo} alt="The Lobby" className=" h-32 w-42" />
      <nav className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
