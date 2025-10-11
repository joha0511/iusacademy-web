import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { meApi, logoutApi } from "@/api"; // asegúrate de tener este archivo

type User = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: string;
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // ✅ Obtener usuario autenticado desde el backend
  useEffect(() => {
    (async () => {
      try {
        const me = await meApi();
        if (!me) {
          navigate("/login", { replace: true });
          return;
        }
        setUser(me);
      } catch {
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate]);

  // ✅ Logout
  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className={`admin-wrap${collapsed ? " is-collapsed" : ""}`}>
      <aside className="admin-sb">
        {/* Header */}
        <div className="admin-sb__brand">
          <div className="admin-sb__avatar">IA</div>
          {!collapsed && (
            <div className="admin-sb__name">
              <strong>
                {user
                  ? `${user.firstName.split(" ")[0]} ${user.lastName.split(" ")[0]}`
                  : "Cargando..."}
              </strong>
              <span className="muted">@{user?.username ?? "usuario"}</span>
            </div>
          )}
          <button
            className="sb-toggle"
            onClick={() => setCollapsed((s) => !s)}
            aria-label={collapsed ? "Expandir menú" : "Minimizar menú"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              {collapsed ? (
                <path d="M7 12l5 5 5-5H7z" fill="currentColor" />
              ) : (
                <path d="M7 10l5-5 5 5H7zm0 4h10l-5 5-5-5z" fill="currentColor" />
              )}
            </svg>
          </button>
        </div>

        {/* Navegación */}
        <nav className="admin-sb__nav">
          <SBLink to="/admin" label="Inicio" collapsed={collapsed} end>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M12 3l9 8h-3v9h-5v-6H11v6H6v-9H3l9-8z"
                fill="currentColor"
              />
            </svg>
          </SBLink>

          <SBLink to="/admin/perfil" label="Perfil" collapsed={collapsed}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.4 0-8 2.3-8 5v1h16v-1c0-2.7-3.6-5-8-5z"
                fill="currentColor"
              />
            </svg>
          </SBLink>

          <SBLink to="/admin/crear-usuario" label="Usuario" collapsed={collapsed}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M16 11a4 4 0 10-3.9-5 6 6 0 00-6.5 6V14h6v-2a4 4 0 014.4-1zM2 18v2h20v-2c0-3.3-6.7-5-10-5S2 14.7 2 18z"
                fill="currentColor"
              />
            </svg>
          </SBLink>

          <SBLink to="/admin/crear-proceso" label="Proceso" collapsed={collapsed}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M9 3h6a2 2 0 012 2v1h3a2 2 0 012 2v4h-9v2h9v5a2 2 0 01-2 2H4a2 2 0 01-2-2v-5h9v-2H2V8a2 2 0 012-2h3V5a2 2 0 012-2zm6 3V5H9v1h6z"
                fill="currentColor"
              />
            </svg>
          </SBLink>

          <SBLink to="/admin/ajustes" label="Ajustes" collapsed={collapsed}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M12 8a4 4 0 100 8 4 4 0 000-8zm8.9 4a6.9 6.9 0 00-.1-1l2-1.6-2-3.4-2.4 1a7.3 7.3 0 00-1.7-1L14.2 2h-4.4L8.3 5a7.3 7.3 0 00-1.7 1l-2.4-1-2 3.4 2 1.6a6.9 6.9 0 000 2L2.2 15l2 3.4 2.4-1a7.3 7.3 0 001.7 1l1.5 3h4.4l1.5-3a7.3 7.3 0 001.7-1l2.4 1 2-3.4-2-1.6a6.9 6.9 0 00.1-1z"
                fill="currentColor"
              />
            </svg>
          </SBLink>
        </nav>

        {/* Logout */}
        <button className="sb-logout" onClick={logout}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path
              d="M10 17l1.4-1.4-2.6-2.6H21v-2H8.8l2.6-2.6L10 7l-5 5 5 5z"
              fill="currentColor"
            />
            <path
              d="M4 4h8V2H4a2 2 0 00-2 2v16a2 2 0 002 2h8v-2H4V4z"
              fill="currentColor"
            />
          </svg>
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>

      {/* Estilos conservados */}
      <style>{`
        :root{
          --bg:#FFF8F5; --text:#1E1E1E; --sub:#6B6B6B;
          --primary:#FF8A4C; --accent:#E36C2D;
          --border:#F3D7C8; --soft:#FFE3D3; --white:#fff;
        }
        .admin-wrap{ min-height:100vh; display:grid; grid-template-columns:260px 1fr; background:var(--bg); transition:grid-template-columns .2s ease; }
        .admin-wrap.is-collapsed{ grid-template-columns:84px 1fr; }
        .admin-sb{ position:sticky; top:0; height:100vh; background:var(--white); border-right:1px solid var(--border); padding:1rem; display:flex; flex-direction:column; gap:1rem; }
        .admin-sb__brand{ display:flex; align-items:center; gap:.75rem; padding:.25rem; }
        .admin-sb__avatar{ width:44px; height:44px; border-radius:12px; display:grid; place-items:center; font-weight:900; color:#fff; background:var(--primary); }
        .admin-sb__name{ display:flex; flex-direction:column; line-height:1.1; }
        .muted{ color:var(--sub); font-size:.85rem; }
        .sb-toggle{ margin-left:auto; border:1px solid var(--border); background:#fff; color:#6b6b6b; border-radius:.6rem; padding:.35rem; cursor:pointer; }
        .admin-sb__nav{ display:flex; flex-direction:column; gap:.25rem; margin-top:.5rem; }
        .sb-link{ display:flex; align-items:center; gap:.75rem; padding:.65rem .9rem; border-radius:.7rem; color:#514f4d; text-decoration:none; font-weight:700; transition:background .2s, color .2s; }
        .sb-link:hover{ background:var(--soft); color:var(--text); }
        .sb-link.active{ background:var(--primary); color:#fff; }
        .admin-wrap.is-collapsed .sb-link{ justify-content:center; padding:.65rem .5rem; }
        .admin-wrap.is-collapsed .sb-link span{ display:none; }
        .sb-logout{ margin-top:auto; border:1px solid var(--border); background:#fff; color:#b0361e; font-weight:800; padding:.7rem .9rem; border-radius:.7rem; cursor:pointer; display:flex; align-items:center; gap:.5rem; }
        .sb-logout:hover{ background:#fff1ec; border-color:#ffcbb9; }
        .admin-main{ padding:1.25rem; }
      `}</style>
    </div>
  );
}

/** 🔹 Componente para los enlaces del menú */
function SBLink({
  to,
  label,
  children,
  collapsed,
  end,
}: {
  to: string;
  label: string;
  children: React.ReactNode;
  collapsed: boolean;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => "sb-link" + (isActive ? " active" : "")}
      title={collapsed ? label : undefined}
    >
      {children}
      <span>{label}</span>
    </NavLink>
  );
}
