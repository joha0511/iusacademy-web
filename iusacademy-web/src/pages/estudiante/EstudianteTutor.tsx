import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Gavel,
  Users,
  BookOpen,
  Clock3,
  Sparkles,
  Brain,
  ListChecks,
} from "lucide-react";

/* ────────────────────────────────────────────────
   Tipos
   ──────────────────────────────────────────────── */
type PasoAudiencia = {
  id: string;
  orden: number;
  nombre: string;
  objetivo: string;
  actores: string[];
  ejemploJuez: string;
  ejemploAbogado: string;
  errorTipico: string;
  consejos: string[];
};

type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

type TabId = "inicio" | "flujo";

/* ────────────────────────────────────────────────
   Data de pasos de audiencia (preliminar civil)
   ──────────────────────────────────────────────── */
const PASOS_PRELIMINAR: PasoAudiencia[] = [
  {
    id: "p1",
    orden: 1,
    nombre: "Instalación de la audiencia",
    objetivo:
      "Verificar presencia de las partes, constatar datos básicos y declarar formalmente instalada la audiencia.",
    actores: ["Juez/Presidenta(e)", "Secretario(a)"],
    ejemploJuez:
      "Se instala la audiencia preliminar dentro del proceso seguido por la parte demandante contra la parte demandada...",
    ejemploAbogado:
      "Presente, señoría, en representación de la parte demandante, Juan Pérez, conforme poder que cursa en obrados.",
    errorTipico: "Saludar sin identificar a quién representas ni tu calidad procesal.",
    consejos: [
      "Ten claro a quién representas y cómo te vas a presentar.",
      "Responde con seguridad, mirando al juez.",
    ],
  },
  {
    id: "p2",
    orden: 2,
    nombre: "Identificación de las partes",
    objetivo:
      "Registrar correctamente los datos de las partes, abogados y representación.",
    actores: ["Juez/Secretario(a)", "Abogados", "Partes"],
    ejemploJuez:
      "Sírvase la parte demandante identificarse indicando su nombre completo y su abogado patrocinante.",
    ejemploAbogado:
      "Mi nombre es Ana López, abogada patrocinante del señor Juan Pérez, con RPA Nº..., domicilio procesal en...",
    errorTipico: "Olvidar mencionar domicilio procesal o calidad (patrocinante/defensor).",
    consejos: [
      "Ten memorizado tu RPA y tu domicilio procesal.",
      "Cuida el orden: nombre, condición, RPA, domicilio.",
    ],
  },
  {
    id: "p3",
    orden: 3,
    nombre: "Exposición resumida de la pretensión",
    objetivo:
      "Que el juez comprenda de forma clara y breve qué se está solicitando y por qué.",
    actores: ["Abogado de la parte actora"],
    ejemploJuez:
      "Tiene la palabra la parte demandante para exponer brevemente su pretensión.",
    ejemploAbogado:
      "Gracias, señoría. Venimos a solicitar el cumplimiento de obligación de pago por la suma de..., derivada del contrato de fecha...",
    errorTipico:
      "Hablar de detalles irrelevantes o relatar toda la demanda sin estructura.",
    consejos: [
      "Expón en 3 partes: qué pides, por qué lo pides, en base a qué documentos.",
      "Evita leer literalmente la demanda; sintetiza.",
    ],
  },
  {
    id: "p4",
    orden: 4,
    nombre: "Saneamiento procesal",
    objetivo:
      "Resolver cuestiones procesales previas: competencia, legitimación, nulidades, acumulaciones, etc.",
    actores: ["Juez", "Abogados"],
    ejemploJuez:
      "Se concede la palabra a las partes para que se pronuncien sobre eventuales excepciones o nulidades.",
    ejemploAbogado:
      "Señoría, no tenemos observaciones sobre la competencia, pero sí advertimos la falta de citación válida a la parte codemandada...",
    errorTipico: "No objetar vicios procesales en este momento y perder la oportunidad.",
    consejos: [
      "Ten una checklist de posibles nulidades o excepciones.",
      "Si no hay observaciones, dilo expresamente.",
    ],
  },
  {
    id: "p5",
    orden: 5,
    nombre: "Producción y admisión de prueba",
    objetivo:
      "Ofrecer, admitir y producir la prueba pertinente y útil para el caso.",
    actores: ["Abogados", "Juez", "Testigos/Peritos"],
    ejemploJuez:
      "Se tiene presente la prueba ofrecida. Se concede la palabra a las partes para que fundamenten su pertinencia.",
    ejemploAbogado:
      "Ofrecemos prueba documental consistente en..., testifical de..., y pericial en el área de...",
    errorTipico:
      "No fundamentar la pertinencia de cada medio de prueba respecto a los hechos que se quieren acreditar.",
    consejos: [
      "Relaciona cada medio de prueba con hechos concretos.",
      "Ten a mano el listado de prueba organizado.",
    ],
  },
  {
    id: "p6",
    orden: 6,
    nombre: "Alegatos finales",
    objetivo:
      "Resumir la teoría del caso y convencer al juez sobre la decisión que debe tomar.",
    actores: ["Abogados"],
    ejemploJuez:
      "Concluida la producción de prueba, se concede la palabra a la parte demandante para sus alegatos finales.",
    ejemploAbogado:
      "Señoría, la prueba producida demuestra de manera clara que..., por lo que solicitamos se declare probada la demanda...",
    errorTipico: "Repetir toda la prueba sin orden ni conexión lógica.",
    consejos: [
      "Reordena tu alegato en: hechos probados, normas aplicables y petición concreta.",
      "Cierra con una frase clara de lo que solicitas.",
    ],
  },
  {
    id: "p7",
    orden: 7,
    nombre: "Resolución / Conclusión",
    objetivo: "Emitir la decisión o dejarla en estado de resolución.",
    actores: ["Juez"],
    ejemploJuez:
      "Se pasa a dictar la resolución, declarando probada/improbada la demanda en los términos que se indicarán...",
    ejemploAbogado:
      "Señoría, solicitamos se nos extienda copia de la resolución una vez quede debidamente notificada.",
    errorTipico: "No escuchar con atención las condiciones, plazos o advertencias de la resolución.",
    consejos: [
      "Toma nota de plazos, recursos y advertencias.",
      "Si tienes duda sobre plazos, pregúntalo con respeto.",
    ],
  },
];

