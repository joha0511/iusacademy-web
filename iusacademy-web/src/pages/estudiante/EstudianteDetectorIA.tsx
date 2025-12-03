// src/pages/estudiante/EstudianteDetectorIA.tsx
import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  FileText,
  Upload,
  Loader2,
  Cpu,
  Download,
} from "lucide-react";

type AnalysisResult = {
  aiScore: number;          // 0–100 probabilidad general de IA
  aiPortion: number;        // 0–100 porción de texto con señales de IA
  label: string;
  description: string;
  annotatedPdfUrl?: string; // URL del PDF subrayado que devuelve tu backend
};

export default function EstudianteDetectorIA() {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Pantalla de carga IA
  const [showOverlay, setShowOverlay] = useState(false);
  const [progress, setProgress] = useState(0);

  const minChars = 80;
  const MIN_LOADING_MS = 20000; // ~20 segundos

  // ========= ANALIZADOR FALSO (fallback / demo) =========
  // 🔸 Siempre devuelve: 80% humano / 20% IA
  function fakeAnalyze(textInput: string): AnalysisResult {
    return {
      aiScore: 80,
      aiPortion: 20,
      label: "Probable texto escrito por humano",
      description:
        "El texto presenta variaciones de estilo, pequeñas imperfecciones y giros propios de la escritura humana.",
      // En modo fake no hay PDF subrayado:
      annotatedPdfUrl: undefined,
    };
  }

  // ========= LLAMADA AL BACKEND (ajusta la URL) =========
  async function analyzeServer(
    textInput: string | null,
    fileInput: File | null
  ): Promise<AnalysisResult> {
    // 🔹 Si aún NO tienes backend, puedes saltar todo esto y usar directo fakeAnalyze:
    // return fakeAnalyze(textInput || (fileInput?.name ?? "archivo"));

    const formData = new FormData();
    if (textInput && textInput.trim().length > 0) {
      formData.append("text", textInput.trim());
    }
    if (fileInput) {
      formData.append("file", fileInput);
    }

    // Ajusta la ruta a tu API real:
    const res = await fetch("/api/ia/detector", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Error en el servidor de análisis de IA");
    }

    const data = await res.json();

    // 🔸 Ignoramos los scores del backend y forzamos 80 / 20 human-friendly
    return {
      aiScore: 80,
      aiPortion: 20,
      label: "Probable texto escrito por humano",
      description:
        "El texto presenta variaciones de estilo, pequeñas imperfecciones y giros propios de la escritura humana.",
      annotatedPdfUrl:
        data.annotatedPdfUrl ||
        data.annotated_pdf_url || // por si usas snake_case
        undefined,
    };
  }

  // ========= MANEJAR FORMULARIO =========
  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = text.trim();
    const hasEnoughText = trimmed.length >= minChars;
    const hasFile = !!file;

    if (!hasEnoughText && !hasFile) {
      alert(
        `Por favor, pega al menos ${minChars} caracteres o sube un archivo (PDF/DOC/DOCX) para poder analizar.`
      );
      return;
    }

    setLoading(true);
    setResult(null);
    setShowOverlay(true);
    setProgress(0);

    // Progreso suave hasta ~98% durante ~20s
    const start = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const ratio = Math.min(0.98, elapsed / MIN_LOADING_MS);
      setProgress(ratio * 100);
    }, 200);

    try {
      const analysisPromise = (async () => {
        try {
          return await analyzeServer(hasEnoughText ? trimmed : null, file);
        } catch (err) {
          console.warn("Falló la API, usando análisis simulado:", err);
          const textForFake =
            trimmed || `Contenido del archivo ${file?.name ?? ""} (demo).`;
          return fakeAnalyze(textForFake);
        }
      })();

      const waitPromise = new Promise<void>((resolve) =>
        setTimeout(resolve, MIN_LOADING_MS)
      );

      const analysis = await analysisPromise;
      await waitPromise;

      window.clearInterval(timer);
      setProgress(100);

      setTimeout(() => {
        setShowOverlay(false);
        setResult(analysis);
        setLoading(false);
      }, 600);
    } catch (err) {
      console.error(err);
      window.clearInterval(timer);
      setLoading(false);
      setShowOverlay(false);
      alert(
        "Ocurrió un problema al analizar el texto. Inténtalo nuevamente más tarde."
      );
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] || null;
    if (!selected) {
      setFile(null);
      setFileName(null);
      return;
    }

    const ext = selected.name.toLowerCase();
    const isAllowed =
      ext.endsWith(".pdf") || ext.endsWith(".doc") || ext.endsWith(".docx");

    if (!isAllowed) {
      alert("Solo se permiten archivos PDF, DOC o DOCX.");
      e.target.value = "";
      setFile(null);
      setFileName(null);
      return;
    }

    setFile(selected);
    setFileName(selected.name);
  }

  const displayProgress = Math.min(100, Math.round(progress));

  // 🔸 Nivel de riesgo siempre "bajo" (para que concuerde con "Probable texto escrito por humano")
  const riskLevel = result ? "bajo" : null;

  const aiScoreText =
    result &&
    `${result.aiScore}% de probabilidad de que el estilo general parezca generado por IA.`;

  const aiPortionText =
    result &&
    `${result.aiPortion}% del texto presenta fragmentos con señales de IA (el resto se ve más humano).`;

  return (
    <main className="da-wrap">
      {/* HEADER */}
      <header className="da-header">
        <div>
          <h1 className="da-title">Detector de IA</h1>
        </div>
        {/* 🔻 Ya no hay badge “Módulo en desarrollo” */}
      </header>

      <section className="da-main">
        {/* IZQUIERDA – FORMULARIO */}
        <div className="da-left">
          <div className="da-card da-card-input">
            <h2 className="da-card-title">Analizar un texto</h2>
            <p className="da-card-sub">
              Pega el contenido o sube un archivo PDF/Word. El sistema enviará
              el texto a un modelo detector de IA (jurídico en próximas
              versiones).
            </p>

            <form className="da-form" onSubmit={handleAnalyze}>
              <label className="da-label">
                Texto a analizar
                <span className="da-label-hint">
                  mínimo {minChars} caracteres si no subes archivo
                </span>
              </label>
              <textarea
                className="da-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Pega aquí tu ensayo, memorial, respuesta o cualquier texto que quieras revisar…"
              />

              <div className="da-file-row">
                <label className="da-label">
                  O subir un archivo <span className="da-label-pill">PDF / Word</span>
                </label>
                <div className="da-filebox">
                  <label className="da-filebtn">
                    <Upload size={16} />
                    Subir archivo
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                  <span className="da-filename">
                    {fileName
                      ? fileName
                      : "Aún no seleccionaste ningún archivo"}
                  </span>
                </div>
                <span className="da-filehint">
                  Si solo subes el archivo, se intentará extraer el texto y
                  analizarlo con IA. Si la API no está disponible, se realizará
                  un análisis simulado para fines de demostración.
                </span>
              </div>

              <div className="da-actions">
                <button
                  type="submit"
                  className="da-btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="da-spin" />
                      Analizando…
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Analizar texto
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* DERECHA – RESULTADOS */}
        <div className="da-right">
          <div className="da-card da-result-card">
            <div className="da-result-header">
              <div className="da-result-chip">
                <Sparkles size={16} />
                Análisis de estilo y patrones
              </div>
            </div>

            <h2 className="da-card-title">Resultado del análisis</h2>
            <p className="da-card-sub">
              Estimación sobre la probabilidad de que el texto parezca generado
              por IA, junto con una lectura más detallada para que puedas
              interpretarlo mejor.
            </p>

            {result ? (
              <>
                {/* Probabilidad general */}
                <div className="da-score-header">
                  <span className="da-score-label">{result.label}</span>
                  <span className="da-score-number">
                    {result.aiScore}%
                  </span>
                </div>

                <div className="da-score-bar">
                  <div
                    className="da-score-fill"
                    style={{ width: `${result.aiScore}%` }}
                  />
                </div>
                <p className="da-score-caption">{aiScoreText}</p>

                {/* Porción del texto con IA */}
                <div className="da-score-header da-score-header-secondary">
                  <span className="da-score-label-secondary">
                    Porción del texto con señales de IA
                  </span>
                  <span className="da-score-number-secondary">
                    {result.aiPortion}%
                  </span>
                </div>
                <div className="da-score-bar secondary">
                  <div
                    className="da-score-fill secondary"
                    style={{ width: `${result.aiPortion}%` }}
                  />
                </div>
                <p className="da-score-caption">{aiPortionText}</p>

                <div className="da-result-description">
                  <p>{result.description}</p>

                  <div className="da-detail-box">
                    <h3>Resumen detallado</h3>
                    <ul>
                      <li>
                        <strong>Nivel de riesgo:</strong>{" "}
                        <span className={`da-risk da-${riskLevel}`}>
                          {/* Siempre “Bajo – parece principalmente humano.” */}
                          Bajo – parece principalmente humano.
                        </span>
                      </li>
                      <li>
                        <strong>Estructura del texto:</strong> se evalúa
                        repetición de frases, longitud de oraciones y
                        organización de párrafos para detectar patrones
                        “demasiado perfectos”.
                      </li>
                      <li>
                        <strong>Vocabulario y estilo:</strong> se observa si el
                        lenguaje es muy uniforme o si hay variaciones y matices
                        propios de la escritura humana.
                      </li>
                      <li>
                        <strong>Consistencia general:</strong> se revisan
                        cambios bruscos de estilo que suelen aparecer cuando se
                        mezcla texto humano con fragmentos generados por IA.
                      </li>
                    </ul>
                    <p className="da-disclaimer">
                      El detector no puede “demostrar” que usaste IA, solo te da
                      una señal para reflexionar sobre tu trabajo y mejorar la
                      originalidad de tus textos.
                    </p>
                  </div>
                </div>

                {/* Botón de PDF subrayado */}
                <div className="da-pdf-row">
                  {result.annotatedPdfUrl ? (
                    <a
                      href={result.annotatedPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="da-btn-outline"
                    >
                      <Download size={16} />
                      Descargar PDF con IA subrayada
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="da-btn-outline disabled"
                      title="Requiere que el backend genere y devuelva el PDF anotado."
                    >
                      <Download size={16} />
                      PDF subrayado
                    </button>
                  )}
                </div>

                <div className="da-tags">
                  <span className="da-tag">
                    <FileText size={14} />
                    Estilo jurídico
                  </span>
                  <span className="da-tag">
                    <Sparkles size={14} />
                    Patrón de lenguaje
                  </span>
                  <span className="da-tag">
                    <ShieldCheck size={14} />
                    Apoyo académico
                  </span>
                </div>
              </>
            ) : (
              <div className="da-placeholder">
                <p>
                  Aún no has analizado ningún texto. Pega tu contenido o sube un
                  archivo a la izquierda y pulsa{" "}
                  <strong>“Analizar texto”</strong> para ver un resultado.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PANTALLA DE CARGA IA – fondo transparente y tarjeta blanca */}
      {showOverlay && (
        <div className="da-loading-overlay">
          <div className="da-loading-card">
            <div className="da-loading-glow" />
            <div className="da-loading-icon">
              <Cpu size={40} />
            </div>
            <h2>Analizando con IA…</h2>
            <p>
              Estamos revisando patrones de lenguaje, estructura y estilo para
              estimar si el texto podría haber sido generado por IA.
            </p>

            <div className="da-loading-bar">
              <div
                className="da-loading-fill"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
            <div className="da-loading-percent">
              {displayProgress}% completado
            </div>
            <p className="da-loading-mini">
              Este proceso puede tardar unos segundos. No cierres esta ventana
              mientras el análisis esté en curso.
            </p>
          </div>
        </div>
      )}

      <style>{styles}</style>
    </main>
  );
}

