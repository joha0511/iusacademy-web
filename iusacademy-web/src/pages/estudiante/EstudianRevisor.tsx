// src/pages/estudiante/EstudianteRevisor.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  Upload, FileText, Wand2, Download, Trash2, Loader2, Lightbulb
} from "lucide-react";

/** =========================================================
 *  Revisor de memoriales — LITE + PDF + IA (sin JSON)
 *  ========================================================= */

type Rubro = "estructura" | "claridad" | "fundamentos" | "ortografia";
type RubroResultado = { score: number; feedback: string[] };
type Informe = {
  tokens: number;
  palabras: number;
  tiempoLecturaMin: number;
  rubros: Record<Rubro, RubroResultado>;
  total: number;
  seccionesDetectadas: string[];
};

const PESOS: Record<Rubro, number> = {
  estructura: 0.35,
  claridad: 0.30,
  fundamentos: 0.20,
  ortografia: 0.15,
};
const SECCIONES_OBJETIVO = [
  "VISTOS", "ANTECEDENTES", "FUNDAMENTOS", "CONSIDERANDO", "PETITORIO", "POR TANTO", "OTROSÍ",
];

// ===== EXPORTAR PDF =====
async function descargarPDF(informe: Informe, raw: string, fileName?: string) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 50;
  let y = 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Informe de revisión de memorial", margin, y);
  y += 24;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Archivo: ${fileName || "—"}`, margin, y); y += 14;
  doc.text(`Palabras: ${informe.palabras} · Lectura: ${informe.tiempoLecturaMin} min`, margin, y); y += 18;

  doc.setFont("helvetica", "bold");
  doc.text(`Puntaje total: ${informe.total}/100`, margin, y); y += 24;

  doc.setFontSize(12);
  for (const [k, r] of Object.entries(informe.rubros)) {
    doc.setFont("helvetica", "bold");
    doc.text(`${k.toUpperCase()}: ${r.score}`, margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    if (r.feedback.length) {
      r.feedback.forEach(f => {
        const lines = doc.splitTextToSize(`• ${f}`, 500);
        doc.text(lines, margin + 12, y);
        y += lines.length * 12 + 6;
      });
    } else { doc.text("Sin observaciones.", margin + 12, y); y += 16; }
    y += 4;
  }

  doc.save("informe-memorial.pdf");
}

// ===== utilidades =====
async function leerDocxComoTexto(file: File): Promise<string> {
  const arr = await file.arrayBuffer();
  // @ts-ignore
  const mammoth = await import("mammoth/mammoth.browser");
  const { value } = await mammoth.extractRawText({ arrayBuffer: arr });
  return (value || "").trim();
}
function contarPalabras(t: string) {
  return (t.trim().match(/\b\w[\wÁÉÍÓÚÜÑáéíóúüñ'-]*\b/gu) || []).length;
}
const promedio = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
function oraciones(t: string) { return t.split(/[\.!?‽¿¡]+[\s\n]+/g).map(s => s.trim()).filter(Boolean); }
function heuristicaErrores(t: string) {
  const reglas = [
    { rx: /\s,|\s\.|\s;|\s:/g, penaliza: 1, msg: "Espacios antes de signos de puntuación" },
    { rx: /,,|\.{2,}|;;|::/g, penaliza: 1, msg: "Puntuación repetida" },
  ];
  let pen = 0; const hall = [];
  for (const r of reglas) { const m = t.match(r.rx); if (m?.length) { pen += r.penaliza * m.length; hall.push(r.msg); } }
  return { penalizacion: pen, hallazgos: [...new Set(hall)] };
}
function detectarSecciones(t: string) {
  const lines = t.split(/\n+/).map(l => l.trim()).filter(Boolean);
  return SECCIONES_OBJETIVO.filter(s => lines.find(l => l.toUpperCase().startsWith(s)));
}
function evaluarEstructura(t: string): RubroResultado {
  const sec = detectarSecciones(t);
  const score = Math.round(100 * (sec.length / SECCIONES_OBJETIVO.length));
  const falt = SECCIONES_OBJETIVO.filter(s => !sec.includes(s));
  const fb = falt.length ? [`Añade: ${falt.join(", ")}`] : [];
  return { score, feedback: fb };
}
function evaluarClaridad(t: string): RubroResultado {
  const s = oraciones(t);
  const avg = promedio(s.map(contarPalabras));
  let score = 100; const fb = [];
  if (avg > 28) { score -= clamp((avg - 28) * 2, 0, 40); fb.push("Reduce la longitud de oraciones."); }
  return { score: Math.round(clamp(score)), feedback: fb };
}
function evaluarFundamentos(t: string): RubroResultado {
  const art = (t.match(/art\.?\s*\d+/gi) || []).length;
  const ley = (t.match(/ley|cpe|c\.?p\.?c/gi) || []).length;
  let score = 50 + Math.min(30, art * 10) + Math.min(20, ley * 5);
  if (score > 100) score = 100;
  return { score, feedback: [] };
}
function evaluarOrtografia(t: string): RubroResultado {
  const { penalizacion, hallazgos } = heuristicaErrores(t);
  let score = 100 - Math.min(60, penalizacion * 4);
  return { score: Math.round(clamp(score)), feedback: hallazgos };
}
function consolidarInforme(texto: string): Informe {
  const palabras = contarPalabras(texto);
  const tokens = Math.round(palabras * 1.33);
  const tiempoLecturaMin = Math.max(1, Math.round(palabras / 200));
  const r = {
    estructura: evaluarEstructura(texto),
    claridad: evaluarClaridad(texto),
    fundamentos: evaluarFundamentos(texto),
    ortografia: evaluarOrtografia(texto),
  };
  const total = Math.round(
    r.estructura.score * PESOS.estructura +
    r.claridad.score * PESOS.claridad +
    r.fundamentos.score * PESOS.fundamentos +
    r.ortografia.score * PESOS.ortografia
  );
  return { tokens, palabras, tiempoLecturaMin, rubros: r, total, seccionesDetectadas: detectarSecciones(texto) };
}

/** ============================= UI ============================= */
const LABELS = {
  estructura: "Estructura",
  claridad: "Claridad",
  fundamentos: "Fundamentos",
  ortografia: "Ortografía",
};
const DESCS = {
  estructura: "Encabezados y bloques formales",
  claridad: "Longitud de oraciones y fluidez",
  fundamentos: "Normativa y artículos citados",
  ortografia: "Puntuación y tildes",
};

export default function EstudianteRevisor() {
  const [raw, setRaw] = useState("");
  const [fileName, setFileName] = useState("");
  const [analizando, setAnalizando] = useState(false);
  const [informe, setInforme] = useState<Informe | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function onFile(f?: File) {
    if (!f) return;
    setFileName(f.name);
    setAnalizando(true);
    if (f.name.endsWith(".docx")) setRaw(await leerDocxComoTexto(f));
    else setRaw(await f.text());
    setAnalizando(false);
  }

  function analizarAhora() {
    if (!raw.trim()) return alert("Pega o carga texto primero");
    setInforme(consolidarInforme(raw));
  }
  function limpiar() {
    setRaw(""); setInforme(null); setFileName(""); if (fileRef.current) fileRef.current.value = "";
  }
  async function exportarPDF() {
    if (informe) await descargarPDF(informe, raw, fileName);
  }

  const score = informe?.total ?? 0;
  const donut = { bg: `conic-gradient(var(--or) ${score * 3.6}deg, #f0f2f5 ${score * 3.6}deg)` };

  return (
    <div className="er-wrap er-rightLayout">
      <main className="er-main">
        <div className="er-header">
          <div className="er-title">
            <FileText size={22} />
            <h1>Revisor de memoriales <span className="er-badge">LITE</span></h1>
          </div>
          <div className="er-actions">
            <button className="er-btn er-primary" onClick={analizarAhora}>
              {analizando ? <Loader2 className="spin" size={16}/> : <Wand2 size={16}/>}
              <span>Analizar</span>
            </button>
            <button className="er-btn" onClick={limpiar}><Trash2 size={16}/><span>Limpiar</span></button>

            {/* ← JSON ELIMINADO */}

            <button className="er-btn" disabled={!informe} onClick={exportarPDF}>
              <Download size={16}/><span>Descargar PDF</span>
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="er-editor er-card">
          <div className="er-upload">
            <div className="er-upload-l"><Upload size={16}/><span>Subir archivo</span></div>
            <input ref={fileRef} type="file" accept=".docx,.txt,text/plain" onChange={(e)=>onFile(e.target.files?.[0])}/>
          </div>
          <textarea value={raw} onChange={(e)=>setRaw(e.target.value)} placeholder="Pega tu memorial aquí…" />
        </div>

        {/* Rubros */}
        <section className="er-rubros">
          {(Object.keys(LABELS) as Rubro[]).map((r)=>(
            <div className="er-rubro er-card" key={r}>
              <div className="er-rubro-head">
                <div className="er-rubro-title"><span className="er-dot"/><span>{LABELS[r]}</span></div>
                <div className="er-rubro-score">{informe ? informe.rubros[r].score : "–"}</div>
              </div>
              <div className="er-desc">{DESCS[r]}</div>
              <div className="er-bar"><div className="er-bar-fill" style={{ width: `${informe?.rubros[r].score ?? 0}%` }} /></div>
              {informe?.rubros[r].feedback.length ? (
                <ul className="er-feedback">{informe.rubros[r].feedback.map((f,i)=><li key={i}>{f}</li>)}</ul>
              ) : (<div className="er-empty">Sin observaciones.</div>)}
            </div>
          ))}
        </section>
      </main>

      {/* Sidebar derecha */}
      <aside className="er-sideRight">
        <div className="er-card er-score">
          <div className="er-donut" style={{background: donut.bg}}>
            <div className="er-donut-hole"><div className="er-score-num">{score}</div><div className="er-score-sub">/100</div></div>
          </div>
        </div>

        <div className="er-card">
          <div className="er-subtitle">Secciones detectadas</div>
          <div className="er-chips">{informe?.seccionesDetectadas.length
            ? informe.seccionesDetectadas.map(s=><span key={s} className="er-chip">{s}</span>)
            : <span className="er-empty">Ninguna</span>}
          </div>
        </div>

        <div className="er-card">
          <div className="er-subtitle"><Lightbulb size={16}/> Mejoras</div>
          <ul className="er-tips">
            {informe ? Object.values(informe.rubros).flatMap(r=>r.feedback).map((m,i)=><li key={i}>{m}</li>) : <li>Analiza para ver sugerencias</li>}
          </ul>
        </div>
      </aside>

      <style>{css}</style>
    </div>
  );
}

