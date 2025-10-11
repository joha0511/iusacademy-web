import { Outlet } from "react-router-dom";
import SidebarLink from "../shared/SidebarLink";

export default function DocenteLayout() {
  return (
    <div className="ly">
      <aside className="sb">
        <h2 className="sb-title">Docente</h2>
        <nav className="sb-nav">
          <SidebarLink to="/docente">Inicio</SidebarLink>
          <SidebarLink to="/docente/crear-proceso">Crear proceso</SidebarLink>
          <SidebarLink to="/docente/estudiantes">Lista de estudiantes</SidebarLink>
          <SidebarLink to="/docente/designar-proceso">Designar proceso</SidebarLink>
          <SidebarLink to="/docente/dashboard">Dashboard</SidebarLink>
        </nav>
      </aside>
      <section className="ct"><Outlet /></section>

      <style>{`
        :root{ --bg:#FFF8F5; --primary:#FF8A4C; --border:#F3D7C8; }
        .ly{ min-height:calc(100vh - 64px); display:grid; grid-template-columns: 260px 1fr; }
        .sb{ border-right:1px solid var(--border); background:#fff; padding:1rem; }
        .sb-title{ font-weight:800; color:var(--primary); margin-bottom:.5rem; }
        .sb-nav{ display:flex; flex-direction:column; gap:.25rem; }
        .ct{ padding:1.25rem; background:var(--bg); }
        @media(max-width:900px){ .ly{ grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
