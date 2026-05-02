import {
  BadgeIndianRupee,
  BarChart3,
  CreditCard,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  PiggyBank,
  ReceiptText,
  Tags,
  TrendingUp
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/expenses", label: "Expenses", icon: ReceiptText },
  { to: "/income", label: "Income", icon: TrendingUp },
  { to: "/budget-savings", label: "Budget & Savings", icon: PiggyBank },
  { to: "/bills", label: "Bills", icon: FolderKanban },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/categories", label: "Categories", icon: Tags }
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <BadgeIndianRupee size={22} />
          </span>
          <div>
            <strong>FinTrack</strong>
            <small>Expense manager</small>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink className="nav-link" to={item.to} key={item.to}>
              <item.icon size={19} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <span>{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
            <div>
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
          <button className="nav-link logout-button" type="button" onClick={handleLogout}>
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="content">
        <div className="content-topline">
          <div>
            <span className="eyebrow">Financial command center</span>
            <h1>Welcome back, {user?.name?.split(" ")[0] || "there"}</h1>
          </div>
          <div className="topline-metric">
            <BarChart3 size={18} />
            Live data
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