/* ============================= CSS ============================= */
const css = `
:root{
  /* Paleta naranja delicada */
  --or:#FF8A4C;          /* acento principal */
  --or-2:#E36C2D;        /* acento oscuro */
  --or-soft:#FFE7D9;     /* fondo suave */
  --text:#1E1E1E;
  --sub:#6B6B6B;
  --line:#ECEFF2;
  --card:#FFFFFF;
  --bg:#FFFFFF;
  --shadow:0 18px 48px rgba(11,20,26,.08);
  --radius:18px;
}

/* Contenedor: lateral a la DERECHA (como acordamos) */
.er-wrap{
  display:grid;
  grid-template-columns: 1fr 320px;
  gap:24px;
  padding:18px 22px 28px 22px;
}
.er-rightLayout .er-main { order: 1; }
.er-rightLayout .er-sideRight { order: 2; }

/* Columna derecha (score/sugerencias) */
.er-sideRight{ display:flex; flex-direction:column; gap:16px; }
.er-card{
  background:var(--card);
  border:1px solid var(--line);
  border-radius:var(--radius);
  box-shadow:var(--shadow);
  padding:14px;
}
.er-subtitle{
  font-weight:700; color:#2b2b2b; font-size:.95rem;
  display:flex; align-items:center; gap:8px;
}
.er-chips{ display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; }
.er-chip{
  background:#fff; border:1px solid var(--line); border-radius:999px;
  padding:4px 10px; font-size:.78rem; color:#3c3c3c;
}
.er-empty{ color:#9aa4ad; font-size:.9rem; }

/* Donut score */
.er-score{ display:flex; flex-direction:column; align-items:center; gap:8px; }
.er-donut{
  width:132px;height:132px;border-radius:50%;
  display:grid; place-items:center;
  background:conic-gradient(var(--or) 0deg, #f0f2f5 0deg);
}
.er-donut-hole{
  width:96px;height:96px;border-radius:50%;
  background:#fff; display:grid; place-items:center;
  box-shadow: inset 0 0 0 1px var(--line);
}
.er-score-num{ font-size:32px; line-height:1; font-weight:800; color:#2b2b2b; }
.er-score-sub{ font-size:12px; color:#9aa4ad; margin-top:2px; }
.er-score-caption{ font-size:.9rem; color:#3c3c3c; }

/* Tips */
.er-tips{ margin:10px 0 0 0; padding-left:18px; display:grid; gap:6px; }
.er-tips li{ color:#404a52; font-size:.92rem; }

/* Columna principal (izquierda) */
.er-main{ display:flex; flex-direction:column; gap:18px; }

/* Header */
.er-header{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
.er-title{ display:flex; align-items:center; gap:10px; }
.er-title h1{ font-size:1.4rem; font-weight:800; color:#222; }
.er-badge{
  margin-left:8px; font-size:.68rem; font-weight:800; letter-spacing:.06em;
  background:var(--or-soft); color:var(--or-2); padding:3px 8px; border-radius:999px;
  border:1px solid #ffd1bd;
}
.er-actions{ display:flex; align-items:center; gap:10px; }
.er-btn{
  display:inline-flex; align-items:center; gap:8px;
  background:#fff; border:1px solid var(--line);
  padding:9px 12px; border-radius:14px; font-weight:700; color:#2b2b2b;
}
.er-btn:disabled{ opacity:.5; cursor:not-allowed; }
.er-primary{
  background:var(--or); color:#fff; border:none;
  box-shadow: 0 10px 24px rgba(255,138,76,.22);
}
.spin{ animation:spin .9s linear infinite; }
@keyframes spin { to{ transform:rotate(360deg);} }

/* Editor */
.er-editor textarea{
  width:100%; min-height:42vh; resize:vertical;
  border:1px solid var(--line); border-radius:14px;
  padding:12px 14px; outline:none;
  box-shadow: inset 0 1px 0 rgba(0,0,0,.02);
}
.er-editor textarea:focus{ border-color:#ffd0b9; box-shadow:0 0 0 3px #ffe8de; }
.er-upload{
  display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px;
}
.er-upload-l{ display:flex; align-items:center; gap:8px; font-size:.9rem; color:#3c3c3c; }
.er-meta{
  margin-top:8px; display:flex; align-items:center; justify-content:space-between;
  color:#7b8791; font-size:.85rem;
}
.er-file{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:60%; }

/* Rubros (barras) */
.er-rubros{
  display:grid;
  grid-template-columns: repeat(12, 1fr);
  gap:16px;
}
.er-rubro{
  grid-column: span 12;
}
@media (min-width: 900px){
  .er-rubro{ grid-column: span 6; }
}
@media (min-width: 1280px){
  .er-rubro{ grid-column: span 4; }
}
@media (min-width: 1536px){
  .er-rubro{ grid-column: span 3; }
}

.er-rubro-head{
  display:flex; align-items:baseline; justify-content:space-between; margin-bottom:6px;
}
.er-rubro-title{ display:flex; align-items:center; gap:8px; font-weight:800; }
.er-dot{
  width:8px;height:8px;border-radius:999px;background:var(--or);
  box-shadow:0 0 0 3px #ffe4d6;
}
.er-rubro-score{ font-weight:800; color:#222; }

.er-desc{ color:#8b97a1; font-size:.85rem; margin-bottom:10px; }

.er-bar{
  height:9px; background:#f3f5f7; border-radius:999px; overflow:hidden;
  border:1px solid #eef1f4;
}
.er-bar-fill{
  height:100%;
  background:linear-gradient(90deg, var(--or), #ffa677);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.4);
  border-radius:999px;
}

.er-feedback{
  margin-top:10px; padding-left:18px; display:grid; gap:6px;
  color:#404a52; font-size:.92rem;
}
`;
