import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Home, ListTodo, PlayCircle, Calendar,
  User as UserIcon, Users, Bell, StickyNote, FolderKanban,
  LogOut, UserRound, ChevronLeft, ChevronRight
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

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
  }, []);

  const menu: MenuItem[] = [
    { to: "/estudiante", label: "Inicio", icon: Home, end: true },
    // 👇 SIN badge
    { to: "/estudiante/tareas", label: "Tareas", icon: ListTodo },
    { to: "/estudiante/simulacion", label: "Simulación", icon: PlayCircle },
    { to: "/estudiante/calendario", label: "Calendario", icon: Calendar },
    { to: "/estudiante/perfil", label: "Perfil", icon: UserIcon },
    { to: "/estudiante/colaboraciones", label: "Colaboraciones", icon: Users, disabled: true },
    { to: "/estudiante/notificaciones", label: "Notificaciones", icon: Bell, disabled: true },
    { to: "/estudiante/pizarra", label: "Pizarra", icon: StickyNote, disabled: true },
    { to: "/estudiante/proyectos", label: "Proyectos", icon: FolderKanban, disabled: true },
  ];

  return (
    <div className={`page ${collapsed ? "is-collapsed" : ""}`}>
      <aside className="card">
        {/* Header */}
        <div className="header">
          <div className="avatar"><UserRound size={22} /></div>

          {!collapsed && (
            <div className="hello">
              {/* ✨ al lado del saludo */}
              <span className="hi">
                {greeting} <span aria-hidden="true" className="sparkle">✨</span>
              </span>
              {/* Nombre y apellido juntos, sin wrap */}
              <strong className="who">{user?.firstName} {user?.lastName}</strong>
            </div>
          )}

          <button className="toggle" onClick={() => setCollapsed(s => !s)}>
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
              className={({ isActive }) =>
                `item ${isActive ? "active" : ""} ${disabled ? "disabled" : ""}`
              }
              onClick={e => disabled && e.preventDefault()}
              title={collapsed ? label : undefined}
            >
              <Icon className="ic" size={18} />
              {!collapsed && <span className="txt">{label}</span>}
              {/* La pill solo aparece si hay número definido y > 0 */}
              {!collapsed && typeof badge === "number" && badge > 0 && (
                <span className="pill">{badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <button className="logout"
          onClick={async () => { await logoutApi(); navigate("/login"); }}
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
.who{ color:var(--text); font-weight:800; white-space:nowrap; }  /* <- evita salto entre nombre y apellido */

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

.logout{
  margin-top:auto; display:flex;align-items:center;gap:10px;
  padding:8px;border-radius:14px;font-weight:700;
  color:var(--accent); background:none; border:none; cursor:pointer;
}
.logout:hover{ color:var(--primary); }
`;
