// src/pages/estudiante/EstudianteRevisor.tsx
import { useRef, useState } from "react";
import {
  Upload,
  FileText,
  Wand2,
  Download,
  Trash2,
  Loader2,
  Lightbulb,
  Info,
  X,
} from "lucide-react";

/** =========================================================
 *  Revisor de memoriales / demandas — CIVIL (Ley 439)
 *  ========================================================= */

type Rubro = "estructura" | "claridad" | "fundamentos" | "ortografia";
type TipoDoc = "memorial" | "demanda";

type RubroResultado = { score: number; feedback: string[] };

type ChecklistItem = {
  id: string;
  nombre: string;
  presente: boolean;
};

type Informe = {
  tokens: number;
  palabras: number;
  tiempoLecturaMin: number;
  rubros: Record<Rubro, RubroResultado>;
  total: number; // % de cumplimiento de checklist
  seccionesDetectadas: string[];
  checklist: ChecklistItem[];
  tipo: TipoDoc;
};

type RevisionResumen = {
  id: number;
  fechaISO: string;
  tipo: TipoDoc;
  score: number;
  palabras: number;
  fileName: string;
};

const PESOS: Record<Rubro, number> = {
  estructura: 0.35,
  claridad: 0.30,
  fundamentos: 0.20,
  ortografia: 0.15,
};

// Secciones generales (para chips decorativos)
const SECCIONES_OBJETIVO = [
  "VISTOS",
  "ANTECEDENTES",
  "FUNDAMENTOS",
  "CONSIDERANDO",
  "PETITORIO",
  "POR TANTO",
  "OTROSÍ",
];

type ChecklistDef = {
  id: string;
  nombre: string;
  tests: RegExp[];
};

/** =========================================================
 *  REQUISITOS LEGALES SEGÚN CPC (Ley 439)
 *  ========================================================= */

// Memorial civil (Art. 113 y práctica forense)
const REQUISITOS_MEMORIAL: ChecklistDef[] = [
  {
    id: "autoridad",
    nombre: "Autoridad a la que se dirige (Señor Juez…)",
    tests: [/señor(?:a)?\s+juez/iu, /juzgado\s+público/iu, /juez\s+público/iu],
  },
  {
    id: "identificacion",
    nombre:
      "Identificación del solicitante (nombre, C.I., mayor de edad, domicilio)",
    tests: [/mayor de edad/iu, /c\.?i\.?/iu, /domiciliad[oa]/iu],
  },
  {
    id: "proceso",
    nombre: "Datos del proceso (NUREJ, tipo de proceso, partes)",
    tests: [/nurej/iu, /proceso\s*:/iu, /demandante\s*:/iu],
  },
  {
    id: "motivo",
    nombre: "Exposición breve del motivo o antecedentes",
    tests: [/expongo/iu, /antecedente/iu, /hecho[s]?/iu],
  },
  {
    id: "petitorio",
    nombre:
      "Petitorio claro (lo que se pide: solicito, pido, por tanto…)",
    tests: [/solicito/iu, /pido/iu, /petitorio/iu, /por tanto/iu],
  },
  {
    id: "otrosi",
    nombre: "Otrosí(es) para peticiones adicionales",
    tests: [/otros[ií]/iu],
  },
  {
    id: "firma",
    nombre: "Firma y datos del abogado patrocinante",
    tests: [/abog\./iu, /rpa\s*n/iu, /firma/iu],
  },
  {
    id: "fecha",
    nombre:
      "Lugar y fecha (ej. Cochabamba, 26 de noviembre de 2025)",
    tests: [
      /(la paz|cochabamba|santa cruz|el alto|tarija|potos[ií]|oruro|sucre)[^,\n]*,\s*\d{1,2}\s+de\s+\w+/iu,
    ],
  },
];

