export default function AdminHome() {
  return (
    <main className="p">
      <h1 className="t">Panel Administrador</h1>
      <p className="s">Accesos rápidos:</p>

      <div className="grid">
        <a href="/admin/crear-usuario" className="card">
          <h3>Crear usuario</h3>
          <p>Registrar administradores, docentes o estudiantes.</p>
        </a>
        <a href="/admin/crear-proceso" className="card">
          <h3>Crear proceso</h3>
          <p>Configura y publica procesos para los usuarios.</p>
        </a>
      </div>

      <style>{`
        .p{ padding:1rem; }
        .t{ font-size:1.6rem; font-weight:800; }
        .s{ margin:.5rem 0 1rem; color:#6B6B6B; }
        .grid{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:1rem; }
        @media(max-width:720px){ .grid{ grid-template-columns: 1fr; } }
        .card{ background:#fff; border:1px solid #F3D7C8; border-radius:1rem; padding:1rem; text-decoration:none; color:#1E1E1E; }
        .card:hover{ border-color:#FF8A4C; box-shadow:0 10px 24px rgba(0,0,0,.06); }
        .card h3{ font-weight:800; margin-bottom:.25rem; }
        .card p{ color:#6B6B6B; }
      `}</style>
    </main>
  );
}
