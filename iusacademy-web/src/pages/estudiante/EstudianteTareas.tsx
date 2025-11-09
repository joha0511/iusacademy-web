// src/pages/estudiante/EstudianteTareas.tsx
import React, { useMemo, useState } from "react";
import { CheckCircle2, Upload, FileText, Clock3, Search, X, PlusCircle } from "lucide-react";

type TaskStatus = "pendiente" | "en_progreso" | "entregado";

type Task = {
  id: string;
  title: string;
  course: string;
  description: string;
  dueISO: string;       // ISO para ordenar
  dueLabel: string;     // etiqueta amigable (ej. "Vie 21, 18:00")
  status: TaskStatus;
  assignedBy: string;   // docente
  submission?: {
    name: string;
    comment?: string;
    filename?: string;
    submittedAtISO: string;
  };
};

export default function EstudianteTareas() {
  // ---------- Datos MOCK (docente asigna) ----------
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "t1",
      title: "Memorial de Demanda (Caso Monitorio #12)",
      course: "Procedimiento Civil",
      description: "Redactar y presentar la demanda siguiendo el formato provisto en clase. Extensión: 2–3 páginas.",
      dueISO: "2025-11-12T18:00:00-04:00",
      dueLabel: "Mié 12, 18:00",
      status: "pendiente",
      assignedBy: "Mg. R. Suárez",
    },
    {
      id: "t2",
      title: "Explicación Oral: Estructura del Memorial",
      course: "Litigación",
      description: "Graba un audio (2–3 min) explicando la estructura de tu memorial y justifica tus decisiones.",
      dueISO: "2025-11-10T20:00:00-04:00",
      dueLabel: "Lun 10, 20:00",
      status: "en_progreso",
      assignedBy: "Lic. V. Flores",
    },
    {
      id: "t3",
      title: "Síntesis de Jurisprudencia sobre Ejecución",
      course: "Práctica Forense",
      description: "Resumen de 1 página con 3 criterios jurisprudenciales relevantes.",
      dueISO: "2025-11-15T17:00:00-04:00",
      dueLabel: "Sáb 15, 17:00",
      status: "pendiente",
      assignedBy: "Dr. A. Mendoza",
    },
    {
      id: "t4",
      title: "Checklist de Audiencia Preparatoria",
      course: "Práctica Forense",
      description: "Sube tu checklist validado después de simular la audiencia.",
      dueISO: "2025-11-09T19:00:00-04:00",
      dueLabel: "Dom 09, 19:00",
      status: "entregado",
      assignedBy: "Mg. R. Suárez",
      submission: {
        name: "Checklist_Audiencia_Preparatoria_JClaros",
        comment: "Incluí observaciones del profesor.",
        filename: "checklist_preparatoria.pdf",
        submittedAtISO: "2025-11-08T21:34:00-04:00",
      },
    },
  ]);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todas" | TaskStatus>("todas");

  // ---------- Modal Entrega ----------
  type Draft = { taskId: string; name: string; comment: string; file?: File | null };
  const [openModal, setOpenModal] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function startSubmit(task: Task) {
    setDraft({
      taskId: task.id,
      name: task.submission?.name || task.title.replace(/\s+/g, "_"),
      comment: task.submission?.comment || "",
      file: undefined,
    });
    setOpenModal(true);
  }

  async function doSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setSubmitting(true);

    // Simulación de subida
    await new Promise((r) => setTimeout(r, 700));

    setTasks((prev) =>
      prev.map((t) =>
        t.id === draft.taskId
          ? {
              ...t,
              status: "entregado",
              submission: {
                name: draft.name.trim() || t.title.replace(/\s+/g, "_"),
                comment: draft.comment?.trim(),
                filename: draft.file?.name,
                submittedAtISO: new Date().toISOString(),
              },
            }
          : t
      )
    );
    setSubmitting(false);
    setOpenModal(false);
    setToast("Tarea entregada correctamente.");
    setTimeout(() => setToast(null), 1800);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks
      .filter((t) => (statusFilter === "todas" ? true : t.status === statusFilter))
      .filter((t) =>
        !q
          ? true
          : [t.title, t.course, t.description, t.assignedBy].some((f) =>
              f.toLowerCase().includes(q)
            )
      )
      .sort((a, b) => a.dueISO.localeCompare(b.dueISO));
  }, [tasks, query, statusFilter]);

  return (
    <main className="et-wrap">
      {/* Header de sección */}
      <header className="et-header">
        <div className="et-titles">
          <h1 className="et-title">
            Tareas
          </h1>
          <p className="et-sub">Asignaciones designadas por tus docentes.</p>
        </div>

        <div className="et-actions">
          <div className="et-search">
            <Search size={16} />
            <input
              placeholder="Buscar por título, curso o docente…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <select
            className="et-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            aria-label="Filtrar por estado"
          >
            <option value="todas">Todas</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_progreso">En progreso</option>
            <option value="entregado">Entregadas</option>
          </select>
        </div>
      </header>

      {/* Cards de tareas */}
      <section className="et-grid">
        {filtered.map((t) => (
          <article className="et-card" key={t.id}>
            <div className="et-card-hd">
              <div className="et-badges">
                <span className={`et-badge ${t.status}`}>
                  {t.status === "pendiente" && <Clock3 size={14} />}
                  {t.status === "en_progreso" && <PlusCircle size={14} />}
                  {t.status === "entregado" && <CheckCircle2 size={14} />}
                  <i />
                  {t.status === "pendiente" ? "Pendiente" : t.status === "en_progreso" ? "En progreso" : "Entregada"}
                </span>
                <span className="et-badge soft">{t.course}</span>
              </div>
              <span className="et-due">
                <Clock3 size={14} />
                <em>Entrega:</em> {t.dueLabel}
              </span>
            </div>

            <h3 className="et-card-title">{t.title}</h3>
            <p className="et-desc">{t.description}</p>

            <div className="et-meta">
              <span className="et-teacher">Asignado por <strong>{t.assignedBy}</strong></span>
              {t.submission?.filename && (
                <span className="et-file">
                  <FileText size={14} />
                  {t.submission.filename}
                </span>
              )}
            </div>

            <div className="et-footer">
              {t.status !== "entregado" ? (
                <button className="et-btn-primary" onClick={() => startSubmit(t)}>
                  <Upload size={16} />
                  Entregar / Subir
                </button>
              ) : (
                <button className="et-btn-ghost" onClick={() => startSubmit(t)}>
                  <Upload size={16} />
                  Re-entregar
                </button>
              )}
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="et-empty">
            No hay resultados para tu búsqueda.
          </div>
        )}
      </section>

      {/* Modal de entrega */}
      {openModal && draft && (
        <div className="et-modal-backdrop" role="dialog" aria-modal="true">
          <div className="et-modal">
            <div className="et-modal-hd">
              <h4>Entregar tarea</h4>
              <button
                className="et-iconbtn"
                onClick={() => setOpenModal(false)}
                aria-label="Cerrar"
                title="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            <form className="et-form" onSubmit={doSubmit}>
              <label>Nombre del entregable</label>
              <input
                value={draft.name}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, name: e.target.value } : d))
                }
                placeholder="Ej. Demanda_JClaros"
                required
              />

              <label>Comentario</label>
              <textarea
                value={draft.comment}
                onChange={(e) =>
                  setDraft((d) => (d ? { ...d, comment: e.target.value } : d))
                }
                placeholder="Notas para el docente (opcional)"
              />

              <label>Archivo</label>
              <div className="et-filebox">
                <input
                  type="file"
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, file: e.target.files?.[0] || null } : d))
                  }
                  required
                />
                <span className="et-filename">
                  {draft.file ? draft.file.name : "Ningún archivo seleccionado"}
                </span>
              </div>

              <div className="et-modal-actions">
                <button
                  type="button"
                  className="et-btn-ghost"
                  onClick={() => setOpenModal(false)}
                >
                  Cancelar
                </button>
                <button className="et-btn-primary" disabled={submitting}>
                  {submitting ? "Enviando…" : "Entregar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="et-toast">{toast}</div>}

      <style>{styles}</style>
    </main>
  );
}