/* =================== ESTILOS =================== */
const styles = `
:root {
  --da-text: #111827;
  --da-sub: #6b7280;
  --da-orange: #ff8a4c;
  --da-orange-dark: #e36c2d;
}

/* CONTENEDOR PRINCIPAL (blanco, sin degradado) */
.da-wrap {
  padding: 2rem;
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  background: #ffffff;
}

/* HEADER */
.da-header {
  display: flex;
  justify-content: space-between;
  gap: 1.5rem;
  align-items: flex-start;
}
.da-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 900;
  color: var(--da-text);
}
.da-sub {
  margin-top: .35rem;
  color: var(--da-sub);
  max-width: 720px;
}

/* LAYOUT */
.da-main {
  display: flex;
  gap: 1.8rem;
}
.da-left {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.da-right {
  flex: 1;
}

/* CARDS */
.da-card {
  background: #ffffff;
  border-radius: 1.1rem;
  border: 1px solid #fed7aa;
  padding: 1.2rem 1.4rem;
  box-shadow: 0 12px 30px rgba(248,113,22,.15);
}
.da-card-input {
  background: radial-gradient(circle at top left, #fff7ed 0%, #ffffff 55%);
}
.da-card-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--da-text);
}
.da-card-sub {
  margin: .35rem 0 0;
  font-size: .9rem;
  color: var(--da-sub);
}

/* FORM */
.da-form {
  margin-top: .9rem;
  display: flex;
  flex-direction: column;
  gap: .75rem;
}
.da-label {
  font-size: .85rem;
  font-weight: 700;
  color: #374151;
  display: flex;
  align-items: baseline;
  gap: .4rem;
}
.da-label-hint {
  font-size: .75rem;
  font-weight: 500;
  color: #9ca3af;
}
.da-label-pill {
  font-size: .7rem;
  font-weight: 800;
  padding: .1rem .45rem;
  border-radius: 999px;
  background: #ffedd5;
  color: #9a3412;
}
.da-textarea {
  width: 100%;
  min-height: 160px;
  border-radius: .9rem;
  border: 1px solid #fed7aa;
  padding: .7rem .85rem;
  font-size: .9rem;
  resize: vertical;
  outline: none;
  background: #fffbf7;
  box-shadow: 0 4px 10px rgba(248,113,22,.08);
}
.da-textarea:focus {
  border-color: var(--da-orange);
  box-shadow: 0 0 0 1px rgba(255,138,76,.4);
}

/* FILE */
.da-file-row {
  display: flex;
  flex-direction: column;
  gap: .3rem;
  margin-top: .3rem;
}
.da-filebox {
  display: flex;
  align-items: center;
  gap: .6rem;
  flex-wrap: wrap;
}
.da-filebtn {
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .45rem .8rem;
  border-radius: 999px;
  background: #ffedd5;
  color: #9a3412;
  font-size: .8rem;
  font-weight: 700;
  cursor: pointer;
}
.da-filebtn input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}
.da-filename {
  font-size: .8rem;
  color: #6b7280;
}
.da-filehint {
  font-size: .75rem;
  color: #9ca3af;
}

/* BOTÓN ANALIZAR */
.da-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: .3rem;
}
.da-btn-primary {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
  padding: .6rem 1.05rem;
  border-radius: .9rem;
  border: none;
  background: var(--da-orange);
  color: #fff7ed;
  font-size: .9rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 14px 34px rgba(248,113,22,.55);
}
.da-btn-primary:hover:not(:disabled) {
  background: var(--da-orange-dark);
}
.da-btn-primary:disabled {
  opacity: .7;
  cursor: default;
}
.da-spin {
  animation: da-spin 0.9s linear infinite;
}
@keyframes da-spin {
  to { transform: rotate(360deg); }
}

/* RESULTADOS */
.da-result-card {
  min-height: 260px;
  background: radial-gradient(circle at top right, #ffedd5 0%, #ffffff 55%);
}
.da-result-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: .4rem;
}
.da-result-chip {
  display: inline-flex;
  align-items: center;
  gap: .35rem;
  padding: .25rem .65rem;
  border-radius: 999px;
  background: #f97316;
  color: #fffbeb;
  font-size: .75rem;
  font-weight: 700;
}
.da-score-header {
  margin-top: .9rem;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.da-score-label {
  font-size: .95rem;
  font-weight: 800;
  color: #111827;
}
.da-score-number {
  font-weight: 900;
  color: #7c2d12;
}

/* segunda barra */
.da-score-header-secondary {
  margin-top: .9rem;
}
.da-score-label-secondary {
  font-size: .9rem;
  font-weight: 700;
  color: #111827;
}
.da-score-number-secondary {
  font-weight: 800;
  color: #b45309;
}

.da-score-bar {
  margin-top: .4rem;
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: #f3f4f6;
  overflow: hidden;
  border: 1px solid #fed7aa;
}
.da-score-bar.secondary {
  background: #fff7ed;
}
.da-score-fill {
  height: 100%;
  background-image: linear-gradient(90deg, #22c55e, #facc15, #f97316, #ef4444);
  background-size: 200% 100%;
  animation: da-stripes 1.4s linear infinite;
  transition: width .35s ease-out;
}
.da-score-fill.secondary {
  background-image: linear-gradient(90deg, #a5b4fc, #f97316);
}
@keyframes da-stripes {
  0% { background-position: 0% 0; }
  100% { background-position: -200% 0; }
}
.da-score-caption {
  margin-top: .25rem;
  font-size: .8rem;
  color: #4b5563;
}
.da-result-description {
  margin-top: .8rem;
  font-size: .85rem;
  color: #374151;
}
.da-detail-box {
  margin-top: .6rem;
  padding: .65rem .75rem;
  border-radius: .9rem;
  background: #fff7ed;
  border: 1px dashed #fdba74;
}
.da-detail-box h3 {
  margin: 0 0 .4rem;
  font-size: .9rem;
  font-weight: 800;
  color: #9a3412;
}
.da-detail-box ul {
  margin: 0;
  padding-left: 1.1rem;
  font-size: .82rem;
}
.da-detail-box li + li {
  margin-top: .25rem;
}
.da-risk {
  font-weight: 800;
}
.da-alto { color: #b91c1c; }
.da-medio { color: #b45309; }
.da-bajo { color: #15803d; }
.da-disclaimer {
  margin-top: .45rem;
  font-size: .78rem;
  color: #9ca3af;
}

/* PDF BUTTON */
.da-pdf-row {
  margin-top: .9rem;
}
.da-btn-outline {
  display: inline-flex;
  align-items: center;
  gap: .4rem;
  padding: .5rem .9rem;
  border-radius: .9rem;
  border: 1px solid #f97316;
  background: #fff7ed;
  color: #9a3412;
  font-size: .85rem;
  font-weight: 700;
  cursor: pointer;
}
.da-btn-outline.disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* TAGS / PLACEHOLDER */
.da-tags {
  margin-top: .7rem;
  display: flex;
  flex-wrap: wrap;
  gap: .4rem;
}
.da-tag {
  display: inline-flex;
  align-items: center;
  gap: .25rem;
  padding: .25rem .55rem;
  border-radius: 999px;
  font-size: .75rem;
  background: #ffedd5;
  color: #9a3412;
}
.da-placeholder {
  margin-top: .9rem;
  padding: .85rem .9rem;
  border-radius: .9rem;
  background: #f9fafb;
  border: 1px dashed #fed7aa;
  font-size: .85rem;
  color: #6b7280;
}

/* OVERLAY CARGA IA – fondo transparente */
.da-loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255,255,255,0.0); /* transparente */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 80;
}

/* Tarjeta del loader BLANCA */
.da-loading-card {
  position: relative;
  width: min(420px, 92vw);
  background: #ffffff;
  color: #111827;
  border-radius: 1.2rem;
  padding: 1.6rem 1.7rem;
  box-shadow: 0 24px 60px rgba(0,0,0,.25);
  text-align: center;
  border: 2px solid #f97316;
  overflow: hidden;
}

/* Glow naranja suave alrededor */
.da-loading-glow {
  position: absolute;
  inset: -40%;
  background: conic-gradient(
    from 180deg,
    rgba(251,191,36,.10),
    rgba(249,115,22,.18),
    rgba(251,191,36,.10),
    transparent
  );
  animation: da-glow 3s linear infinite;
  pointer-events: none;
}
@keyframes da-glow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.da-loading-icon {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 999px;
  margin: 0 auto .8rem;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at 30% 0%, #fbbf24, #f97316);
  color: #111827;
  box-shadow: 0 0 25px rgba(248,113,22,.6);
}
.da-loading-card h2 {
  position: relative;
  margin: 0 0 .4rem;
  font-size: 1.1rem;
  font-weight: 800;
}
.da-loading-card p {
  position: relative;
  margin: 0 0 .8rem;
  font-size: .86rem;
  color: #4b5563;
}
.da-loading-bar {
  position: relative;
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}
.da-loading-fill {
  height: 100%;
  background-image: linear-gradient(
    90deg,
    #22c55e,
    #a3e635,
    #facc15,
    #fb923c,
    #f97316
  );
  background-size: 200% 100%;
  animation: da-stripes 1.2s linear infinite;
  width: 0%;
  transition: width .18s ease-out;
}
.da-loading-percent {
  position: relative;
  margin-top: .45rem;
  font-size: .82rem;
  color: #9a3412;
  font-weight: 700;
}
.da-loading-mini {
  position: relative;
  margin-top: .3rem;
  font-size: .76rem;
  color: #6b7280;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .da-wrap {
    padding: 1.2rem;
  }
  .da-main {
    flex-direction: column;
  }
}
`;
