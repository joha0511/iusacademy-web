// src/layouts/admin/AdminLayout.tsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Home, User as UserIcon, Settings, FilePlus2, UserPlus,
  LogOut, UserRound, ChevronLeft, ChevronRight
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { meApi, logoutApi } from "../../services/auth";

type MenuItem = { to: string; label: string; icon: LucideIcon; end?: boolean; disabled?: boolean; badge?: number; };

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [firstName, setFirstName] = useState(""); 
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();

  useEffect(() => { (async () => {
    const me = await meApi(); 
    if (!me) return navigate("/login", { replace: true });
    setFirstName(me.firstName || ""); 
    setLastName(me.lastName || "");
  })(); }, [navigate]);

  // Saludo
  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  }, []);

  // 👉 Solo primer nombre y primer apellido
  const firstToken = (firstName || "").trim().split(/\s+/)[0] ?? "";
  const lastToken  = (lastName  || "").trim().split(/\s+/)[0] ?? "";
  const displayName = (firstToken || lastToken) ? `${firstToken} ${lastToken}`.trim() : "Administrador";

  const menu: MenuItem[] = [
    { to: "/admin", label: "Inicio", icon: Home, end: true },
    { to: "/admin/crear-usuario", label: "Crear usuario", icon: UserPlus },
    { to: "/admin/crear-proceso", label: "Crear proceso", icon: FilePlus2 },
    { to: "/admin/perfil", label: "Perfil", icon: UserIcon },
    { to: "/admin/ajustes", label: "Ajustes", icon: Settings },
  ];

  return (
    <div className={`admin-layout page ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="aside" aria-label="Menú principal administrador">
        <div className="header">
          <div className="avatar"><UserRound size={22} /></div>
          <div className="hello">
            {/* ✨ solo estrellitas al lado del saludo */}
            <span className="hi">{greeting} <span aria-hidden className="sparkle">✨</span></span>
            <strong className="who">{displayName}</strong>
          </div>
          <button className="toggle" onClick={() => setCollapsed(s => !s)} title={collapsed ? "Expandir" : "Colapsar"}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div className="section-title">MENÚ</div>

        <nav className="nav">
          {menu.map(({ to, label, icon: Icon, end, disabled, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `item ${isActive ? "active" : ""} ${disabled ? "disabled" : ""}`}
              onClick={e => disabled && e.preventDefault()}
              title={collapsed ? label : undefined}
            >
              <Icon className="ic" size={18} />
              <span className="txt">{label}</span>
              {!collapsed && typeof badge === "number" && badge > 0 && <span className="pill">{badge}</span>}
            </NavLink>
          ))}
        </nav>

        <button className="logout" onClick={async () => { await logoutApi(); navigate("/login", { replace: true }); }}>
          <LogOut className="ic" size={18} /><span className="txt">Salir</span>
        </button>
      </aside>

      <section className="content"><Outlet /></section>

      <style>{layoutStyles}</style>
    </div>
  );
}

const layoutStyles = `
.admin-layout .page{ min-height:100vh; background:#fff; overflow-x:hidden; }
.admin-layout .aside{
  position:fixed; top:20px; left:20px;
  width:250px; height:calc(100vh - 40px);
  background:#fff; box-shadow:0 24px 60px rgba(0,0,0,.12);
  border-radius:22px; padding:12px;
  display:flex; flex-direction:column; gap:8px; overflow:hidden; z-index:10;
}
.admin-layout.is-collapsed .aside{ width:85px; }
.admin-layout .content{ margin-left:calc(250px + 40px); padding:4px 8px 24px 0; }
.admin-layout.is-collapsed .content{ margin-left:calc(85px + 40px); }

.admin-layout .header{ display:grid; grid-template-columns:44px 1fr 30px; align-items:center; gap:8px; }
.admin-layout.is-collapsed .header{ grid-template-columns:44px 30px; }
.admin-layout .avatar{ width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:#FFE3D3;border:1px solid #f6d7c6;color:#8a4d2b; }
.admin-layout .hello{ line-height:1.05; min-width:0; }
.admin-layout .hi{ color:#6B6B6B; font-size:.82rem; display:inline-flex; align-items:center; gap:6px; }
.admin-layout .sparkle{ display:inline-block; transform:translateY(-1px); }
.admin-layout .who{ color:#1E1E1E; font-weight:800; white-space:nowrap; display:block; }
.admin-layout.is-collapsed .hello{ display:none; }

.admin-layout .toggle{ border:none; background:none; cursor:pointer; color:#FF8A4C; }
.admin-layout .section-title{ margin:4px 0;font-size:.78rem;letter-spacing:.12em;color:#8a8a8a;font-weight:800; }
.admin-layout.is-collapsed .section-title{ text-align:center; }

.admin-layout .nav{ display:flex; flex-direction:column; gap:2px; flex:1; }
.admin-layout .item{ display:flex; align-items:center; gap:10px; padding:8px; border-radius:14px; color:#4d4d4d; font-weight:600; text-decoration:none; }
.admin-layout .item:hover .txt, .admin-layout .item:hover .ic{ color:#FF8A4C; }
.admin-layout .item.active .txt, .admin-layout .item.active .ic{ color:#E36C2D; }
.admin-layout .item.disabled{ opacity:.55; cursor:not-allowed; }

.admin-layout .ic{ flex-shrink:0; }
.admin-layout .txt{ white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.admin-layout.is-collapsed .txt{ display:none; }

.admin-layout .pill{ margin-left:auto; background:#ffefe7; border:1px solid #ffd7c2; color:#8a4d2b; border-radius:999px; padding:0 8px; font-size:.75rem; min-width:20px; height:20px; display:grid;place-items:center; }
.admin-layout.is-collapsed .pill{ display:none; }

.admin-layout .logout{ margin-top:auto; display:flex;align-items:center;gap:10px; padding:8px;border-radius:14px;font-weight:700; color:#E36C2D; background:none; border:none; cursor:pointer; }
.admin-layout .logout:hover{ color:#FF8A4C; }
`;