/* =========================================================
   TODO EL ESTILO AQUÍ (no se toca el layout externo).
   Paleta naranja y fondo transparente.
   Clases con prefijo .et- para no interferir con el layout.
   ========================================================= */
const styles = `
:root{
  --et-text:#1F1F1F;
  --et-sub:#6B6B6B;

  --et-primary:#FF8A4C;  /* naranja principal */
  --et-accent:#E36C2D;   /* naranja oscuro */
  --et-soft:#FFEFE6;     /* muy suave para chips */
  --et-soft-2:#FFF6F1;   /* fondos ligeros en hover */
  --et-line:#F2E1D9;     /* bordes suaves */
  --et-white:#FFFFFF;

  --et-ok:#16A34A;
  --et-warn:#B45309;

  --et-shadow-sm:0 6px 18px rgba(0,0,0,.06);
  --et-shadow-md:0 12px 28px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04);
  --et-shadow-lg:0 24px 60px rgba(0,0,0,.10);
}

/* Contenedor de la página de tareas: NO altera el layout padre */
.et-wrap{
  background: transparent;     /* fondo transparente como pediste */
  padding: 1rem 2rem 1.25rem;  /* leve padding interno */
}

/* Header */
.et-header{
  display:flex; flex-wrap:wrap; align-items:end; justify-content:space-between; gap:1rem;
  margin-bottom: .75rem;
}
.et-titles{ display:flex; flex-direction:column; gap:.2rem; }
.et-title{ font-size:1.6rem; font-weight:900; color:var(--et-text); line-height:1; }
.et-sub{ color:var(--et-sub); }

.et-actions{ display:flex; align-items:center; gap:.6rem; }
.et-search{
  display:flex; align-items:center; gap:.5rem;
  background: var(--et-white);
  border:1px solid var(--et-line);
  border-radius:.9rem; padding:.55rem .75rem;
  box-shadow: var(--et-shadow-sm);
}
.et-search input{
  border:none; outline:none; min-width:220px;
}
.et-select{
  border:1px solid var(--et-line);
  border-radius:.8rem; padding:.55rem .7rem; background:var(--et-white);
  box-shadow: var(--et-shadow-sm);
}

/* Grid de cards */
.et-grid{
  display:grid; grid-template-columns: repeat(12, 1fr); gap:1rem;
}
@media (max-width: 1100px){
  .et-grid{ grid-template-columns: repeat(8, 1fr); }
}
@media (max-width: 780px){
  .et-grid{ grid-template-columns: repeat(4, 1fr); }
}
.et-card{
  grid-column: span 6;
  background: var(--et-white);
  border:1px solid var(--et-line);
  border-radius:1rem; padding:1rem;
  box-shadow: var(--et-shadow-md);
  display:flex; flex-direction:column; gap:.65rem;
}
@media (max-width: 780px){
  .et-card{ grid-column: span 4; }
}
.et-card-hd{
  display:flex; align-items:center; justify-content:space-between; gap:.5rem;
}
.et-badges{ display:flex; align-items:center; gap:.4rem; flex-wrap:wrap; }
.et-badge{
  display:inline-flex; align-items:center; gap:.35rem;
  padding:.28rem .55rem; border-radius:999px; font-weight:800; font-size:.8rem;
  border:1px solid transparent; color:#773e20; background: var(--et-soft);
  box-shadow: var(--et-shadow-sm);
}
.et-badge i{ display:inline-block; width:4px; height:4px; border-radius:999px; background:#773e20; }
.et-badge.soft{
  background:#EEF6FF; color:#174A7A; border-color:#D9EAFE;
}
.et-badge.pendiente{ background:#FFF6ED; color:#9A4E13; border-color:#F4D1B7; }
.et-badge.en_progreso{ background:#FFF2EA; color:#924C2B; border-color:#F3D6C7; }
.et-badge.entregado{ background:#EAF9F0; color:#1E6B3B; border-color:#BFEAD1; }

.et-due{ display:inline-flex; align-items:center; gap:.35rem; color:var(--et-sub); font-size:.9rem; }

.et-card-title{ margin:.1rem 0; font-size:1.05rem; font-weight:900; color:var(--et-text); }
.et-desc{ color:var(--et-sub); }

.et-meta{
  display:flex; align-items:center; justify-content:space-between; gap:.75rem; flex-wrap:wrap;
  border-top:1px dashed var(--et-line); padding-top:.6rem;
}
.et-teacher{ color:var(--et-sub); }
.et-file{ display:inline-flex; align-items:center; gap:.35rem; color:#174A7A; font-weight:700; }

.et-footer{ display:flex; justify-content:flex-end; }
.et-btn-primary{
  display:inline-flex; align-items:center; gap:.5rem;
  background:var(--et-primary); color:#fff; border:none; border-radius:.8rem;
  padding:.65rem .9rem; cursor:pointer;
  box-shadow: 0 10px 20px rgba(255,138,76,.22);
}
.et-btn-primary:hover{ background:var(--et-accent); }
.et-btn-ghost{
  display:inline-flex; align-items:center; gap:.5rem;
  background:var(--et-white); color:#5a3a2a; border:1px solid var(--et-line);
  border-radius:.8rem; padding:.6rem .85rem; cursor:pointer;
  box-shadow: var(--et-shadow-sm);
}
.et-btn-ghost:hover{ box-shadow: var(--et-shadow-md); }

/* Vacío */
.et-empty{
  grid-column: 1 / -1; text-align:center; color:var(--et-sub);
  background: var(--et-white); border:1px dashed var(--et-line);
  padding: 1.1rem; border-radius:1rem;
}

/* Modal */
.et-modal-backdrop{
  position:fixed; inset:0; background: rgba(0,0,0,.35);
  display:flex; align-items:center; justify-content:center; z-index:50;
}
.et-modal{
  width: min(92vw, 520px);
  background: var(--et-white); border:1px solid var(--et-line); border-radius:1rem;
  box-shadow: var(--et-shadow-lg); padding: .85rem;
}
.et-modal-hd{
  display:flex; align-items:center; justify-content:space-between; gap:.5rem; margin-bottom:.5rem;
}
.et-modal-hd h4{ margin:0; font-size:1.05rem; font-weight:900; color:var(--et-text); }
.et-iconbtn{
  border:1px solid var(--et-line); background:#fff; border-radius:.6rem; padding:.35rem; cursor:pointer; color:#6b6b6b; box-shadow:var(--et-shadow-sm);
}
.et-iconbtn:hover{ box-shadow:var(--et-shadow-md); }

.et-form{ display:flex; flex-direction:column; gap:.6rem; }
.et-form label{ font-weight:800; color:#4A3A30; font-size:.9rem; }
.et-form input, .et-form textarea, .et-filebox{
  width:100%; border:1px solid var(--et-line); background:#fff; border-radius:.8rem;
  padding:.75rem .85rem; outline:none; box-shadow: var(--et-shadow-sm);
}
.et-form input:focus, .et-form textarea:focus{ border-color: var(--et-primary); box-shadow: var(--et-shadow-md); }
.et-form textarea{ min-height: 90px; resize: vertical; }

.et-filebox{ display:flex; align-items:center; gap:.6rem; }
.et-filename{ color:var(--et-sub); font-size:.9rem; }

.et-modal-actions{
  display:flex; align-items:center; justify-content:flex-end; gap:.5rem; margin-top:.25rem;
}

/* Toast */
.et-toast{
  position: fixed; bottom: 16px; right: 22px;
  background: #053B3F; color:#E6FFFB;
  border-radius:.8rem; padding:.7rem 1rem;
  box-shadow:0 14px 34px rgba(0,0,0,.22);
  font-weight:800;
}

/* Interacciones suaves */
.et-card:hover{ background: var(--et-soft-2); }
.et-search:hover, .et-select:hover{ box-shadow: var(--et-shadow-md); }

/* Ajustes tipográficos sutiles */
.et-card-title, .et-title{ letter-spacing: .2px; }
`;

