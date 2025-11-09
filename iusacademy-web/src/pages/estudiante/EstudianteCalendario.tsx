// src/pages/estudiante/EstudianteCalendario.tsx
import React, { useMemo, useState } from "react";

/** ================== Tipos ================== */
type Categoria = "simulador" | "tarea" | "personal" | "extra";
type View = "dia" | "hoy" | "todas";

type Tarea = {
  id: string;
  titulo: string;
  detalle?: string;
  fecha: string;      // YYYY-MM-DD
  hora: string;       // HH:mm (solo inicio)
  categoria: Categoria;
  done: boolean;
};

type Draft = Partial<Tarea> & { id?: string };

/** ================== Utils ================== */
const todayISO = () => ymd(new Date());

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}
function parseYMD(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addMonths(base: Date, delta: number) {
  const d = new Date(base);
  d.setMonth(d.getMonth() + delta);
  return d;
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function startOfWeekMonday(d: Date) {
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const diff = (day + 6) % 7; // 0 for Mon
  const nd = new Date(d);
  nd.setDate(d.getDate() - diff);
  nd.setHours(0, 0, 0, 0);
  return nd;
}
function formatMonthYearEs(d: Date) {
  return d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}
function formatDayShortEs(d: Date) {
  const wd = d.toLocaleDateString("es-ES", { weekday: "long" });
  const day = String(d.getDate()).padStart(2, "0");
  return `${wd} ${day}`;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}
function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/** ================== Datos Mock ================== */
const MOCK_TAREAS: Tarea[] = [
  {
    id: "t1",
    titulo: "Resolver caso Monitorio #12",
    detalle: "Entregar en PDF.",
    fecha: todayISO(),
    hora: "18:00",
    categoria: "tarea",
    done: false,
  },
  {
    id: "t2",
    titulo: "Práctica de simulador: Audiencia preparatoria",
    detalle: "Entrenar 30 min en módulo de objeciones.",
    fecha: todayISO(),
    hora: "19:30",
    categoria: "simulador",
    done: false,
  },
  {
    id: "t3",
    titulo: "Reunión breve de equipo",
    detalle: "Sincrónica por Meet.",
    fecha: ymd(new Date(new Date().setDate(new Date().getDate() + 2))),
    hora: "08:30",
    categoria: "personal",
    done: false,
  },
  {
    id: "t4",
    titulo: "Lectura: Recurso de apelación (cap. 2)",
    detalle: "Subrayar y traer dudas.",
    fecha: ymd(new Date(new Date().setDate(new Date().getDate() + 5))),
    hora: "20:00",
    categoria: "extra",
    done: false,
  },
  {
    id: "t5",
    titulo: "Subir memorial de demanda (borrador)",
    detalle: "Formato .docx o .pdf.",
    fecha: todayISO(),
    hora: "17:15",
    categoria: "tarea",
    done: false,
  },
];

/** ================== Componente ================== */
export default function EstudianteCalendario() {
  // Mes visible y día seleccionado
  const [current, setCurrent] = useState<Date>(startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const [view, setView] = useState<View>("dia"); // "dia" | "hoy" | "todas"

  // Datos
  const [tareas, setTareas] = useState<Tarea[]>(MOCK_TAREAS);

  // UI: modal/agregar/editar
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>({ fecha: todayISO(), hora: "18:00", categoria: "tarea" });

  const firstDayOfGrid = useMemo(
    () => startOfWeekMonday(startOfMonth(current)),
    [current]
  );
  const lastDayOfGrid = useMemo(() => {
    const end = endOfMonth(current);
    const tail = (7 - ((end.getDay() + 6) % 7) - 1 + 7) % 7; // completar hasta domingo
    const nd = new Date(end);
    nd.setDate(end.getDate() + tail);
    return nd;
  }, [current]);

  const days: Date[] = useMemo(() => {
    const arr: Date[] = [];
    const d = new Date(firstDayOfGrid);
    while (d <= lastDayOfGrid) {
      arr.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return arr;
  }, [firstDayOfGrid, lastDayOfGrid]);

  // Mapa de contadores por día
  const mapCount = useMemo(() => {
    const m = new Map<string, { total: number; pending: number; byCat: Record<Categoria, number> }>();
    tareas.forEach(t => {
      const it = m.get(t.fecha) || { total: 0, pending: 0, byCat: { simulador: 0, tarea: 0, personal: 0, extra: 0 } };
      it.total += 1;
      if (!t.done) it.pending += 1;
      it.byCat[t.categoria] += 1;
      m.set(t.fecha, it);
    });
    return m;
  }, [tareas]);

  // Lista visible (dia / hoy / todas futuras pendientes)
  const tareasVisibles = useMemo(() => {
    const base = [...tareas].sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
    if (view === "todas") {
      const today = todayISO();
      return base.filter(t => !t.done && t.fecha >= today);
    }
    if (view === "hoy") return base.filter(t => t.fecha === todayISO());
    return base.filter(t => t.fecha === selectedDate);
  }, [tareas, selectedDate, view]);

  // Click día => vista "dia"
  function onClickDay(key: string) {
    setSelectedDate(key);
    setView("dia");
  }

  function openNew(date?: string) {
    setEditingId(null);
    setDraft({ fecha: date || selectedDate, hora: "18:00", categoria: "tarea" });
    setShowModal(true);
  }
  function openEdit(t: Tarea) {
    setEditingId(t.id);
    setDraft({ ...t });
    setShowModal(true);
  }
  function saveDraft(e: React.FormEvent) {
    e.preventDefault();
    const base: Tarea = {
      id: editingId ?? `t${Math.random().toString(36).slice(2, 8)}`,
      titulo: (draft.titulo || "").trim() || "Sin título",
      detalle: (draft.detalle || "").trim(),
      fecha: draft.fecha || todayISO(),
      hora: draft.hora || "18:00",
      categoria: (draft.categoria || "tarea") as Categoria,
      done: !!draft.done,
    };
    setTareas(prev => {
      if (editingId) return prev.map(t => (t.id === editingId ? base : t));
      return [base, ...prev];
    });
    setSelectedDate(base.fecha);
    setShowModal(false);
    setEditingId(null);
  }
  function delTask(id: string) {
    setTareas(prev => prev.filter(t => t.id !== id));
  }
  function toggleDone(id: string) {
    setTareas(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  const weekNames = ["L", "M", "M", "J", "V", "S", "D"];

  // Resumen categorías
  const catSummary = useMemo(() => {
    const res: Record<Categoria, { total: number; pending: number }> = {
      simulador: { total: 0, pending: 0 },
      tarea: { total: 0, pending: 0 },
      personal: { total: 0, pending: 0 },
      extra: { total: 0, pending: 0 },
    };
    tareas.forEach(t => {
      res[t.categoria].total += 1;
      if (!t.done) res[t.categoria].pending += 1;
    });
    const delivered = tareas.filter(t => t.done).length;
    const pending = tareas.length - delivered;
    return { res, delivered, pending, total: tareas.length };
  }, [tareas]);

  return (
    <div className="ecal">
      <div className="ecal__wrap fade-in">
        {/* Calendario (izquierda) */}
        <section className="cal-card slide-in">
          <div className="cal-header">
            <div className="cal-title-row">
              <h2 className="cal-title">{capitalize(formatMonthYearEs(current))}</h2>
              <div className="cal-nav">
                <button className="btn-icon" title="Mes anterior" onClick={() => setCurrent(addMonths(current, -1))}>‹</button>
                <button className="btn-soft" onClick={() => { setCurrent(startOfMonth(new Date())); setSelectedDate(todayISO()); setView("hoy"); }}>Hoy</button>
                <button className="btn-icon" title="Mes siguiente" onClick={() => setCurrent(addMonths(current, 1))}>›</button>
              </div>
            </div>
            <div className="cal-actions">
              <button className="btn-primary" onClick={() => openNew()}>Agregar</button>
            </div>
          </div>

          {/* Leyenda */}
          <div className="legend">
            <div className="legend-item"><i className="legend-dot simulador" />Simulador <span className="legend-count">({catSummary.res.simulador.pending}/{catSummary.res.simulador.total})</span></div>
            <div className="legend-item"><i className="legend-dot tarea" />Tarea <span className="legend-count">({catSummary.res.tarea.pending}/{catSummary.res.tarea.total})</span></div>
            <div className="legend-item"><i className="legend-dot personal" />Personal <span className="legend-count">({catSummary.res.personal.pending}/{catSummary.res.personal.total})</span></div>
            <div className="legend-item"><i className="legend-dot extra" />Extra <span className="legend-count">({catSummary.res.extra.pending}/{catSummary.res.extra.total})</span></div>
          </div>

          <div className="cal-grid">
            {weekNames.map((w, i) => (
              <div key={i} className="wname">{w}</div>
            ))}

            {days.map((d, i) => {
              const key = ymd(d);
              const isCurrentMonth = d.getMonth() === current.getMonth();
              const isToday = isSameDay(d, new Date());
              const isSelected = key === selectedDate && view !== "todas";
              const info = mapCount.get(key);
              return (
                <button
                  key={i}
                  className={[
                    "cell",
                    isSelected ? "sel" : "",
                    !isCurrentMonth ? "muted" : "",
                    isToday ? "today" : ""
                  ].join(" ")}
                  onClick={() => onClickDay(key)}
                >
                  <span className="daynum">{d.getDate()}</span>
                  <span className="dots">
                    {info?.byCat.simulador ? <i className="dot simulador" /> : null}
                    {info?.byCat.tarea ? <i className="dot tarea" /> : null}
                    {info?.byCat.personal ? <i className="dot personal" /> : null}
                    {info?.byCat.extra ? <i className="dot extra" /> : null}
                  </span>
                  {info?.pending ? <span className="pend" title={`${info.pending} pendiente(s)`}></span> : null}
                </button>
              );
            })}
          </div>
        </section>

        {/* Panel derecho (alto completo, scroll SOLO en la lista) */}
        <aside className="side slide-in">
          <div className="side__head">
            <div className="date-row">
              <div className="side__date">
                {view === "todas"
                  ? "Todas las tareas"
                  : formatDayShortEs(view === "hoy" ? new Date() : parseYMD(selectedDate))}
              </div>
              <div className="filters">
                <button
                  className={`pill ${view === "todas" ? "active" : ""}`}
                  onClick={() => setView("todas")}
                >
                  Todas
                </button>
                <button
                  className={`pill ${view === "hoy" ? "active" : ""}`}
                  onClick={() => { setView("hoy"); setSelectedDate(todayISO()); setCurrent(startOfMonth(new Date())); }}
                >
                  Hoy
                </button>
                <button
                  className={`pill ${view === "dia" ? "active" : ""}`}
                  onClick={() => setView("dia")}
                >
                  Día
                </button>
              </div>
            </div>

            <div className="mini-stats">
              <div className="stat"><span className="k">Pendientes</span><span className="v">{catSummary.pending}</span></div>
              <div className="stat"><span className="k">Entregadas</span><span className="v">{catSummary.delivered}</span></div>
              <div className="stat"><span className="k">Totales</span><span className="v">{catSummary.total}</span></div>
            </div>
          </div>

          {/* (Sin botón Agregar aquí) */}

          <div className="side__list">
            {tareasVisibles.length === 0 && <div className="empty">No hay tareas para esta vista.</div>}

            {tareasVisibles.map(t => (
              <div key={t.id} className={`task ${t.categoria} ${t.done ? "done" : ""} fade-in`}>
                <div className="task__row">
                  <span className="badge">{capitalize(t.categoria)}</span>
                  <div className="task__time">
                    {formatDayShortEs(parseYMD(t.fecha))} · {t.hora}
                  </div>
                </div>
                <h3 className="task__title">{t.titulo}</h3>
                {t.detalle ? <p className="task__detail">{t.detalle}</p> : null}

                <div className="task__actions">
                  <button className="btn-soft" onClick={() => toggleDone(t.id)}>
                    {t.done ? "Marcar como pendiente" : "Marcar como completada"}
                  </button>
                  <div className="gap"></div>
                  <button className="btn-icon" title="Editar" onClick={() => openEdit(t)}>✎</button>
                  <button className="btn-icon danger" title="Eliminar" onClick={() => delTask(t.id)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="modal__backdrop" onClick={() => setShowModal(false)}>
          <div className="modal scale-in" onClick={e => e.stopPropagation()}>
            <div className="modal__head">
              <h3>{editingId ? "Editar tarea" : "Nueva tarea"}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={saveDraft} className="form">
              <label>Título</label>
              <input
                value={draft.titulo || ""}
                onChange={e => setDraft(d => ({ ...d, titulo: e.target.value }))}
                placeholder="Ej: Resolver caso Monitorio #12"
                required
              />

              <label>Detalle</label>
              <textarea
                value={draft.detalle || ""}
                onChange={e => setDraft(d => ({ ...d, detalle: e.target.value }))}
                placeholder="Instrucciones del docente…"
                rows={3}
              />

              <div className="row2">
                <div>
                  <label>Fecha</label>
                  <input
                    type="date"
                    value={draft.fecha || todayISO()}
                    onChange={e => setDraft(d => ({ ...d, fecha: e.target.value }))}
                  />
                </div>
                <div>
                  <label>Hora (inicio)</label>
                  <input
                    type="time"
                    value={draft.hora || "18:00"}
                    onChange={e => setDraft(d => ({ ...d, hora: e.target.value }))}
                  />
                </div>
              </div>

              <label>Categoría</label>
              <div className="chips">
                {(["simulador", "tarea", "personal", "extra"] as Categoria[]).map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`chip ${draft.categoria === c ? "active" : ""} ${c}`}
                    onClick={() => setDraft(d => ({ ...d, categoria: c }))}
                  >
                    {capitalize(c)}
                  </button>
                ))}
              </div>

              <div className="modal__actions">
                <button type="button" className="btn-soft" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-primary" type="submit">{editingId ? "Guardar cambios" : "Crear"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{styles}</style>
    </div>
  );
}

/** ================== ESTILOS ================== */
const styles = `
/* Root transparente, sin tocar el layout global */
.ecal{
  background: transparent;
  /* Mantén el módulo encajado en la ventana: */
  block-size: calc(100dvh - 90px); /* usa dVH para móviles; ajusta 90px si tu header es diferente */
  padding: 10px 10px 0 0;
}

/* Animaciones */
@keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
@keyframes slidein { from { transform: translateY(6px); opacity:.0 } to { transform: translateY(0); opacity:1 } }
@keyframes scalein { from { transform: scale(.98); opacity:.0 } to { transform: scale(1); opacity:1 } }
.fade-in { animation: fadein .24s ease-out; }
.slide-in { animation: slidein .28s ease-out; }
.scale-in { animation: scalein .18s ease-out; }

/* Contenedor a altura fija: evita que la página principal haga scroll */
.ecal__wrap{
  display:flex; gap:1rem; align-items:stretch;
  inline-size: 100%;
  block-size: 100%;           /* <- clave: ocupa toda la altura disponible del .ecal */
  min-block-size: 0;          /* <- permite que los hijos usen min-height:0 */
  overflow: hidden;           /* <- evita scroll externo */
}

/* ===== Calendario (izquierda) ===== */
.cal-card{
  flex: 1 1 66%;
  background:#fff; border:1px solid #f1e6de; border-radius:16px;
  padding:14px; box-shadow: 0 12px 28px rgba(0,0,0,.06), 0 2px 6px rgba(0,0,0,.03);
  display:flex; flex-direction:column;
  min-block-size: 0;          /* <- no forzar altura mínima, ayuda al flex */
  overflow: hidden;           /* <- calendario queda “quieto” */
}
.cal-header{
  display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin-bottom:.25rem;
}
.cal-title-row{ display:flex; align-items:center; gap:.75rem; }
.cal-title{ font-size:1.25rem; font-weight:900; text-transform:capitalize; margin:0; }
.cal-nav{ display:flex; align-items:center; gap:.45rem; }
.cal-actions{ display:flex; align-items:center; gap:.45rem; }

/* Leyenda */
.legend{
  display:flex; flex-wrap:wrap; gap:.8rem 1rem; margin:.5rem 0 .7rem;
}
.legend-item{ display:flex; align-items:center; gap:.45rem; font-size:.9rem; }
.legend-count{ color:#7b7b7b; font-weight:600; }
.legend-dot{
  width:12px; height:12px; border-radius:999px; display:inline-block; border:1px solid rgba(0,0,0,.08);
}
.legend-dot.simulador{ background:#ffe3d4; border-color:#f7b08b; }
.legend-dot.tarea{     background:#e6f0ff; border-color:#9cc9f5; }
.legend-dot.personal{  background:#e8f8ee; border-color:#b7e3c3; }
.legend-dot.extra{     background:#eee8ff; border-color:#cfb7ff; }

/* Botones */
.btn-primary{
  background:#FF8A4C; color:#fff; border:none; border-radius:12px;
  padding:.55rem .9rem; font-weight:800; cursor:pointer;
  box-shadow:0 10px 22px rgba(255,138,76,.22);
  transition: filter .15s ease, transform .04s ease;
}
.btn-primary:hover{ filter: brightness(.98); }
.btn-primary:active{ transform: translateY(1px); }

.btn-soft{
  background:#fff; color:#4a3a32; border:1px solid #eadcd4; border-radius:12px;
  padding:.45rem .75rem; cursor:pointer; box-shadow:0 6px 14px rgba(0,0,0,.05);
  transition: box-shadow .15s ease, transform .04s ease;
}
.btn-soft:hover{ box-shadow:0 10px 22px rgba(0,0,0,.07); }
.btn-soft:active{ transform: translateY(1px); }

.btn-icon{
  background:#fff; border:1px solid #eadcd4; border-radius:12px;
  padding:.35rem .55rem; cursor:pointer; line-height:1; box-shadow:0 6px 14px rgba(0,0,0,.05);
  transition: box-shadow .15s ease, transform .04s ease;
}
.btn-icon:hover{ box-shadow:0 10px 22px rgba(0,0,0,.07); }
.btn-icon:active{ transform: translateY(1px); }
.btn-icon.danger{ color:#9a2626; }

/* Grid calendario */
.cal-grid{
  display:grid;
  grid-template-columns: repeat(7, 1fr);
  gap:.5rem;
  flex: 1;                    /* ocupa el resto del alto disponible */
  min-block-size: 0;          /* <- permite a los hijos usar su propio overflow si hiciera falta */
}
.wname{
  font-weight:800; font-size:.8rem; color:#7b7b7b; padding:.25rem .25rem .35rem;
  text-align:center;
}
.cell{
  position:relative;
  block-size:84px;
  border:1px solid #f1e6de; border-radius:14px;
  background:#fff; text-align:left; padding:.5rem; cursor:pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,.03);
  transition: transform .08s ease, box-shadow .15s ease, border-color .15s ease;
}
.cell:hover{ transform: translateY(-1px); box-shadow: 0 8px 18px rgba(0,0,0,.06); }
.cell.muted{ opacity:.5; }
.daynum{ font-weight:900; color:#2b2b2b; font-size:.95rem; }
.today{ outline: 2px dashed #FF8A4C; outline-offset: 2px; }
.sel{ border-color:#FF8A4C; box-shadow: 0 0 0 3px rgba(255,138,76,.16); }

/* puntos por categoría */
.dots{
  position:absolute; left:.5rem; bottom:.45rem; display:flex; gap:.28rem;
}
.dot{ width:8px; height:8px; border-radius:999px; display:inline-block; opacity:.9; border:1px solid rgba(0,0,0,.05); }
.dot.simulador{ background:#ffd7c5; border-color:#f7b08b; }
.dot.tarea{ background:#d9ecff; border-color:#9cc9f5; }
.dot.personal{ background:#e4f7e9; border-color:#b7e3c3; }
.dot.extra{ background:#efe6ff; border-color:#cfb7ff; }

/* indicador de pendientes */
.pend{
  position:absolute; right:.45rem; top:.45rem;
  width:8px; height:8px; border-radius:999px; background:#E36C2D;
}

/* ===== Panel derecho ===== */
.side{
  flex: 0 1 34%;
  display:flex; flex-direction:column; gap:.75rem;
  min-block-size: 0;          /* <- importantísimo: permite que side__list sea el que scrollee */
}
.side__head{
  background:#fff; border:1px solid #f1e6de; border-radius:16px; padding:.8rem .9rem;
  display:flex; flex-direction:column; gap:.55rem;
  box-shadow: 0 10px 24px rgba(0,0,0,.05);
  flex: 0 0 auto;             /* altura fija del header lateral */
}
.date-row{ display:flex; align-items:center; justify-content:space-between; gap:.75rem; }
.side__date{ font-weight:900; text-transform:capitalize; font-size:1.05rem; }

.filters{ display:flex; align-items:center; gap:.4rem; }
.pill{
  background:#fff; border:1px solid #eadcd4; border-radius:999px;
  padding:.28rem .65rem; cursor:pointer; font-weight:700; font-size:.85rem;
  transition: box-shadow .15s ease, transform .04s ease, background .15s ease, border-color .15s;
}
.pill:hover{ box-shadow:0 8px 18px rgba(0,0,0,.06); }
.pill:active{ transform: translateY(1px); }
.pill.active{ border-color:#FF8A4C; box-shadow:0 0 0 3px rgba(255,138,76,.14); background:#fff8f4; }

.mini-stats{
  display:flex; align-items:center; gap:.6rem; flex-wrap:wrap;
}
.stat{
  background:#fff; border:1px solid #eadcd4; border-radius:10px; padding:.35rem .55rem;
  display:flex; align-items:center; gap:.45rem; font-size:.85rem;
}
.stat .k{ color:#6b6b6b; font-weight:700; }
.stat .v{ font-weight:900; }

/* SOLO la lista tiene scroll interno */
.side__list{
  flex: 1 1 auto;             /* ocupa todo el alto restante del aside */
  min-block-size: 0;          /* <- sin esto, el flex-hijo no podrá scrollear */
  background:#fff; border:1px solid #f1e6de; border-radius:16px;
  padding:.9rem; 
  overflow-y: auto;           /* <- scroll solo aquí */
  overscroll-behavior: contain; /* <- evita “arrastrar” el scroll al body */
  box-shadow: 0 12px 28px rgba(0,0,0,.06);
  scroll-behavior:smooth;
}
.empty{ color:#7b7b7b; text-align:center; padding:1rem; }

.task{
  border:1px solid #f0e2d9; border-radius:14px; padding:.75rem .8rem; margin-bottom:.65rem;
  box-shadow: 0 6px 14px rgba(0,0,0,.05);
  transition: box-shadow .15s ease, transform .04s ease;
}
.task:hover{ box-shadow: 0 10px 22px rgba(0,0,0,.07); }
.task.done{ opacity:.65; }
.task__row{ display:flex; align-items:center; justify-content:space-between; gap:.5rem; margin-bottom:.35rem; }
.badge{
  display:inline-block; font-size:.72rem; font-weight:800; padding:.18rem .5rem; border-radius:999px;
  border:1px solid #eadcd4; color:#694f45; background:#fff7f2;
}
.task.simulador .badge{ background:#ffe9de; border-color:#f7b08b; color:#8a4d2b; }
.task.tarea .badge{ background:#eef6ff; border-color:#9cc9f5; color:#1b4a7a; }
.task.personal .badge{ background:#eaf9f0; border-color:#b7e3c3; color:#1d6b3d; }
.task.extra .badge{ background:#f1ecff; border-color:#cfb7ff; color:#473b80; }

.task__time{
  font-weight:900; background:#fff; border:1px solid #eadcd4; padding:.24rem .55rem; border-radius:10px;
}
.task__title{ margin:.1rem 0 .25rem; font-size:1rem; font-weight:900; }
.task__detail{ color:#6b6b6b; font-size:.9rem; }

.task__actions{
  display:flex; align-items:center; gap:.4rem; margin-top:.5rem;
}
.task__actions .gap{ flex:1; }

/* ===== Modal ===== */
.modal__backdrop{
  position:fixed; inset:0; background:rgba(0,0,0,.18); display:flex; align-items:center; justify-content:center;
  z-index:50;
}
.modal{
  width:min(560px, 92vw);
  background:#fff; border:1px solid #f1e6de; border-radius:16px; padding:.9rem;
  box-shadow: 0 24px 64px rgba(0,0,0,.22);
}
.modal__head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:.6rem; }
.modal__head h3{ font-size:1.1rem; font-weight:900; margin:0; }
.form label{ font-weight:800; font-size:.9rem; display:block; margin:.35rem 0 .2rem; }
.form input, .form textarea{
  width:100%; border:1px solid #eadcd4; border-radius:12px; padding:.65rem .75rem; outline:none;
  box-shadow: 0 6px 14px rgba(0,0,0,.04);
}
.form textarea{ resize:vertical; }
.row2{ display:grid; grid-template-columns:1fr 1fr; gap:.6rem; }
@media(max-width:780px){ .row2{ grid-template-columns:1fr; } }

.chips{ display:flex; flex-wrap:wrap; gap:.4rem; margin:.2rem 0 .3rem; }
.chip{
  border:1px solid #eadcd4; background:#fff; border-radius:999px; padding:.35rem .7rem; cursor:pointer;
  transition: box-shadow .15s ease, transform .04s ease, border-color .15s ease;
}
.chip:hover{ box-shadow:0 8px 18px rgba(0,0,0,.06); }
.chip:active{ transform: translateY(1px); }
.chip.active{ border-color:#FF8A4C; box-shadow: 0 0 0 3px rgba(255,138,76,.14); }
.chip.simulador{ background:#ffe9de; }
.chip.tarea{ background:#eef6ff; }
.chip.personal{ background:#eaf9f0; }
.chip.extra{ background:#f1ecff; }

.modal__actions{ display:flex; align-items:center; justify-content:flex-end; gap:.5rem; margin-top:.6rem; }
`;