// Demanda civil (Art. 110 y ss. CPC)
const REQUISITOS_DEMANDA: ChecklistDef[] = [
  {
    id: "autoridad",
    nombre: "Designación del juez o tribunal competente",
    tests: [/señor(?:a)?\s+juez/iu, /juzgado\s+público/iu, /juez\s+público/iu],
  },
  {
    id: "demandante",
    nombre: "Nombre y generales de ley del demandante",
    tests: [/demandante/iu, /mayor de edad/iu, /c\.?i\.?/iu],
  },
  {
    id: "demandado",
    nombre: "Nombre y domicilio del demandado",
    tests: [/demandad[oa]/iu, /contra\s+[A-ZÁÉÍÓÚÑ][^\n,]+/u],
  },
  {
    id: "hechos",
    nombre: "Exposición clara de los hechos del caso",
    tests: [/hecho[s]?/iu, /antecedente[s]?/iu, /resulta que/iu],
  },
  {
    id: "fundamento",
    nombre: "Fundamento legal (artículos, leyes, CPC, CPE, etc.)",
    tests: [
      /fundamento[s]? de derecho/iu,
      /art\.\s*\d+/iu,
      /ley\s*n?\s*\d+/iu,
      /cpe/iu,
      /c\.?p\.?c/iu,
    ],
  },
  {
    id: "petitorio",
    nombre: "Petitorio preciso (qué se pide al juez)",
    tests: [/petitorio/iu, /por tanto/iu, /por lo expuesto/iu, /solicito/iu],
  },
  {
    id: "cuantia",
    nombre: "Cuantía o monto reclamado",
    tests: [/bs\.?/iu, /boliviano[s]?/iu, /por un monto de/iu, /cantidad de/iu],
  },
  {
    id: "prueba",
    nombre: "Ofrecimiento de prueba (documental, testifical, etc.)",
    tests: [
      /prueba[s]?/iu,
      /ofrezco en calidad de prueba/iu,
      /prueba documental/iu,
      /prueba testifical/iu,
    ],
  },
  {
    id: "firma",
    nombre: "Firma del demandante y abogado patrocinante",
    tests: [/firma/iu, /abog\./iu, /rpa\s*n/iu],
  },
];

