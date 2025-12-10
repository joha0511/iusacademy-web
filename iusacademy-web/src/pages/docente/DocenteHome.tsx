import { Users, ClipboardList, FilePlus2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function DocenteHome() {
  return (
    <main className="doc-home">
      {/* TÍTULO */}
      <header className="doc-hdr">
        <h1 className="doc-h1">Panel Docente</h1>
        <p className="doc-sub">Gestión de cursos y procesos académicos.</p>
      </header>

      {/* ACCIONES RÁPIDAS */}
      <section className="doc-actions">
        <Link to="/docente/crear-proceso" className="doc-card">
          <div className="doc-ico"><FilePlus2 size={20} /></div>
          <div>
            <h3 className="doc-card-title">Crear proceso</h3>
            <p className="doc-card-desc">Crea un nuevo proceso académico.</p>
          </div>
        </Link>

        <Link to="/docente/estudiantes" className="doc-card">
          <div className="doc-ico"><Users size={20} /></div>
          <div>
            <h3 className="doc-card-title">Lista de estudiantes</h3>
            <p className="doc-card-desc">Consulta los estudiantes asignados.</p>
          </div>
        </Link>

        <Link to="/docente/designar-proceso" className="doc-card">
          <div className="doc-ico"><ClipboardList size={20} /></div>
          <div>
            <h3 className="doc-card-title">Designar proceso</h3>
            <p className="doc-card-desc">Asignar procesos a los grupos.</p>
          </div>
        </Link>
      </section>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
  .doc-home{
    padding: 1.5rem;
  }

  .doc-hdr{
    margin-bottom: 1.25rem;
  }

  .doc-h1{
    font-size: 1.7rem;
    font-weight: 900;
    color: #1E1E1E;
    margin: 0;
  }

  .doc-sub{
    margin-top: 4px;
    color:#6B6B6B;
    font-size: .95rem;
  }

  .doc-actions{
    display:grid;
    gap:1rem;
    grid-template-columns:1fr;
  }

  @media(min-width:700px){
    .doc-actions{ grid-template-columns: repeat(3, 1fr); }
  }

  .doc-card{
    display:flex;
    align-items:flex-start;
    gap:.9rem;
    padding:1rem;
    background:white;
    border-radius:14px;
    border:1px solid #F3D7C8;
    text-decoration:none;
    box-shadow: 0 6px 16px rgba(0,0,0,.06);
    transition: all .15s ease;
  }

  .doc-card:hover{
    border-color:#FF8A4C;
    box-shadow:0 8px 20px rgba(255,138,76,.18);
  }

  .doc-ico{
    padding:.6rem;
    border-radius:12px;
    background:#FFE3D3;
    color:#E36C2D;
    display:flex;
    align-items:center;
    justify-content:center;
  }

  .doc-card-title{
    margin:0;
    font-weight:700;
    color:#1E1E1E;
    font-size:1rem;
  }

  .doc-card-desc{
    margin:3px 0 0;
    font-size:.85rem;
    color:#6B6B6B;
  }
`;
