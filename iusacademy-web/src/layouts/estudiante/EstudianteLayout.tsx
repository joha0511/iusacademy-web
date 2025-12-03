// src/layouts/EstudianteLayout.tsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  ListTodo,
  PlayCircle,
  Calendar,
  User as UserIcon,
  Users,
  Bell,
  LogOut,
  UserRound,
  ChevronLeft,
  ChevronRight,
  Bot,
  FileText,
  Gavel,
  ListChecks,
  ChevronDown,
  ShieldCheck,
  ScrollText, // ⬅️ NUEVO icono para Contratos
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { meApi, logoutApi } from "@/services/auth";

type MenuItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  disabled?: boolean;
  badge?: number;
};

export default function EstudianteLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [iaOpen, setIaOpen] = useState(true);
  const [user, setUser] = useState<{ firstName: string; lastName: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const me = await meApi();
      if (!me) {
        navigate("/login", { replace: true });
        return;
      }
      setUser({ firstName: me.firstName, lastName: me.lastName });
    })();
  }, [navigate]);

  useEffect(() => {
    if (collapsed) setIaOpen(false);
  }, [collapsed]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  }, []);

  const menu: MenuItem[] = [
    { to: "/estudiante", label: "Inicio", icon: Home, end: true },
    { to: "/estudiante/tareas", label: "Tareas", icon: ListTodo },
    { to: "/estudiante/simulacion", label: "Simulación", icon: PlayCircle },
    { to: "/estudiante/calendario", label: "Calendario", icon: Calendar },
    { to: "/estudiante/perfil", label: "Perfil", icon: UserIcon },
    { to: "/estudiante/colaboraciones", label: "Colaboraciones", icon: Users, disabled: true },
    { to: "/estudiante/notificaciones", label: "Notificaciones", icon: Bell, disabled: true },
  ];

  return (
    <div className={`page ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="card">
        {/* Header */}
        <div className="header">
          <div className="avatar">
            <UserRound size={22} />
          </div>

          {!collapsed && (
            <div className="hello">
              <span className="hi">
                {greeting}{" "}
                <span aria-hidden="true" className="sparkle">
                  ✨
                </span>
              </span>
              <strong className="who">
                {user?.firstName} {user?.lastName}
              </strong>
            </div>
          )}

          <button className="toggle" onClick={() => setCollapsed((s) => !s)}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div className="section-title">MENÚ</div>

        <nav className="nav">
          {/* Items antes de IA */}
          <NavList items={menu.slice(0, 4)} collapsed={collapsed} />

          {/* ===== Grupo IA (colapsable) ===== */}
          <button
            className={`item ia-head ${iaOpen ? "open" : ""}`}
            onClick={() => !collapsed && setIaOpen((o) => !o)}
            title={collapsed ? "IA" : undefined}
          >
            <Bot className="ic" size={18} />
            {!collapsed && <span className="txt">IA</span>}
            {!collapsed && (
              <ChevronDown className={`chev ${iaOpen ? "rot" : ""}`} size={16} />
            )}
          </button>

          {!collapsed && iaOpen && (
            <div className="submenu">
              {/* Asistente virtual */}
              <NavLink
                to="/estudiante/ia/asistente"
                className={({ isActive }) => `sub-item ${isActive ? "active" : ""}`}
              >
                <Bot size={16} className="sub-ic" />
                <span>Asistente virtual</span>
              </NavLink>

              {/* Revisor de memoriales */}
              <NavLink
                to="/estudiante/ia/revisor"
                className={({ isActive }) => `sub-item ${isActive ? "active" : ""}`}
              >
                <FileText size={16} className="sub-ic" />
                <span>Revisor de memoriales</span>
              </NavLink>

              {/* 🆕 Contratos 📜 */}
              <NavLink
                to="/estudiante/ia/contratos"
                className={({ isActive }) => `sub-item ${isActive ? "active" : ""}`}
              >
                <ScrollText size={16} className="sub-ic" />
                <span>Contratos</span>
              </NavLink>

              {/* Tutor de audiencias */}
              <NavLink
                to="/estudiante/ia/tutorias"
                className={({ isActive }) => `sub-item ${isActive ? "active" : ""}`}
              >
                <Gavel size={16} className="sub-ic" />
                <span>Tutor de audiencias</span>
              </NavLink>

              {/* Generador de quizzes */}
              <NavLink
                to="/estudiante/ia/quiz"
                className={({ isActive }) => `sub-item ${isActive ? "active" : ""}`}
              >
                <ListChecks size={16} className="sub-ic" />
                <span>Generador de quizzes</span>
              </NavLink>

              {/* Detector de IA */}
              <NavLink
                to="/estudiante/ia/detector"
                className={({ isActive }) => `sub-item ${isActive ? "active" : ""}`}
              >
                <ShieldCheck size={16} className="sub-ic" />
                <span>Detector de IA</span>
              </NavLink>
            </div>
          )}

          {/* Resto del menú (Perfil va después de IA) */}
          <NavList items={menu.slice(4)} collapsed={collapsed} />
        </nav>

        <button
          className="logout"
          onClick={async () => {
            await logoutApi();
            navigate("/login");
          }}
          title={collapsed ? "Salir" : undefined}
        >
          <LogOut className="ic" size={18} />
          {!collapsed && <span className="txt">Salir</span>}
        </button>
      </aside>

      <section className="content">
        <Outlet />
      </section>

      <style>{layoutStyles}</style>
    </div>
  );
}

function NavList({ items, collapsed }: { items: MenuItem[]; collapsed: boolean }) {
  return (
    <>
      {items.map(({ to, label, icon: Icon, end, disabled, badge }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `item ${isActive ? "active" : ""} ${disabled ? "disabled" : ""}`
          }
          onClick={(e) => disabled && e.preventDefault()}
          title={collapsed ? label : undefined}
        >
          <Icon className="ic" size={18} />
          {!collapsed && <span className="txt">{label}</span>}
          {!collapsed && typeof badge === "number" && badge > 0 && (
            <span className="pill">{badge}</span>
          )}
        </NavLink>
      ))}
    </>
  );
}

const layoutStyles = `
:root{
  --text:#1E1E1E; --sub:#6B6B6B;
  --primary:#FF8A4C; --accent:#E36C2D;
  --primarySoft:#FFE3D3; --card:#FFFFFF; --bg:#FFFFFF;
  --shadow:0 24px 60px rgba(0,0,0,.12);
  --pad:20px; --gap:40px;
  --aside-w:250px; --aside-w-collapsed:85px; --radius:22px;
}

.page{ min-height:100vh; background:var(--bg); overflow-x:hidden; }

.card{
  position:fixed; top:var(--pad); left:var(--pad);
  width:var(--aside-w); height:calc(100vh - var(--pad)*2);
  background:var(--card); box-shadow:var(--shadow);
  border-radius:var(--radius); padding:12px;
  display:flex; flex-direction:column; gap:8px; overflow:hidden;
}

.page.is-collapsed .card{ width:var(--aside-w-collapsed); }

.content{
  margin-left:calc(var(--aside-w) + var(--gap));
  padding:4px 8px 24px 0;
}
.page.is-collapsed .content{
  margin-left:calc(var(--aside-w-collapsed) + var(--gap));
}

.header{
  display:grid; grid-template-columns:44px 1fr 30px;
  align-items:center; gap:8px;
}
.page.is-collapsed .header{ grid-template-columns:44px 30px; }

.avatar{
  width:44px;height:44px;border-radius:12px;
  display:grid;place-items:center;
  background:var(--primarySoft);
  border:1px solid #f6d7c6; color:#8a4d2b;
}

.hello{ line-height:1.05; min-width:0; }
.hi{ color:var(--sub); font-size:.82rem; display:inline-flex; align-items:center; gap:6px; }
.sparkle{ display:inline-block; transform:translateY(-1px); }
.who{ color:var(--text); font-weight:800; white-space:nowrap; }

.toggle{ border:none; background:none; cursor:pointer; color:var(--primary); }

.section-title{
  margin:4px 0;font-size:.78rem;letter-spacing:.12em;
  color:#8a8a8a;font-weight:800;
}

.nav{ display:flex;flex-direction:column;gap:2px;flex:1; }

.item{
  display:flex;align-items:center;gap:10px;
  padding:8px;border-radius:14px;
  color:#4d4d4d;font-weight:600;text-decoration:none;
}
.item:hover .txt, .item:hover .ic{ color:var(--primary); }
.item.active .txt, .item.active .ic{ color:var(--accent); }
.item.disabled{ opacity:.55; cursor:not-allowed; }

.ic{ flex-shrink:0; }
.txt{ white-space:nowrap; }
.page.is-collapsed .txt{ display:none; }

.pill{
  margin-left:auto; background:#ffefe7; border:1px solid #ffd7c2;
  color:#8a4d2b; border-radius:999px; padding:0 8px;
  font-size:.75rem; min-width:20px; height:20px;
  display:grid;place-items:center;
}
.page.is-collapsed .pill{ display:none; }

.ia-head{
  position:relative;
  display:flex; align-items:center; gap:10px;
  padding:8px; border-radius:14px; font-weight:700;
  background:none; border:none; text-align:left; cursor:pointer;
  color:#3f3f3f;
}
.ia-head:hover { color:var(--primary); }
.ia-head .chev { margin-left:auto; transition:transform .18s ease; }
.ia-head .chev.rot { transform:rotate(180deg); }

.submenu{
  margin-left:6px;
  padding-left:10px;
  border-left:1px solid #eaeaea;
  display:flex; flex-direction:column; gap:2px;
}

.sub-item{
  display:flex; align-items:center; gap:8px;
  padding:6px 6px; border-radius:12px;
  font-size:.92rem; color:#4d4d4d; text-decoration:none;
}
.sub-item:hover{ background:#f7f7f7; }
.sub-item.active{ background:#f2f2f2; color:var(--accent); }
.sub-item.disabled{ opacity:.55; cursor:not-allowed; }
.sub-ic{ flex-shrink:0; }

.logout{
  margin-top:auto; display:flex;align-items:center;gap:10px;
  padding:8px;border-radius:14px;font-weight:700;
  color:#E36C2D; background:none; border:none; cursor:pointer;
}
.logout:hover{ color:#FF8A4C; }
`;

