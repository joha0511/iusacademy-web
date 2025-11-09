// src/pages/admin/AdminCrearProceso.tsx
import { useMemo, useState } from "react";

interface NewProceso {
  nombre: string;
  descripcion: string;
  inicio: string; // yyyy-mm-dd
  fin: string;    // yyyy-mm-dd
}
interface ProcesoRow {
  id: string;
  nombre: string;
  descripcion: string;
  inicio: string;
  fin: string;
  estado: "borrador" | "publicado";
}

export default function AdminCrearProceso() {
  // --------- estado ---------
  const [open, setOpen] = useState(true); // panel abierto
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const empty: NewProceso = { nombre: "", descripcion: "", inicio: "", fin: "" };
  const [form, setForm] = useState<NewProceso>(empty);

  const [procesos, setProcesos] = useState<ProcesoRow[]>([]);
  const [q, setQ] = useState("");

  // --------- validación (igual UX que usuarios) ---------
  type FormErrors = Partial<Record<keyof NewProceso, string>>;
  const [errors, setErrors] = useState<FormErrors>({});
  const nombreRe = /^.{4,}$/; // mínimo 4 caract.
  function validate(v: NewProceso): FormErrors {
    const e: FormErrors = {};
    if (!nombreRe.test(v.nombre)) e.nombre = "Ingresa un nombre válido (mín. 4 caracteres).";
    if (!v.descripcion.trim()) e.descripcion = "Describe el proceso.";
    if (!v.inicio) e.inicio = "Selecciona fecha de inicio.";
    if (!v.fin) e.fin = "Selecciona fecha de fin.";
    if (v.inicio && v.fin && v.fin < v.inicio) e.fin = "La fecha fin no puede ser anterior al inicio.";
    return e;
  }

  // --------- helpers ---------
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const v = validate(form);
    if (Object.keys(v).length) {
      setErrors(v);
      setErr("Revisa los campos marcados.");
      return;
    }
    setLoading(true);
    try {
      // Simulación de guardado (conecta luego con tu API)
      await new Promise((r) => setTimeout(r, 350));
      const row: ProcesoRow = {
        id: `p_${Date.now()}`,
        ...form,
        estado: "borrador",
      };
      setProcesos((prev) => [row, ...prev]);
      setForm(empty);
      setMsg("Proceso creado como borrador.");
    } catch (e: any) {
      setErr(e?.message || "Error al crear proceso");
    } finally {
      setLoading(false);
    }
  };

  const publicar = (id: string) => {
    setProcesos((prev) => prev.map((p) => (p.id === id ? { ...p, estado: "publicado" } : p)));
  };

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return procesos;
    return procesos.filter((p) =>
      [p.nombre, p.descripcion].some((f) => f.toLowerCase().includes(s))
    );
  }, [procesos, q]);

  return (
    <main className="cp-page">
      {/* Header */}
      <header className="hdr">
        <div className="ttl-wrap">
          <h1 className="ttl">Procesos</h1>
          <p className="sub">Crea, publica y gestiona procesos del simulador.</p>
        </div>
        <button className="btn-cta" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span>Nuevo proceso</span>
        </button>
      </header>

      {/* Panel formulario (mismo estilo que usuarios) */}
      <section className={`panel ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="panel__inner">
          <div className="panel__hdr">
            <h2 className="panel__ttl">Crear proceso</h2>
            <button
              className="iconbtn"
              onClick={() => setOpen((s) => !s)}
              aria-label="Cerrar panel"
              title="Cerrar"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <form className="form" onSubmit={submit} noValidate>
            <div className="grid">
              <div className="col">
                <label>Nombre del proceso</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={onChange}
                  placeholder="Proceso Civil I – Grupo A"
                  className={errors.nombre ? "invalid" : ""}
                />
                {errors.nombre && <small className="err-txt">{errors.nombre}</small>}
              </div>

              <div className="col">
                <label>Fecha de inicio</label>
                <input
                  type="date"
                  name="inicio"
                  value={form.inicio}
                  onChange={onChange}
                  className={errors.inicio ? "invalid" : ""}
                />
                {errors.inicio && <small className="err-txt">{errors.inicio}</small>}
              </div>

              <div className="col">
                <label>Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={onChange}
                  rows={4}
                  placeholder="Objetivo, alcance, fases del simulador…"
                  className={errors.descripcion ? "invalid" : ""}
                />
                {errors.descripcion && <small className="err-txt">{errors.descripcion}</small>}
              </div>

              <div className="col">
                <label>Fecha de fin</label>
                <input
                  type="date"
                  name="fin"
                  value={form.fin}
                  onChange={onChange}
                  className={errors.fin ? "invalid" : ""}
                />
                {errors.fin && <small className="err-txt">{errors.fin}</small>}
              </div>
            </div>

            {err && <div className="alert err">{err}</div>}
            {msg && <div className="alert ok">{msg}</div>}

            <div className="actions">
              <button className="btn-primary" disabled={loading}>
                {loading ? "Guardando…" : "Guardar borrador"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Filtro simple y tabla en caja blanca con sombra */}
      <section className="table-controls">
        <div className="search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path d="M21 20l-5.6-5.6a7 7 0 10-1.4 1.4L20 21l1-1zM5 10a5 5 0 1110 0A5 5 0 015 10z" fill="currentColor" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o descripción…"
          />
        </div>
      </section>

      <div className="box data-table">
        <div className="thead">
          <span>Nombre</span>
          <span>Inicio</span>
          <span>Fin</span>
          <span>Estado</span>
          <span className="center">Acciones</span>
        </div>

        {filtrados.map((p) => (
          <div className="tr" key={p.id}>
            <span>{p.nombre}</span>
            <span>{p.inicio || "-"}</span>
            <span>{p.fin || "-"}</span>
            <span className={`estado ${p.estado}`}>{p.estado}</span>
            <span className="acts">
              {p.estado === "borrador" && (
                <button className="iconbtn publish" onClick={() => publicar(p.id)} title="Publicar">
                  Publicar
                </button>
              )}
            </span>
          </div>
        ))}
        {filtrados.length === 0 && <div className="empty">No hay procesos.</div>}
      </div>

      <style>{styles}</style>
    </main>
  );
}

const styles = `
:root{
  --text:#1E1E1E; --sub:#6B6B6B;
  --primary:#FF8A4C; --accent:#E36C2D; --white:#fff;
  /* Sombras como en Usuarios */
  --shadow-sm: 0 4px 12px rgba(0,0,0,.06);
  --shadow-md: 0 12px 28px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04);
  --shadow-lg: 0 24px 60px rgba(0,0,0,.10);
}

/* Contenedor principal (no fondo extra, sólo padding) */
.cp-page{ padding:1rem; }

/* Header */
.hdr{ display:flex; align-items:end; justify-content:space-between; gap:1rem; margin-bottom:.75rem; }
.ttl-wrap{ display:flex; flex-direction:column; gap:.2rem; }
.ttl{ font-size:1.7rem; font-weight:900; line-height:1; }
.sub{ color:#8a8a8a; font-size:.95rem; }
.btn-cta{
  display:inline-flex; align-items:center; gap:.5rem;
  background:var(--primary); color:#fff; font-weight:900;
  border:none; border-radius:.8rem; padding:.65rem 1rem; cursor:pointer;
  box-shadow:0 10px 20px rgba(255,138,76,.25);
}
.btn-cta:hover{ background:var(--accent); }

/* Panel (igual look que Usuarios) */
.panel{
  background:#fff; border:1px solid #eadcd4; border-radius:1rem;
  overflow:hidden; max-height:0; transition:max-height .35s ease, box-shadow .2s;
  box-shadow:0 0 0 rgba(0,0,0,0); margin-bottom:1rem;
}
.panel.open{ max-height:980px; box-shadow:var(--shadow-md); }
.panel__inner{ padding:1rem; }
.panel__hdr{ display:flex; align-items:center; justify-content:space-between; }
.panel__ttl{ font-weight:800; margin:0 0 .75rem; }
.iconbtn{
  border:1px solid #eadcd4; background:#fff; border-radius:.6rem; padding:.45rem .6rem;
  cursor:pointer; color:#6b6b6b;
}
.iconbtn:hover{ box-shadow:var(--shadow-sm); }

/* Form */
.form{ display:block; }
.grid{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:1rem; }
@media(max-width:900px){ .grid{ grid-template-columns: 1fr; } }
label{ font-size:.9rem; font-weight:700; display:block; margin-bottom:.25rem; }
input, textarea{
  width:100%; padding:.9rem 1rem; border-radius:.9rem;
  border:1px solid #eadcd4; outline:none; background:#fff;
}
textarea{ resize:vertical; }
input:focus, textarea:focus{ border-color:var(--primary); box-shadow:0 0 0 3px rgba(255,138,76,.22); }
.invalid{ border-color:#ff6565 !important; box-shadow:0 0 0 3px rgba(255,101,101,.18) !important; }
.err-txt{ color:#b02020; font-size:.8rem; margin-top:.25rem; display:block; }

.actions{ margin-top:1rem; display:flex; gap:.6rem; }
.btn-primary{
  background:var(--primary); color:#fff; font-weight:900; border:none;
  padding:.9rem 1.1rem; border-radius:.9rem; cursor:pointer;
  box-shadow:0 10px 20px rgba(255,138,76,.22);
}
.btn-primary:hover{ background:var(--accent); }

.alert{ margin-top:.6rem; padding:.65rem .9rem; border-radius:.7rem; }
.ok{ color:#12a150; background:#e6faef; border:1px solid #bfead1; }
.err{ color:#8a1f1f; background:#ffe6e6; border:1px solid #ffc7c7; }

/* Controles + Tabla (caja blanca elevada) */
.table-controls{
  display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin:.2rem 0 .6rem;
}
.search{
  flex:1; display:flex; align-items:center; gap:.6rem;
  background:#fff; border:1px solid #eadcd4; border-radius:.9rem;
  padding:.55rem .8rem; box-shadow: var(--shadow-md);
}
.search input{ border:none; outline:none; width:100%; min-width:180px; }

.box{
  background:#fff; border:1px solid #eadcd4; border-radius:1rem;
  box-shadow:var(--shadow-md); overflow:hidden;
}
.data-table .thead, .data-table .tr{
  display:grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap:.5rem; padding:.85rem 1rem; align-items:center;
}
.data-table .thead{ background:#FFF2EA; font-weight:800; }
.data-table .tr{ border-top:1px solid #f5e5dc; }
.center{ text-align:center; }
.empty{ padding:1rem; text-align:center; color:#7a7a7a; }

.estado{
  text-transform:capitalize; font-weight:800;
  padding:.28rem .65rem; border-radius:999px; display:inline-block; text-align:center;
}
.estado.borrador{ background:#FFF7E6; color:#885b08; }
.estado.publicado{ background:#eaf9f0; color:#1d6b3d; }

.acts{ display:flex; gap:.4rem; justify-content:center; }
.iconbtn.publish{ font-weight:700; }
`;