/* Checklist base */
const CHECKLIST_BASE: ChecklistItem[] = [
  { id: "c1", label: "Revisé todo el expediente y documentos clave.", done: false },
  { id: "c2", label: "Tengo clara mi teoría del caso (hechos + derecho).", done: false },
  { id: "c3", label: "Sé cómo me voy a presentar ante el juez.", done: false },
  { id: "c4", label: "Tengo ordenado mi listado de prueba.", done: false },
  { id: "c5", label: "Preparé un esquema de alegatos finales.", done: false },
];

/* ────────────────────────────────────────────────
   Componente principal
   ──────────────────────────────────────────────── */
export default function EstudianteTutor() {
  const [tab, setTab] = useState<TabId>("inicio");
  const [pasos] = useState<PasoAudiencia[]>(PASOS_PRELIMINAR);
  const [seleccionado, setSeleccionado] = useState<string>(PASOS_PRELIMINAR[0].id);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(CHECKLIST_BASE);

  const pasoActual = pasos.find((p) => p.id === seleccionado) ?? pasos[0];

  const pasosDominados = 3; // MOCK de progreso
  const totalPasos = pasos.length;
  const porcentajeDominio = Math.round((pasosDominados / totalPasos) * 100);

  const checklistCompletos = checklist.filter((i) => i.done).length;
  const checklistPct = Math.round((checklistCompletos / checklist.length) * 100);

  function toggleChecklist(id: string) {
    setChecklist((prev) =>
      prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)),
    );
  }

  return (
    <div className="af-root">
      {/* HEADER */}
      <header className="af-hdr">
        <h1 className="af-h1">Tutor de Audiencias</h1>
        <p className="af-sub">
          Un profesor virtual que te enseña el flujo de la audiencia y te ayuda a prepararte antes de litigar.
        </p>
      </header>

      {/* TABS */}
      <nav className="af-tabs">
        <button
          className={`af-tab ${tab === "inicio" ? "active" : ""}`}
          onClick={() => setTab("inicio")}
        >
          <Sparkles size={16} />
          <span>Inicio del tutor</span>
        </button>
        <button
          className={`af-tab ${tab === "flujo" ? "active" : ""}`}
          onClick={() => setTab("flujo")}
        >
          <Gavel size={16} />
          <span>Flujo de audiencia</span>
        </button>
      </nav>

      <main className="af-main">
        {tab === "inicio" ? (
          <InicioTutor
            pasosDominados={pasosDominados}
            totalPasos={totalPasos}
            porcentajeDominio={porcentajeDominio}
            checklistPct={checklistPct}
          />
        ) : (
          <>
            {/* KPIs */}
            <section className="af-grid-3">
              <StatCard
                icon={<Gavel size={18} />}
                label="Tipo de audiencia"
                value="Preliminar civil"
                hint="Puedes adaptar este flujo a otros tipos de audiencias."
              />
              <StatCard
                icon={<BookOpen size={18} />}
                label="Etapas dominadas"
                value={`${pasosDominados} / ${totalPasos}`}
                hint={`Dominio estimado: ${porcentajeDominio}%`}
              />
              <StatCard
                icon={<CheckCircle2 size={18} />}
                label="Checklist previo"
                value={`${checklistCompletos} / ${checklist.length}`}
                hint={`Preparación: ${checklistPct}% completada`}
              />
            </section>

            {/* FLUJO + DETALLE */}
            <section className="af-layout">
              {/* Mapa de flujo */}
              <motion.div
                className="af-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="af-card-hdr">
                  <div>
                    <h2 className="af-h2">Mapa de la audiencia</h2>
                    <p className="af-sub-mini">
                      Sigue el orden recomendado. Haz clic en cada etapa para ver su explicación.
                    </p>
                  </div>
                </div>

                <ol className="af-steps">
                  {pasos.map((p) => {
                    const activo = p.id === seleccionado;
                    return (
                      <li
                        key={p.id}
                        className={`af-step ${activo ? "active" : ""}`}
                        onClick={() => setSeleccionado(p.id)}
                      >
                        <div className="af-step-left">
                          <div className="af-step-badge">{p.orden}</div>
                          <div className="af-step-texts">
                            <p className="af-step-title">{p.nombre}</p>
                            <p className="af-step-sub">
                              {p.actores.join(" · ")}
                            </p>
                          </div>
                        </div>
                        <Clock3 className="af-step-ico" size={16} />
                      </li>
                    );
                  })}
                </ol>
              </motion.div>

              {/* Detalle de etapa */}
              <motion.div
                className="af-card af-detail"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
              >
                <h2 className="af-h2">Detalle de la etapa seleccionada</h2>
                <p className="af-pill">
                  Paso {pasoActual.orden} · {pasoActual.nombre}
                </p>

                <section className="af-block">
                  <h3 className="af-block-title">Objetivo</h3>
                  <p className="af-text">{pasoActual.objetivo}</p>
                </section>

                <section className="af-block">
                  <h3 className="af-block-title">Actores principales</h3>
                  <div className="af-tags">
                    {pasoActual.actores.map((a) => (
                      <span key={a} className="af-tag">
                        <Users size={14} /> {a}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="af-block">
                  <h3 className="af-block-title">Ejemplo del juez</h3>
                  <p className="af-text quote">“{pasoActual.ejemploJuez}”</p>
                </section>

                <section className="af-block">
                  <h3 className="af-block-title">Ejemplo del abogado</h3>
                  <p className="af-text quote">“{pasoActual.ejemploAbogado}”</p>
                </section>

                <section className="af-block">
                  <h3 className="af-block-title">Error típico</h3>
                  <p className="af-text error">{pasoActual.errorTipico}</p>
                </section>

                <section className="af-block">
                  <h3 className="af-block-title">Consejos del profesor</h3>
                  <ul className="af-list">
                    {pasoActual.consejos.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </section>
              </motion.div>
            </section>

            {/* CHECKLIST PREVIO */}
            <section className="af-card">
              <div className="af-card-hdr">
                <div>
                  <h2 className="af-h2">Checklist antes de entrar a audiencia</h2>
                  <p className="af-sub-mini">
                    Marca los puntos que ya tienes listos. Te ayuda a entrar con más seguridad.
                  </p>
                </div>
              </div>

              <ul className="af-checklist">
                {checklist.map((item) => (
                  <li key={item.id} className="af-check-item">
                    <label className="af-check-lbl">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggleChecklist(item.id)}
                        className="af-checkbox"
                      />
                      <span
                        className={`af-check-text ${
                          item.done ? "done" : ""
                        }`}
                      >
                        {item.label}
                      </span>
                    </label>
                    {item.done ? (
                      <CheckCircle2 className="af-ico-ok" size={18} />
                    ) : (
                      <Clock3 className="af-ico-warn" size={18} />
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </main>

      <style>{styles}</style>
    </div>
  );
}

/* ===================== INICIO DEL TUTOR (Pestaña 1) ===================== */

function InicioTutor({
  pasosDominados,
  totalPasos,
  porcentajeDominio,
  checklistPct,
}: {
  pasosDominados: number;
  totalPasos: number;
  porcentajeDominio: number;
  checklistPct: number;
}) {
  return (
    <>
      <section className="af-grid-2">
        {/* HERO RESUMIDO Y VISUAL */}
        <motion.div
          className="af-card af-hero"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="af-hero-badge">
            <Sparkles size={16} />
            Tutor de audiencias
          </div>

          <h2 className="af-hero-title">
            Practica el flujo de una audiencia sin miedo escénico.
          </h2>

          <p className="af-hero-text">
            Este espacio no es un examen: es un lugar seguro para entender el
            orden de la audiencia y qué se espera de ti en cada etapa.
          </p>

          {/* Chips de beneficios */}
          <div className="af-hero-chips">
            <div className="af-chip">
              <Gavel size={14} />
              Flujo paso a paso
            </div>
            <div className="af-chip">
              <Brain size={14} />
              Explicación del profe
            </div>
            <div className="af-chip">
              <ListChecks size={14} />
              Checklist de ingreso
            </div>
          </div>

          {/* Pequeña ruta de uso del tutor */}
          <div className="af-hero-steps">
            <div className="af-hero-step">
              <span className="af-hero-step-num">1</span>
              <div>
                <p className="af-hero-step-title">Mira el mapa</p>
                <p className="af-hero-step-text">
                  Ubica las etapas de la audiencia y su orden.
                </p>
              </div>
            </div>
            <div className="af-hero-step">
              <span className="af-hero-step-num">2</span>
              <div>
                <p className="af-hero-step-title">Lee la explicación</p>
                <p className="af-hero-step-text">
                  Qué hace el juez y qué haces tú en cada momento.
                </p>
              </div>
            </div>
            <div className="af-hero-step">
              <span className="af-hero-step-num">3</span>
              <div>
                <p className="af-hero-step-title">Revisa tu checklist</p>
                <p className="af-hero-step-text">
                  Asegúrate de entrar preparado y con confianza.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* PROGRESO MÁS VISUAL */}
        <motion.div
          className="af-card af-progress-card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
        >
          <h3 className="af-h3">Tu estado actual</h3>

          <div className="af-progress-grid">
            <div className="af-progress-mini">
              <p className="af-progress-label">Etapas comprendidas</p>
              <p className="af-progress-kpi">
                {pasosDominados}/{totalPasos}
              </p>
              <div className="af-progress-bar-wrap">
                <div
                  className="af-progress-bar-fill"
                  style={{ width: `${porcentajeDominio}%` }}
                />
              </div>
            </div>

            <div className="af-progress-mini">
              <p className="af-progress-label">Checklist completado</p>
              <p className="af-progress-kpi">{checklistPct}%</p>
              <div className="af-progress-bar-wrap">
                <div
                  className="af-progress-bar-fill secondary"
                  style={{ width: `${checklistPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="af-tip-box">
            <p className="af-tip-title">Tip del tutor</p>
            <p className="af-tip-text">
              Mejor recorre el flujo 10–15 minutos varias veces que intentar memorizar
              todo en una sola sesión. Tu cerebro aprende por bloques pequeños.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Módulos del tutor */}
      <section className="af-card af-modules">
        <div className="af-card-hdr">
          <div>
            <h2 className="af-h2">¿Qué encontrarás aquí?</h2>
            <p className="af-sub-mini">
              Tres bloques pensados para que entiendas, no solo memorices.
            </p>
          </div>
        </div>

        <div className="af-mod-grid">
          <div className="af-mod-card">
            <div className="af-mod-ico">
              <Gavel size={18} />
            </div>
            <h3 className="af-mod-title">Flujo visual</h3>
            <p className="af-mod-text">
              Un mapa claro de la audiencia para que no te pierdas en el orden.
            </p>
          </div>

          <div className="af-mod-card">
            <div className="af-mod-ico secondary">
              <Brain size={18} />
            </div>
            <h3 className="af-mod-title">Explicación guiada</h3>
            <p className="af-mod-text">
              Cada etapa explicada como si el profe estuviera a tu lado.
            </p>
          </div>

          <div className="af-mod-card">
            <div className="af-mod-ico tertiary">
              <ListChecks size={18} />
            </div>
            <h3 className="af-mod-title">Checklist previo</h3>
            <p className="af-mod-text">
              Una lista rápida para que entres a audiencia con confianza.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

/* ===================== Subcomponente KPI pequeño ===================== */

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <motion.div
      className="af-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="af-stat">
        <div className="af-stat-left">
          <p className="af-sub-mini">{label}</p>
          <div className="af-kpi">{value}</div>
          {hint && <p className="af-hint">{hint}</p>}
        </div>
        {icon ? <div className="af-stat-ico">{icon}</div> : null}
      </div>
    </motion.div>
  );
}

/* =========================================================
   STYLES — con pestañas, hero visual y módulos
   ========================================================= */
const styles = `
:root{
  --text:#1f1f1f;
  --subtext:#6B6B6B;

  --brand-400:#FF8A4C;
  --brand-500:#E36C2D;

  --panel:#ffffff;
  --bg:transparent;
  --line:#EADCD4;
  --tip-bg:#FFEFE6;
  --tip-br:#F6D9C9;

  --ok:#059669;
  --warn:#B45309;

  --shadow-md:0 12px 28px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04);
}

.af-root{
  background:var(--bg);
  width:100%;
}

.af-hdr{
  padding:16px 0 4px 0;
}
.af-h1{
  margin:0;
  font-size:1.5rem;
  font-weight:900;
  color:var(--text);
}
.af-sub{
  margin:.25rem 0 0;
  color:var(--subtext);
  font-size:.95rem;
}

/* Tabs */
.af-tabs{
  margin-top:10px;
  display:flex;
  gap:8px;
  border-bottom:1px solid var(--line);
}
.af-tab{
  position:relative;
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:8px 14px;
  border:none;
  background:transparent;
  cursor:pointer;
  font-size:.9rem;
  font-weight:600;
  color:var(--subtext);
}
.af-tab span{ white-space:nowrap; }
.af-tab svg{ flex-shrink:0; }
.af-tab::after{
  content:"";
  position:absolute;
  left:0;
  right:0;
  bottom:-1px;
  height:2px;
  background:transparent;
  border-radius:999px;
}
.af-tab.active{
  color:var(--brand-500);
}
.af-tab.active::after{
  background:var(--brand-500);
}

/* Main */
.af-main{
  padding:16px 28px 20px 0;
  display:flex;
  flex-direction:column;
  gap:16px;
}

/* GRID KPI */
.af-grid-3{
  display:grid;
  grid-template-columns: repeat(1, minmax(0,1fr));
  gap:12px;
}
@media(min-width:768px){
  .af-grid-3{
    grid-template-columns: repeat(3, minmax(0,1fr));
  }
}

/* GRID Inicio (2 columnas) */
.af-grid-2{
  display:grid;
  grid-template-columns:1fr;
  gap:12px;
}
@media(min-width:900px){
  .af-grid-2{
    grid-template-columns: minmax(0,1.3fr) minmax(0,1fr);
  }
}

/* LAYOUT mapa + detalle */
.af-layout{
  display:grid;
  gap:12px;
  grid-template-columns: 1fr;
}
@media(min-width:1024px){
  .af-layout{
    grid-template-columns: 3fr 2fr;
  }
}

/* CARD genérica */
.af-card{
  background:var(--panel);
  border-radius:16px;
  padding:16px;
  border:1px solid transparent;
  box-shadow:var(--shadow-md);
}

/* Encabezados y textos */
.af-h2{
  margin:0;
  font-size:1.05rem;
  font-weight:700;
  color:var(--text);
}
.af-h3{
  margin:0 0 8px;
  font-size:1rem;
  font-weight:700;
  color:var(--text);
}
.af-sub-mini{
  color:var(--subtext);
  font-size:.85rem;
  margin:2px 0 0;
}
.af-hint{
  color:var(--subtext);
  font-size:.78rem;
  margin-top:4px;
}
.af-kpi{
  margin-top:4px;
  font-size:1.4rem;
  font-weight:700;
  color:var(--text);
}
.af-kpi-small{
  margin:2px 0 0;
  font-size:1.05rem;
  font-weight:700;
  color:var(--text);
}
.af-kpi-tag{
  display:inline-flex;
  margin-left:6px;
  padding:2px 8px;
  border-radius:999px;
  background:#FFF2EA;
  color:var(--brand-500);
  font-size:.75rem;
}
.af-kpi-tag.secondary{
  background:#E1F6EB;
  color:#047857;
}

/* Stat */
.af-stat{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
}
.af-stat-left{
  display:flex;
  flex-direction:column;
}
.af-stat-ico{
  width:36px;
  height:36px;
  border-radius:999px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#FFE3D3;
  color:var(--brand-500);
}

/* HERO inicio del tutor */
.af-hero{
  position:relative;
  overflow:hidden;
}
.af-hero-badge{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:4px 10px;
  border-radius:999px;
  background:#FFF2EA;
  color:var(--brand-500);
  font-size:.8rem;
  font-weight:600;
  margin-bottom:8px;
}
.af-hero-title{
  margin:0 0 6px;
  font-size:1.3rem;
  font-weight:800;
  color:var(--text);
}
.af-hero-text{
  margin:0 0 10px;
  font-size:.92rem;
  color:var(--subtext);
}

/* Chips de beneficios */
.af-hero-chips{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
  margin-bottom:10px;
}
.af-chip{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:4px 10px;
  border-radius:999px;
  background:#FFF2EA;
  color:var(--brand-500);
  font-size:.8rem;
  font-weight:600;
}

/* Pasos resumidos del tutor */
.af-hero-steps{
  margin-top:4px;
  border-top:1px solid #F5E3D6;
  padding-top:8px;
  display:flex;
  flex-direction:column;
  gap:6px;
}
.af-hero-step{
  display:flex;
  align-items:flex-start;
  gap:8px;
}
.af-hero-step-num{
  width:22px;
  height:22px;
  border-radius:999px;
  background:#FFE3D3;
  color:#8a4d2b;
  font-size:.8rem;
  display:grid;
  place-items:center;
  font-weight:700;
}
.af-hero-step-title{
  margin:0;
  font-size:.9rem;
  font-weight:700;
  color:var(--text);
}
.af-hero-step-text{
  margin:0;
  font-size:.8rem;
  color:var(--subtext);
}

/* Progreso en Inicio */
.af-progress-card{
  display:flex;
  flex-direction:column;
  gap:10px;
}
.af-progress-grid{
  display:grid;
  gap:8px;
}
.af-progress-mini{
  padding:8px 10px;
  border-radius:12px;
  background:#FFF9F5;
  border:1px solid #F5E3D6;
}
.af-progress-label{
  margin:0;
  font-size:.8rem;
  color:var(--subtext);
}
.af-progress-kpi{
  margin:2px 0 4px;
  font-size:1.1rem;
  font-weight:700;
  color:var(--text);
}
.af-progress-bar-wrap{
  width:100%;
  height:9px;
  border-radius:999px;
  background:#FFE3D3;
  overflow:hidden;
}
.af-progress-bar-fill{
  height:100%;
  background:var(--brand-400);
  border-radius:999px;
  transition:width .25s ease-out;
}
.af-progress-bar-fill.secondary{
  background:#22C55E;
}

/* Tip box */
.af-tip-box{
  margin-top:4px;
  padding:10px 12px;
  border-radius:12px;
  border:1px dashed #F6D9C9;
  background:var(--tip-bg);
}
.af-tip-title{
  margin:0 0 2px;
  font-size:.8rem;
  font-weight:700;
  color:var(--brand-500);
}
.af-tip-text{
  margin:0;
  font-size:.82rem;
  color:var(--text);
}

/* Módulos del tutor */
.af-modules{
  display:flex;
  flex-direction:column;
  gap:12px;
}
.af-mod-grid{
  display:grid;
  grid-template-columns:1fr;
  gap:12px;
}
@media(min-width:900px){
  .af-mod-grid{
    grid-template-columns: repeat(3, minmax(0,1fr));
  }
}
.af-mod-card{
  border-radius:14px;
  border:1px solid #F5E3D6;
  padding:12px 12px 14px;
  background:#FFF9F5;
}
.af-mod-ico{
  width:30px;
  height:30px;
  border-radius:999px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#FFE3D3;
  color:var(--brand-500);
  margin-bottom:6px;
}
.af-mod-ico.secondary{
  background:#E1F6EB;
  color:#047857;
}
.af-mod-ico.tertiary{
  background:#DBEAFE;
  color:#1D4ED8;
}
.af-mod-title{
  margin:0 0 4px;
  font-size:.96rem;
  font-weight:700;
  color:var(--text);
}
.af-mod-text{
  margin:0 0 6px;
  font-size:.88rem;
  color:var(--subtext);
}

/* Stepper */
.af-card-hdr{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:12px;
  margin-bottom:10px;
}

.af-steps{
  list-style:none;
  margin:8px 0 0;
  padding:0;
  display:flex;
  flex-direction:column;
  gap:8px;
}

.af-step{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  padding:10px 12px;
  border-radius:12px;
  cursor:pointer;
  border:1px solid #F5E3D6;
  background:#FFF9F5;
  transition:all .18s ease-out;
}
.af-step:hover{
  border-color:var(--brand-400);
  box-shadow:0 8px 18px rgba(255,138,76,.15);
}
.af-step.active{
  border-color:var(--brand-500);
  background:#FFE9DA;
}
.af-step-left{
  display:flex;
  align-items:center;
  gap:10px;
}
.af-step-badge{
  width:26px;
  height:26px;
  border-radius:999px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:var(--brand-400);
  color:#fff;
  font-size:.9rem;
  font-weight:700;
}
.af-step-texts{
  display:flex;
  flex-direction:column;
}
.af-step-title{
  margin:0;
  font-size:.95rem;
  font-weight:600;
  color:var(--text);
}
.af-step-sub{
  margin:0;
  font-size:.8rem;
  color:var(--subtext);
}
.af-step-ico{
  color:var(--subtext);
}

/* Detalle de etapa */
.af-detail{
  display:flex;
  flex-direction:column;
  gap:8px;
}
.af-pill{
  display:inline-flex;
  align-items:center;
  padding:4px 10px;
  border-radius:999px;
  background:#FFF2EA;
  color:var(--brand-500);
  font-size:.8rem;
  font-weight:600;
  margin-top:6px;
}
.af-block{
  margin-top:6px;
}
.af-block-title{
  margin:0 0 4px;
  font-size:.9rem;
  font-weight:700;
  color:var(--text);
}
.af-text{
  margin:0;
  font-size:.9rem;
  color:var(--text);
}
.af-text.quote{
  font-style:italic;
}
.af-text.error{
  color:#B91C1C;
}

/* Tags actores */
.af-tags{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}
.af-tag{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:4px 8px;
  border-radius:999px;
  background:#FFF2EA;
  color:var(--brand-500);
  font-size:.8rem;
}

/* Lista de consejos */
.af-list{
  margin:0;
  padding-left:18px;
  font-size:.88rem;
  color:var(--text);
}
.af-list li{
  margin-bottom:4px;
}

/* Checklist */
.af-checklist{
  list-style:none;
  padding:0;
  margin:12px 0 0;
  display:flex;
  flex-direction:column;
  gap:8px;
}
.af-check-item{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  padding:8px 0;
  border-bottom:1px solid var(--tip-br);
}
.af-check-item:last-child{
  border-bottom:none;
}
.af-check-lbl{
  display:flex;
  align-items:flex-start;
  gap:10px;
  cursor:pointer;
}
.af-checkbox{
  margin-top:3px;
  width:16px;
  height:16px;
  accent-color:var(--brand-400);
}
.af-check-text{
  font-size:.9rem;
  color:var(--text);
}
.af-check-text.done{
  color:var(--subtext);
  text-decoration:line-through;
}
.af-ico-ok{
  color:var(--ok);
}
.af-ico-warn{
  color:var(--warn);
}
` as const;