// ===== EXPORTAR PDF =====
async function descargarPDF(informe: Informe, raw: string, fileName?: string) {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 50;
  let y = 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Informe de revisión de escrito civil", margin, y);
  y += 24;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Archivo: ${fileName || "—"}`, margin, y);
  y += 14;
  doc.text(
    `Palabras: ${informe.palabras} · Lectura: ${informe.tiempoLecturaMin} min`,
    margin,
    y
  );
  y += 18;
  doc.text(
    `Tipo de escrito: ${
      informe.tipo === "demanda" ? "Demanda civil" : "Memorial civil"
    }`,
    margin,
    y
  );
  y += 20;

  doc.setFont("helvetica", "bold");
  doc.text(
    `Puntaje checklist legal: ${informe.total}/100`,
    margin,
    y
  );
  y += 24;

  doc.setFontSize(12);
  for (const [k, r] of Object.entries(informe.rubros)) {
    doc.setFont("helvetica", "bold");
    doc.text(`${k.toUpperCase()}: ${r.score}`, margin, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    if (r.feedback.length) {
      r.feedback.forEach((f) => {
        const lines = doc.splitTextToSize(`• ${f}`, 500);
        doc.text(lines, margin + 12, y);
        y += lines.length * 12 + 6;
      });
    } else {
      doc.text("Sin observaciones.", margin + 12, y);
      y += 16;
    }
    y += 4;
  }

  // Checklist legal
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text(
    `Checklist legal (${informe.tipo === "demanda" ? "Demanda" : "Memorial"})`,
    margin,
    y
  );
  y += 16;
  doc.setFont("helvetica", "normal");
  informe.checklist.forEach((item) => {
    const label = `${item.presente ? "✓" : "✗"} ${item.nombre}`;
    const lines = doc.splitTextToSize(label, 500);
    doc.text(lines, margin + 12, y);
    y += lines.length * 12 + 4;
  });

  doc.save("informe-escrito-civil.pdf");
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
const promedio = (a: number[]) =>
  a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const clamp = (v: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, v));
function oraciones(t: string) {
  return t
    .split(/[\.!?‽¿¡]+[\s\n]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}
function heuristicaErrores(t: string) {
  const reglas = [
    {
      rx: /\s,|\s\.|\s;|\s:/g,
      penaliza: 1,
      msg: "Cuida los espacios antes de los signos de puntuación.",
    },
    {
      rx: /,,|\.{2,}|;;|::/g,
      penaliza: 1,
      msg: "Evita repetir signos de puntuación seguidos.",
    },
  ];
  let pen = 0;
  const hall: string[] = [];
  for (const r of reglas) {
    const m = t.match(r.rx);
    if (m?.length) {
      pen += r.penaliza * m.length;
      hall.push(r.msg);
    }
  }
  return { penalizacion: pen, hallazgos: [...new Set(hall)] };
}
function detectarSecciones(t: string) {
  const lines = t
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean);
  return SECCIONES_OBJETIVO.filter((s) =>
    lines.find((l) => l.toUpperCase().startsWith(s))
  );
}

// === Rubros según el Código Procesal Civil (estructura legal) ===
function evaluarEstructuraSegunCodigo(
  texto: string,
  tipo: TipoDoc
): { rubro: RubroResultado; checklist: ChecklistItem[] } {
  const defs = tipo === "demanda" ? REQUISITOS_DEMANDA : REQUISITOS_MEMORIAL;

  const checklist: ChecklistItem[] = defs.map((def) => ({
    id: def.id,
    nombre: def.nombre,
    presente: def.tests.some((rx) => rx.test(texto)),
  }));

  const total = checklist.length || 1;
  const ok = checklist.filter((c) => c.presente).length;

  // score solo para rubro estructura
  let score = texto.trim() ? Math.round(40 + (ok / total) * 60) : 0;
  const falt = checklist.filter((c) => !c.presente).map((c) => c.nombre);

  const feedback: string[] = [];
  if (!texto.trim()) {
    feedback.push(
      "Aún no has pegado ni cargado tu escrito. Sube tu archivo o escribe el texto para poder revisarlo."
    );
  } else if (falt.length) {
    feedback.push(
      `Según el Código Procesal Civil (Ley 439), te falta cuidar estos puntos: ${falt.join(
        ", "
      )}.`
    );
    feedback.push(
      "Añade estos elementos para que tu escrito sea más completo y formalmente correcto."
    );
  } else {
    feedback.push(
      "¡Muy bien! Tu escrito incluye los requisitos formales básicos que exige la Ley 439."
    );
  }

  return {
    rubro: { score, feedback },
    checklist,
  };
}

function evaluarClaridad(t: string): RubroResultado {
  const s = oraciones(t);
  const avg = promedio(s.map(contarPalabras));
  let score = 100;
  const fb: string[] = [];
  if (avg > 28) {
    score -= clamp((avg - 28) * 2, 0, 40);
    fb.push(
      "Algunas oraciones son muy largas. Intenta hacer frases más cortas y directas."
    );
  }
  if (avg < 8 && s.length > 2) {
    fb.push(
      "Tus oraciones son muy cortas. Puedes unir ideas relacionadas para que se lea más fluido."
    );
  }
  return { score: Math.round(clamp(score)), feedback: fb };
}
function evaluarFundamentos(t: string): RubroResultado {
  const art = (t.match(/art\.?\s*\d+/gi) || []).length;
  const ley = (t.match(/ley|cpe|c\.?p\.?c/gi) || []).length;
  let score = 50 + Math.min(30, art * 10) + Math.min(20, ley * 5);
  if (score > 100) score = 100;

  const feedback: string[] = [];
  if (art === 0 && ley === 0) {
    feedback.push(
      "Te falta citar artículos y normas (por ejemplo: art. 110 del CPC, Ley 439, CPE, etc.)."
    );
  } else if (art > 0 && ley === 0) {
    feedback.push(
      "Bien, ya citas artículos. Intenta también mencionar la ley a la que pertenecen."
    );
  } else if (art === 0 && ley > 0) {
    feedback.push(
      "Mencionas leyes, pero sería ideal acompañarlas con el número de artículo concreto."
    );
  }
  return { score, feedback };
}
function evaluarOrtografia(t: string): RubroResultado {
  const { penalizacion, hallazgos } = heuristicaErrores(t);
  let score = 100 - Math.min(60, penalizacion * 4);
  const feedback = hallazgos.length
    ? hallazgos
    : [
        "La ortografía general es buena. Revisa tildes en nombres propios y tecnicismos jurídicos.",
      ];
  return { score: Math.round(clamp(score)), feedback };
}

function consolidarInforme(texto: string, tipo: TipoDoc): Informe {
  const palabras = contarPalabras(texto);
  const tokens = Math.round(palabras * 1.33);
  const tiempoLecturaMin = Math.max(1, Math.round(palabras / 200));

  const { rubro: estructura, checklist } = evaluarEstructuraSegunCodigo(
    texto,
    tipo
  );
  const claridad = evaluarClaridad(texto);
  const fundamentos = evaluarFundamentos(texto);
  const ortografia = evaluarOrtografia(texto);

  const rubros = { estructura, claridad, fundamentos, ortografia };

  // Puntaje global SOLO según checklist
  const totalChecklist = checklist.length || 1;
  const okChecklist = checklist.filter((c) => c.presente).length;
  const total = Math.round((okChecklist / totalChecklist) * 100);

  return {
    tokens,
    palabras,
    tiempoLecturaMin,
    rubros,
    total,
    seccionesDetectadas: detectarSecciones(texto),
    checklist,
    tipo,
  };
}

/** ============================= UI ============================= */
const LABELS: Record<Rubro, string> = {
  estructura: "Estructura jurídica",
  claridad: "Claridad",
  fundamentos: "Fundamentos legales",
  ortografia: "Ortografía",
};
const DESCS: Record<Rubro, string> = {
  estructura:
    "Requisitos formales según el Código Procesal Civil (autoridad, datos de partes, petitorio, etc.)",
  claridad: "Longitud de oraciones y fluidez de la redacción",
  fundamentos: "Normativa, artículos y leyes que respalden tu posición",
  ortografia: "Puntuación, tildes y presentación general",
};

export default function EstudianteRevisor() {
  const [raw, setRaw] = useState("");
  const [fileName, setFileName] = useState("");
  const [analizando, setAnalizando] = useState(false);
  const [informe, setInforme] = useState<Informe | null>(null);
  const [tipo, setTipo] = useState<TipoDoc>("memorial"); // civil: memorial / demanda
  const [modal, setModal] = useState<null | "demanda" | "memorial">(null);
  const [historial, setHistorial] = useState<RevisionResumen[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function onFile(f?: File) {
    if (!f) return;
    setFileName(f.name);
    setAnalizando(true);
    if (f.name.endsWith(".docx")) setRaw(await leerDocxComoTexto(f));
    else setRaw(await f.text());
    setAnalizando(false);
    setInforme(null);
  }

  function analizarAhora() {
    if (!raw.trim())
      return alert("Pega o carga el texto de tu escrito primero.");
    const nuevoInforme = consolidarInforme(raw, tipo);
    setInforme(nuevoInforme);

    // Agregamos al "dashboard" de historial con fecha
    const nowISO = new Date().toISOString();
    setHistorial((prev) => {
      const item: RevisionResumen = {
        id: Date.now(),
        fechaISO: nowISO,
        tipo,
        score: nuevoInforme.total,
        palabras: nuevoInforme.palabras,
        fileName: fileName || "Sin nombre",
      };
      return [item, ...prev].slice(0, 6); // últimos 6
    });
  }

  function limpiar() {
    setRaw("");
    setInforme(null);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function exportarPDF() {
    if (informe) await descargarPDF(informe, raw, fileName);
  }

  const score = informe?.total ?? 0;
  const donut = {
    bg: `conic-gradient(var(--or) ${score * 3.6}deg, #f0f2f5 ${
      score * 3.6
    }deg)`,
  };

  const palabrasLive = raw ? contarPalabras(raw) : 0;

  const captionTexto =
    tipo === "demanda"
      ? "Puntaje global de tu demanda civil según el checklist legal (Ley 439)."
      : "Puntaje global de tu memorial civil según el checklist legal (Ley 439).";

  const formatFecha = (iso: string) =>
    new Date(iso).toLocaleString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="er-wrap er-rightLayout">
      <main className="er-main">
        <div className="er-header">
          <div className="er-title">
            <FileText size={22} />
            <h1>
              Revisor de escritos civiles{" "}
              <span className="er-badge">LITE · Ley 439</span>
            </h1>
          </div>
          <div className="er-actions">
            <button className="er-btn er-primary" onClick={analizarAhora}>
              {analizando ? (
                <Loader2 className="spin" size={16} />
              ) : (
                <Wand2 size={16} />
              )}
              <span>Analizar</span>
            </button>
            <button className="er-btn" onClick={limpiar}>
              <Trash2 size={16} />
              <span>Limpiar</span>
            </button>

            <button className="er-btn" disabled={!informe} onClick={exportarPDF}>
              <Download size={16} />
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>

        {/* Filtros: área y tipo de escrito */}
        <section className="er-filters er-card">
          <div className="er-filter-block">
            <span className="er-filter-label">ÁREA</span>
            <div className="er-pills">
              <button type="button" className="er-pill on">
                Civil
              </button>
              <button
                type="button"
                className="er-pill disabled"
                title="El revisor penal estará disponible más adelante."
              >
                Penal
                <span className="er-pill-tag">Próximamente</span>
              </button>
            </div>
          </div>

          <div className="er-filter-block">
            <span className="er-filter-label">TIPO DE ESCRITO CIVIL</span>
            <div className="er-pills">
              <button
                type="button"
                className={`er-pill ${tipo === "memorial" ? "on" : ""}`}
                onClick={() => setTipo("memorial")}
              >
                Memorial
              </button>
              <button
                type="button"
                className={`er-pill ${tipo === "demanda" ? "on" : ""}`}
                onClick={() => setTipo("demanda")}
              >
                Demanda
              </button>
            </div>

            {/* Pasos didácticos */}
            <div className="er-steps">
              <div className="er-step">
                <span className="er-step-num">1</span>
                <div className="er-step-text">
                  <span className="er-step-title">Elige el tipo</span>
                  <span className="er-step-sub">
                    Memorial o Demanda civil
                  </span>
                </div>
              </div>
              <div className="er-step">
                <span className="er-step-num">2</span>
                <div className="er-step-text">
                  <span className="er-step-title">Pega o sube tu archivo</span>
                  <span className="er-step-sub">
                    .docx o .txt con tu escrito
                  </span>
                </div>
              </div>
              <div className="er-step">
                <span className="er-step-num">3</span>
                <div className="er-step-text">
                  <span className="er-step-title">Analiza y revisa</span>
                  <span className="er-step-sub">
                    Checklist legal + retroalimentación
                  </span>
                </div>
              </div>
            </div>

            <div className="er-filter-buttons">
              {tipo === "demanda" && (
                <button
                  type="button"
                  className="er-btn er-btn-ghost"
                  onClick={() => setModal("demanda")}
                >
                  <Info size={14} />
                  <span>Ver requisitos de la demanda civil</span>
                </button>
              )}
              {tipo === "memorial" && (
                <button
                  type="button"
                  className="er-btn er-btn-ghost"
                  onClick={() => setModal("memorial")}
                >
                  <Info size={14} />
                  <span>Ver requisitos del memorial civil</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Editor */}
        <div className="er-editor er-card">
          <div className="er-upload">
            <div className="er-upload-l">
              <Upload size={16} />
              <span>Subir archivo (.docx o .txt)</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".docx,.txt,text/plain"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </div>
          <textarea
            value={raw}
            onChange={(e) => {
              setRaw(e.target.value);
              setInforme(null);
            }}
            placeholder={
              tipo === "demanda"
                ? "Pega aquí tu DEMANDA civil para revisarla según la Ley 439 (juez competente, datos de partes, hechos, fundamento legal, petitorio, prueba, etc.)."
                : "Pega aquí tu MEMORIAL civil para revisarlo según la Ley 439 (autoridad, identificación, proceso, motivo, petitorio, otrosíes, firmas, fecha, etc.)."
            }
          />
          <div className="er-meta">
            <span>
              {palabrasLive > 0
                ? `${palabrasLive} palabras aproximadas · ${
                    Math.max(1, Math.round(palabrasLive / 200))
                  } min de lectura`
                : "Cuando escribas o pegues tu texto, aquí verás un resumen rápido."}
            </span>
            {fileName && <span className="er-file">{fileName}</span>}
          </div>
        </div>

        {/* Rubros */}
        <section className="er-rubros">
          {(Object.keys(LABELS) as Rubro[]).map((r) => (
            <div className="er-rubro er-card" key={r}>
              <div className="er-rubro-head">
                <div className="er-rubro-title">
                  <span className="er-dot" />
                  <span>{LABELS[r]}</span>
                </div>
                <div className="er-rubro-score">
                  {informe ? informe.rubros[r].score : "–"}
                </div>
              </div>
              <div className="er-desc">{DESCS[r]}</div>
              <div className="er-bar">
                <div
                  className="er-bar-fill"
                  style={{
                    width: `${informe?.rubros[r].score ?? 0}%`,
                  }}
                />
              </div>
              {informe?.rubros[r].feedback.length ? (
                <ul className="er-feedback">
                  {informe.rubros[r].feedback.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              ) : (
                <div className="er-empty">Sin observaciones.</div>
              )}
            </div>
          ))}
        </section>
      </main>

      {/* Sidebar derecha */}
      <aside className="er-sideRight">
        {/* Puntaje global */}
        <div className="er-card er-score">
          <div className="er-donut" style={{ background: donut.bg }}>
            <div className="er-donut-hole">
              <div className="er-score-num">{score}</div>
              <div className="er-score-sub">/100</div>
            </div>
          </div>
          <div className="er-score-caption">{captionTexto}</div>
        </div>

        {/* CHECKLIST LEGAL */}
        <div className="er-card">
          <div className="er-subtitle">Checklist legal civil</div>
          {informe && informe.checklist.length ? (
            <ul className="er-check">
              {informe.checklist.map((c) => (
                <li key={c.id} className={c.presente ? "ok" : "miss"}>
                  <div className="er-check-name">
                    <span className="er-check-dot" />
                    <span>{c.nombre}</span>
                  </div>
                  <span className="er-check-tag">
                    {c.presente ? "OK" : "Falta"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="er-empty">
              Analiza tu escrito para ver qué requisitos del CPC estás cumpliendo.
            </div>
          )}
        </div>

        {/* Secciones detectadas */}
        <div className="er-card">
          <div className="er-subtitle">Secciones detectadas</div>
          <div className="er-chips">
            {informe?.seccionesDetectadas.length ? (
              informe.seccionesDetectadas.map((s) => (
                <span key={s} className="er-chip">
                  {s}
                </span>
              ))
            ) : (
              <span className="er-empty">
                Todavía no se reconocen encabezados típicos (VISTOS, CONSIDERANDO,
                POR TANTO…)
              </span>
            )}
          </div>
        </div>

        {/* Dashboard mini: historial de revisiones */}
        <div className="er-card">
          <div className="er-subtitle">Historial de revisiones</div>
          {historial.length ? (
            <ul className="er-history">
              {historial.map((h) => (
                <li key={h.id} className="er-history-row">
                  <div className="er-history-main">
                    <span
                      className={`er-history-pill ${
                        h.tipo === "demanda" ? "dem" : "mem"
                      }`}
                    >
                      {h.tipo === "demanda" ? "Demanda" : "Memorial"}
                    </span>
                    <span className="er-history-file" title={h.fileName}>
                      {h.fileName}
                    </span>
                  </div>
                  <div className="er-history-meta">
                    <span className="er-history-date">
                      {formatFecha(h.fechaISO)}
                    </span>
                    <span className="er-history-score">
                      {h.score}
                      <span className="er-history-score-suf">/100</span>
                    </span>
                  </div>
                  <div className="er-history-bar">
                    <div
                      className="er-history-bar-fill"
                      style={{ width: `${h.score}%` }}
                    />
                  </div>
                  <div className="er-history-extra">
                    {h.palabras} palabras aprox.
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="er-empty">
              Cuando analices tus escritos, aquí verás un pequeño dashboard con las
              últimas revisiones.
            </div>
          )}
        </div>

        {/* Tips / mejoras */}
        <div className="er-card">
          <div className="er-subtitle">
            <Lightbulb size={16} /> Mejoras
          </div>
          <ul className="er-tips">
            {informe
              ? Object.values(informe.rubros)
                  .flatMap((r) => r.feedback)
                  .map((m, i) => <li key={i}>{m}</li>)
              : [
                  <li key="0">
                    Elige si es <b>Memorial</b> o <b>Demanda</b>, pega tu texto y
                    pulsa <b>Analizar</b> para recibir una retroalimentación guiada.
                  </li>,
                ]}
          </ul>
        </div>
      </aside>

      {/* MODAL: Requisitos demanda / memorial */}
      {modal && (
        <div
          className="er-modal-backdrop"
          onClick={() => setModal(null)}
        >
          <div
            className="er-modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="er-modal-header">
              <div className="er-modal-title">
                <Info size={18} />
                <span>
                  {modal === "demanda"
                    ? "Requisitos de la demanda civil (Ley 439)"
                    : "Requisitos del memorial civil (Ley 439)"}
                </span>
              </div>
              <button
                type="button"
                className="er-modal-close"
                onClick={() => setModal(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="er-modal-body">
              {modal === "demanda" ? (
                <>
                  <div className="er-modal-tags">
                    <span className="er-tag">Demanda</span>
                    <span className="er-tag soft">Art. 110 CPC</span>
                  </div>
                  <p>
                    Piensa tu <b>demanda civil</b> como un mapa: el juez necesita
                    ver claramente quién eres, qué pasó, qué norma te protege y qué
                    le estás pidiendo.
                  </p>
                  <div className="er-modal-grid">
                    <div className="er-modal-card">
                      <h4>1. Encabezado</h4>
                      <ul>
                        <li>
                          <b>Autoridad:</b> “Señor Juez Público Civil y Comercial N°…”.
                        </li>
                        <li>
                          <b>Demandante:</b> nombre, C.I., estado civil, profesión,
                          domicilio.
                        </li>
                        <li>
                          <b>Demandado:</b> nombre y domicilio (si no sabes, luego
                          puedes pedir edictos).
                        </li>
                      </ul>
                    </div>
                    <div className="er-modal-card">
                      <h4>2. Cuerpo de la demanda</h4>
                      <ul>
                        <li>
                          <b>Hechos:</b> cuenta la historia de forma ordenada
                          (cronológica).
                        </li>
                        <li>
                          <b>Fundamento legal:</b> cita artículos y leyes que te
                          respaldan (CPC, Código Civil, CPE, leyes especiales).
                        </li>
                        <li>
                          <b>Cuantía:</b> indica el monto o valor económico del
                          conflicto si es patrimonial.
                        </li>
                      </ul>
                    </div>
                    <div className="er-modal-card">
                      <h4>3. Cierre</h4>
                      <ul>
                        <li>
                          <b>Petitorio:</b> explica qué quieres que el juez declare
                          (nulidad, pago, usucapión, etc.).
                        </li>
                        <li>
                          <b>Prueba:</b> ofrece documentos, testigos, pericias, etc.
                        </li>
                        <li>
                          <b>Firma y abogado:</b> tu firma y la de tu abogado con RPA.
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p className="er-modal-note">
                    El checklist del revisor marca cada uno de estos puntos como{" "}
                    <b>OK</b> o <b>Falta</b>. Tu objetivo es lograr que todos estén en
                    verde.
                  </p>
                </>
              ) : (
                <>
                  <div className="er-modal-tags">
                    <span className="er-tag">Memorial</span>
                    <span className="er-tag soft">Art. 113 CPC</span>
                  </div>
                  <p>
                    Un <b>memorial</b> es un escrito corto dentro del proceso. Debe
                    ser directo, respetuoso y cumplir algunos mínimos formales.
                  </p>
                  <div className="er-modal-grid">
                    <div className="er-modal-card">
                      <h4>1. Encabezado</h4>
                      <ul>
                        <li>
                          <b>Autoridad:</b> “Señor Juez…”.
                        </li>
                        <li>
                          <b>Identificación:</b> quién eres (nombre, C.I., mayor de
                          edad, domicilio).
                        </li>
                        <li>
                          <b>Proceso:</b> NUREJ y carátula (demandante c/ demandado).
                        </li>
                      </ul>
                    </div>
                    <div className="er-modal-card">
                      <h4>2. Cuerpo del memorial</h4>
                      <ul>
                        <li>
                          <b>Motivo:</b> explica qué estás pidiendo o comunicando
                          (ej.: “Señor Juez, en mérito a… expongo y solicito…”).
                        </li>
                        <li>
                          <b>Claridad:</b> un solo objetivo por memorial (no mezcles
                          demasiadas cosas).
                        </li>
                      </ul>
                    </div>
                    <div className="er-modal-card">
                      <h4>3. Cierre</h4>
                      <ul>
                        <li>
                          <b>Petitorio:</b> “Por lo expuesto, solicito…” (lo que quieres
                          que el juez haga).
                        </li>
                        <li>
                          <b>Otrosí(es):</b> para adjuntar documentos, señalar prueba,
                          pedir notificaciones, etc.
                        </li>
                        <li>
                          <b>Firma, abogado y fecha:</b> siempre al final.
                        </li>
                      </ul>
                    </div>
                  </div>
                  <p className="er-modal-note">
                    Cada vez que envíes un memorial, repasa mentalmente esta lista.
                    El revisor te ayudará a detectar si olvidaste algo.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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

/* Contenedor: lateral a la DERECHA */
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
.er-score{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:8px;
  text-align:center;
}
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
.er-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:12px;
  flex-wrap:wrap;
}
.er-title{ display:flex; align-items:center; gap:10px; }
.er-title h1{ font-size:1.4rem; font-weight:800; color:#222; }
.er-badge{
  margin-left:8px; font-size:.68rem; font-weight:800; letter-spacing:.06em;
  background:var(--or-soft); color:var(--or-2); padding:3px 8px; border-radius:999px;
  border:1px solid #ffd1bd;
}
.er-actions{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.er-btn{
  display:inline-flex; align-items:center; gap:8px;
  background:#fff; border:1px solid var(--line);
  padding:9px 12px; border-radius:14px; font-weight:700; color:#2b2b2b;
  font-size:.9rem;
}
.er-btn:disabled{ opacity:.5; cursor:not-allowed; }
.er-primary{
  background:var(--or); color:#fff; border:none;
  box-shadow: 0 10px 24px rgba(255,138,76,.22);
}
.er-btn-ghost{
  margin-top:6px;
  background:transparent;
  border-style:dashed;
  border-radius:999px;
  padding-inline:10px;
  font-size:.8rem;
  color:#c05621;
}
.spin{ animation:spin .9s linear infinite; }
@keyframes spin { to{ transform:rotate(360deg);} }

/* Filtros (área, tipo de escrito) */
.er-filters{
  display:flex;
  flex-wrap:wrap;
  gap:16px;
}
.er-filter-block{
  flex:1 1 220px;
  display:flex;
  flex-direction:column;
  gap:6px;
}
.er-filter-label{
  font-size:.78rem;
  text-transform:uppercase;
  letter-spacing:.08em;
  color:#9aa4ad;
  font-weight:700;
}
.er-pills{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
}
.er-pill{
  border-radius:999px;
  border:1px solid var(--line);
  padding:6px 12px;
  font-size:.85rem;
  background:#fff;
  display:inline-flex;
  align-items:center;
  gap:6px;
}
.er-pill.on{
  background:var(--or-soft);
  border-color:var(--or);
  color:#c05621;
}
.er-pill.disabled{
  opacity:.5;
  cursor:not-allowed;
}
.er-pill-tag{
  font-size:.7rem;
  text-transform:uppercase;
  letter-spacing:.06em;
  padding:2px 6px;
  border-radius:999px;
  border:1px dashed #ffbfa0;
}
.er-filter-buttons{
  display:flex;
  flex-wrap:wrap;
  gap:8px;
}

/* Pasos didácticos debajo de los pills */
.er-steps{
  margin-top:10px;
  display:grid;
  gap:8px;
}
@media (min-width: 720px){
  .er-steps{
    grid-template-columns: repeat(3, minmax(0,1fr));
  }
}
.er-step{
  display:flex;
  align-items:flex-start;
  gap:8px;
  padding:8px 10px;
  border-radius:12px;
  background:#fff7ed;
  border:1px solid #fed7aa;
}
.er-step-num{
  width:22px;
  height:22px;
  border-radius:999px;
  background:#ffedd5;
  color:#c05621;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:.8rem;
  font-weight:700;
}
.er-step-text{
  display:flex;
  flex-direction:column;
  gap:2px;
}
.er-step-title{
  font-size:.8rem;
  font-weight:700;
  color:#7c2d12;
}
.er-step-sub{
  font-size:.78rem;
  color:#9a3412;
}

/* Editor */
.er-editor textarea{
  width:100%; min-height:42vh; resize:vertical;
  border:1px solid var(--line); border-radius:14px;
  padding:12px 14px; outline:none;
  box-shadow: inset 0 1px 0 rgba(0,0,0,.02);
  font-size:.95rem;
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

/* Checklist legal */
.er-check{
  list-style:none;
  margin:10px 0 0 0;
  padding:0;
  display:grid;
  gap:6px;
  font-size:.88rem;
}
.er-check li{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
}
.er-check-name{
  display:flex;
  align-items:center;
  gap:8px;
  flex:1;
}
.er-check-dot{
  width:8px;height:8px;border-radius:999px;
}
.er-check li.ok .er-check-dot{ background:#16a34a; }
.er-check li.miss .er-check-dot{ background:#f97316; }
.er-check-tag{
  font-size:.75rem;
  padding:2px 8px;
  border-radius:999px;
  border:1px solid #e5e7eb;
}
.er-check li.ok .er-check-tag{
  background:#ecfdf3;
  color:#166534;
  border-color:#bbf7d0;
}
.er-check li.miss .er-check-tag{
  background:#fff7ed;
  color:#9a3412;
  border-color:#fed7aa;
}

/* Historial (dashboard mini) */
.er-history{
  list-style:none;
  margin:10px 0 0 0;
  padding:0;
  display:grid;
  gap:8px;
}
.er-history-row{
  border-radius:12px;
  border:1px solid #f1f5f9;
  padding:6px 8px;
  display:flex;
  flex-direction:column;
  gap:4px;
}
.er-history-main{
  display:flex;
  align-items:center;
  gap:8px;
}
.er-history-pill{
  font-size:.7rem;
  text-transform:uppercase;
  letter-spacing:.08em;
  padding:2px 8px;
  border-radius:999px;
}
.er-history-pill.dem{
  background:#fef3c7;
  color:#92400e;
}
.er-history-pill.mem{
  background:#e0f2fe;
  color:#075985;
}
.er-history-file{
  font-size:.82rem;
  color:#111827;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
}
.er-history-meta{
  display:flex;
  align-items:center;
  justify-content:space-between;
  font-size:.78rem;
  color:#6b7280;
}
.er-history-score{
  font-weight:700;
  color:#111827;
}
.er-history-score-suf{
  font-size:.7rem;
  color:#9ca3af;
}
.er-history-bar{
  height:4px;
  border-radius:999px;
  background:#f3f4f6;
  overflow:hidden;
}
.er-history-bar-fill{
  height:100%;
  background:linear-gradient(90deg, var(--or), #f97316);
}
.er-history-extra{
  font-size:.75rem;
  color:#9ca3af;
}

/* MODAL */
.er-modal-backdrop{
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.45);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:50;
}
.er-modal{
  background:#fff;
  border-radius:20px;
  box-shadow:0 24px 80px rgba(15,23,42,.35);
  width:min(620px, 94vw);
  max-height:84vh;
  display:flex;
  flex-direction:column;
}
.er-modal-header{
  padding:14px 18px;
  border-bottom:1px solid #e5e7eb;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:8px;
}
.er-modal-title{
  display:flex;
  align-items:center;
  gap:8px;
  font-weight:700;
  font-size:.98rem;
}
.er-modal-close{
  border:none;
  background:transparent;
  padding:4px;
  border-radius:999px;
}
.er-modal-close:hover{
  background:#f3f4f6;
}
.er-modal-body{
  padding:14px 18px 18px 18px;
  overflow:auto;
  font-size:.9rem;
  color:#374151;
  display:flex;
  flex-direction:column;
  gap:10px;
}
.er-modal-tags{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}
.er-tag{
  font-size:.75rem;
  padding:3px 8px;
  border-radius:999px;
  background:#fee2e2;
  color:#b91c1c;
}
.er-tag.soft{
  background:#e0f2fe;
  color:#0369a1;
}
.er-modal-grid{
  display:grid;
  gap:10px;
}
@media (min-width: 640px){
  .er-modal-grid{
    grid-template-columns: repeat(3, minmax(0,1fr));
  }
}
.er-modal-card{
  border-radius:12px;
  border:1px solid #e5e7eb;
  background:#f9fafb;
  padding:8px 10px;
}
.er-modal-card h4{
  font-size:.86rem;
  font-weight:700;
  margin-bottom:4px;
}
.er-modal-card ul{
  margin:0;
  padding-left:1.2rem;
  display:grid;
  gap:2px;
  font-size:.82rem;
}
.er-modal-note{
  margin-top:4px;
  font-size:.82rem;
  color:#6b7280;
}

/* Responsive */
@media (max-width: 900px){
  .er-wrap{
    grid-template-columns: 1fr;
    padding-inline:14px;
  }
  .er-sideRight{
    order:-1;
  }
}
@media (max-width: 640px){
  .er-header{
    align-items:flex-start;
  }
  .er-title h1{
    font-size:1.2rem;
  }
  .er-card{
    padding:12px;
  }
}
`;
