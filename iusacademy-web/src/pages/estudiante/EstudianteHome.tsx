import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { CheckCircle2, Clock3, Plus } from "lucide-react";

/** -------------------------------------------------------
 *  Datos MOCK (predeterminados)
 *  ------------------------------------------------------*/
type Task = { id: string; title: string; due: string; course?: string; done: boolean };
const MOCK_HOURS_THIS_WEEK = 6.5; // horas en el simulador esta semana
const MOCK_LAST_ACCURACY = 82;    // % acierto última audiencia
const MOCK_TASKS: Task[] = [
  { id: "t1", title: "Resolver caso Monitorio #12", due: "Hoy 18:00", course: "Procedimiento Civil", done: false },
  { id: "t2", title: "Subir memorial de demanda (borrador)", due: "Mañana", course: "Litigación", done: false },
  { id: "t3", title: "Revisar feedback de audiencia pasada", due: "Vie 17", course: "Práctica Forense", done: true },
];

/** -------------------------------------------------------
 *  Página: EstudianteHome
 *  ------------------------------------------------------*/
export default function EstudianteHome() {
  const [hoursThisWeek] = useState<number>(MOCK_HOURS_THIS_WEEK);
  const [lastAccuracy] = useState<number>(MOCK_LAST_ACCURACY);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);

  const pendingCount = useMemo(() => tasks.filter(t => !t.done).length, [tasks]);

  const pieData = useMemo(() => ([
    { name: "Aciertos", value: lastAccuracy, key: "ok" },
    { name: "Errores", value: 100 - lastAccuracy, key: "err" },
  ]), [lastAccuracy]);

  const weekBars = useMemo(() => ([
    { d: "Lun", h: 1.2 },
    { d: "Mar", h: 0.8 },
    { d: "Mié", h: 1.1 },
    { d: "Jue", h: 1.5 },
    { d: "Vie", h: 1.0 },
    { d: "Sáb", h: 0.6 },
    { d: "Dom", h: 0.3 },
  ]), []);

  function toggleTask(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  return (
    <div className="eh-root">
      {/* Header sin sticky para no mover tu layout */}
      <header className="eh-hdr">
        <h1 className="eh-h1">Panel del Estudiante</h1>
        <p className="eh-sub">Resumen de tu actividad</p>
      </header>

      <main className="eh-main">
        {/* KPIs */}
        <section className="eh-grid-3">
          <Stat
            label="Horas en simulador (semana)"
            value={<><span>{hoursThisWeek}</span><span className="eh-unit"> h</span></>}
            hint="Objetivo recomendado: 8 h/semana"
            right={<ProgressBar value={(hoursThisWeek / 8) * 100} />}
          />

          <Stat
            label="Acierto última audiencia"
            value={<><span>{lastAccuracy}</span><span className="eh-unit">%</span></>}
            hint="Sigue practicando para superar el 90%"
            right={
              <div className="eh-mini-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {/* Los colores vienen de CSS vars */}
                      <linearGradient id="eh-grad-mini" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" style={{ stopColor: "var(--brand-400)", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "var(--brand-500)", stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={pieData} dataKey="value" innerRadius={26} outerRadius={38}
                      paddingAngle={2} startAngle={90} endAngle={-270}
                    >
                      {pieData.map((slice, i) => (
                        <Cell
                          key={slice.key}
                          fill={i === 0 ? "var(--brand-400)" : "var(--brand-500)"}
                        />
                      ))}
                    </Pie>
                    <RTooltip formatter={(v: any, n: any) => [`${v}%`, n]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            }
          />

          <Stat
            label="Tareas pendientes"
            value={<>{pendingCount}<span className="eh-unit"> {pendingCount === 1 ? "tarea" : "tareas"}</span></>}
            hint="Marca como completadas para mantenerte al día"
            right={<CheckCircle2 className="eh-ok-ico" size={18} />}
          />
        </section>

        {/* Gráficos principales */}
        <section className="eh-grid-2-1">
          <motion.div
            className="eh-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .35 }}
          >
            <div className="eh-card-hdr">
              <h2 className="eh-h2">Tiempo en el simulador (últimos 7 días)</h2>
            </div>
            <div className="eh-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekBars} barSize={18}>
                  <defs>
                    <linearGradient id="eh-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" style={{ stopColor: "var(--brand-400)", stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: "var(--brand-500)", stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--grid)" vertical={false} />
                  <XAxis dataKey="d" tick={{ fill: "var(--subtext)" }} tickLine={false} axisLine={{ stroke: "var(--axis)" }} />
                  <YAxis tick={{ fill: "var(--subtext)" }} tickLine={false} axisLine={{ stroke: "var(--axis)" }} unit="h" />
                  <RTooltip cursor={{ fill: "var(--cursor)" }} formatter={(v: any) => [`${v} h`, "Tiempo"]} />
                  <Bar dataKey="h" radius={[8, 8, 0, 0]} fill="url(#eh-grad)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            className="eh-card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .35 }}
          >
            <h2 className="eh-h2 mb">Aciertos vs. Errores</h2>
            <div className="eh-chart-pie">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    isAnimationActive
                    data={pieData}
                    cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                    paddingAngle={3} dataKey="value"
                  >
                    {pieData.map((slice, i) => (
                      <Cell
                        key={slice.key}
                        fill={i === 0 ? "var(--brand-400)" : "var(--brand-500)"}
                      />
                    ))}
                  </Pie>
                  <RTooltip formatter={(v: any, n: any) => [`${v}%`, n]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="eh-legend">
              <div className="eh-legend-item"><span className="eh-dot ok" />Aciertos</div>
              <div className="eh-legend-item"><span className="eh-dot err" />Errores</div>
            </div>
          </motion.div>
        </section>

        {/* Tareas */}
        <section className="eh-card">
          <div className="eh-list-hdr">
            <div>
              <h2 className="eh-h2">Tareas pendientes</h2>
              <p className="eh-sub-mini">{pendingCount} {pendingCount === 1 ? "tarea" : "tareas"} por completar</p>
            </div>
            <button
              className="eh-btn"
              onClick={() => setTasks(prev => [
                { id: `t${prev.length + 1}`, title: "Nueva práctica rápida", due: "Próxima semana", course: "Simulador", done: false },
                ...prev
              ])}
            >
              <Plus size={16} /> Añadir tarea
            </button>
          </div>

          <ul className="eh-list">
            {tasks.map(t => (
              <TaskItem key={t.id} task={t} onToggle={toggleTask} />
            ))}
          </ul>
        </section>

        {/* Tip */}
        <section className="eh-tip">
          <p className="eh-text">
            Consejo: programa sesiones cortas de 25–30 min para mejorar tu <span className="eh-strong">ritmo de aciertos</span>.
          </p>
        </section>
      </main>

      <style>{styles}</style>
    </div>
  );
}

/** -------------------------------------------------------
 *  Subcomponentes (sin estilos inline; todo va a CSS abajo)
 *  ------------------------------------------------------*/
function Stat({ label, value, hint, right }: {
  label: string; value: React.ReactNode; hint?: string; right?: React.ReactNode;
}) {
  return (
    <motion.div
      className="eh-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .35 }}
    >
      <div className="eh-stat">
        <div>
          <p className="eh-sub-mini">{label}</p>
          <div className="eh-kpi">{value}</div>
          {hint ? <p className="eh-hint">{hint}</p> : null}
        </div>
        {right}
      </div>
    </motion.div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="eh-progress">
      <div className="eh-progress-track">
        <motion.div
          className="eh-progress-bar"
          style={{ width: `${clamped}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  return (
    <li className="eh-task">
      <label className="eh-task-lbl">
        <input
          type="checkbox"
          className="eh-checkbox"
          checked={task.done}
          onChange={() => onToggle(task.id)}
        />
        <div className="eh-task-body">
          <p className={`eh-task-title ${task.done ? "done" : ""}`}>{task.title}</p>
          <p className="eh-task-meta">{task.course ? `${task.course} · ` : ""}Fecha límite: {task.due}</p>
        </div>
      </label>
      {task.done
        ? <CheckCircle2 className="eh-ico-ok" size={18} />
        : <Clock3 className="eh-ico-warn" size={18} />}
    </li>
  );
}

/* =========================================================
   STYLES (todo centralizado aquí) — Fondo TRANSPARENTE
   ========================================================= */
const styles = `
:root{
  /* Colores base */
  --text:#1f1f1f;
  --subtext:#6B6B6B;

  /* Marca (naranjas) — usadas en charts y acentos */
  --brand-400:#FF8A4C;
  --brand-500:#E36C2D;

  /* UI neutrales */
  --panel:#ffffff;            /* tarjetas */
  --bg:transparent;           /* <<< fondo transparente solicitado */
  --line:#EADCD4;
  --grid:#F1E4DB;
  --axis:#F0E0D8;
  --cursor:#FFF2EA;

  /* Estados */
  --ok:#059669;
  --warn:#B45309;

  /* Tip */
  --tip-bg:#FFEFE6;
  --tip-br:#F6D9C9;

  /* Sombras */
  --shadow-sm:0 4px 12px rgba(0,0,0,.06);
  --shadow-md:0 12px 28px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04);
}

/* Root de la página: sin padding global para no desplazar tu layout */
.eh-root{ background:var(--bg); width:100%; }

/* Header sin sticky para que no mueva el layout exterior */
.eh-hdr{ padding:16px 0 8px 0; border-bottom:1px solid var(--line); background:transparent; }
.eh-h1{ font-size:1.5rem; font-weight:900; color:var(--text); margin:0; }
.eh-sub{ margin:.25rem 0 0; color:var(--subtext); font-size:.95rem; }

/* Main */
.eh-main{ padding:20px 28px 20px 0; display:flex; flex-direction:column; gap:16px; }

/* Grid secciones */
.eh-grid-3{
  display:grid; grid-template-columns: repeat(1, minmax(0,1fr)); gap:12px;
}
@media(min-width:768px){
  .eh-grid-3{ grid-template-columns: repeat(3, minmax(0,1fr)); }
}
.eh-grid-2-1{
  display:grid; gap:12px; grid-template-columns: 1fr;
}
@media(min-width:1024px){
  .eh-grid-2-1{ grid-template-columns: 2fr 1fr; }
}

/* Card genérica */
.eh-card{
  background:var(--panel);
  border:1px solid transparent;
  border-radius:16px;
  padding:16px;
  box-shadow:var(--shadow-md);
}

/* Mini encabezados y textos */
.eh-h2{ margin:0; font-size:1.05rem; font-weight:700; color:var(--text); }
.mb{ margin-bottom:12px; }
.eh-sub-mini{ color:var(--subtext); font-size:.85rem; margin:2px 0 0; }
.eh-hint{ color:var(--subtext); font-size:.78rem; margin-top:4px; }
.eh-kpi{ margin-top:4px; font-size:1.6rem; font-weight:700; color:var(--text); }
.eh-unit{ font-size:.95rem; font-weight:500; color:var(--subtext); margin-left:4px; }

/* Stat layout */
.eh-stat{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }

/* Botón primario (añadir tarea) */
.eh-btn{
  display:inline-flex; align-items:center; gap:8px;
  padding:8px 12px; border:none; border-radius:12px;
  background:var(--brand-400); color:#fff; font-weight:700; cursor:pointer;
  box-shadow:0 10px 20px rgba(255,138,76,.22);
}
.eh-btn:hover{ background:var(--brand-500); }

/* Chart wrappers */
.eh-card-hdr{ display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; }
.eh-chart{ width:100%; height:256px; }
.eh-chart-pie{ width:100%; height:224px; }
.eh-mini-chart{ width:112px; height:80px; }

/* Leyenda */
.eh-legend{ display:flex; align-items:center; justify-content:center; gap:16px; font-size:.9rem; margin-top:8px; }
.eh-legend-item{ display:flex; align-items:center; gap:8px; }
.eh-dot{ width:10px; height:10px; border-radius:999px; display:inline-block; }
.eh-dot.ok{ background:var(--brand-400); }
.eh-dot.err{ background:var(--brand-500); }

/* Lista de tareas */
.eh-list-hdr{
  padding-bottom:12px; border-bottom:1px solid var(--tip-br);
  display:flex; align-items:center; justify-content:space-between; gap:12px;
}
.eh-list{ padding:0; margin:0; list-style:none; }
.eh-task{
  display:flex; align-items:flex-start; justify-content:space-between; gap:12px;
  padding:12px 0; border-bottom:1px solid var(--tip-br);
}
.eh-task:last-child{ border-bottom:none; }
.eh-task-lbl{ display:flex; align-items:flex-start; gap:12px; cursor:pointer; width:100%; }
.eh-checkbox{ margin-top:3px; width:16px; height:16px; accent-color:var(--brand-400); }
.eh-task-body{ flex:1; }
.eh-task-title{ margin:0; color:var(--text); font-size:.95rem; }
.eh-task-title.done{ color:var(--subtext); text-decoration: line-through; }
.eh-task-meta{ margin:2px 0 0; font-size:.8rem; color:var(--subtext); }
.eh-ico-ok{ color:var(--ok); }
.eh-ico-warn{ color:var(--warn); }

/* Progress */
.eh-progress{ width:144px; }
.eh-progress-track{ width:100%; height:10px; border-radius:999px; background:#FFE3D3; }
.eh-progress-bar{ height:10px; border-radius:999px; background:var(--brand-400); }

/* Tip */
.eh-tip{
  border:1px solid var(--tip-br);
  background:var(--tip-bg);
  border-radius:16px;
  padding:12px 16px;
}
.eh-text{ color:var(--text); margin:0; }
.eh-strong{ color:var(--brand-500); font-weight:700; }
.eh-ok-ico{ color:#059669; }
` as const;
