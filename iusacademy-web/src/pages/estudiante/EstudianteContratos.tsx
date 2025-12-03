// src/pages/estudiante/EstudianteContratos.tsx
import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Workflow,
  Sparkles,
  ScanSearch,
  Upload,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  FolderOpen,
  TrendingUp,
  FileText,
  Filter,
  Clock3,
  X,
  Info,
} from "lucide-react";

/* =========================================================
   TIPOS
   ========================================================= */

type TabId = "biblioteca" | "flujo" | "asistente" | "revisor" | "portafolio";

type CivilContract = {
  id: string;
  name: string;
  tag: string;
  level: "Básico" | "Intermedio" | "Avanzado";
  estimated: string;
  focus: string;
  keyClauses: string[];
};

type PortfolioItem = {
  id: string;
  title: string;
  type: string;
  status: "Borrador" | "Enviado" | "Revisado";
  teacherStatus: "Pendiente" | "Observado" | "Aprobado";
  score: number | null;
  updatedAt: string;
};

type TheoryItem = {
  id: string;
  question: string;
  article: string;
  code: "Código Civil" | "Código Procesal Civil";
  answer: string;
};

type ReviewResult = {
  global: number;
  structure: number;
  object: number;
  safety: number;
  jurisdiction: number;
  observations: string[];
  feedback: string;
};

type ContractPart = {
  id: string;
  name: string;
  summary: string;
  func: string;
  mustInclude: string;
  commonErrors: string;
  tip: string;
};

/* =========================================================
   DATOS MOCK
   ========================================================= */

const TABS: { id: TabId; label: string; desc: string }[] = [
  {
    id: "biblioteca",
    label: "Biblioteca civil",
    desc: "Modelos base de contratos civiles.",
  },
  {
    id: "flujo",
    label: "Teoría y flujo",
    desc: "Preguntas clave sobre contratos.",
  },
  {
    id: "asistente",
    label: "Asistente de creación",
    desc: "Genera tu propio contrato.",
  },
  {
    id: "revisor",
    label: "Revisor con IA",
    desc: "Análisis preliminar (mock).",
  },
  {
    id: "portafolio",
    label: "Portafolio",
    desc: "Historial de contratos del estudiante.",
  },
];

const MOCK_CONTRACTS_STUDIED = 5;
const MOCK_CONTRACTS_CREATED = 3;
const MOCK_AVG_SCORE = 84;

const CIVIL_CONTRACTS: CivilContract[] = [
  {
    id: "compraventa",
    name: "Compraventa de bien inmueble",
    tag: "Patrimonial",
    level: "Intermedio",
    estimated: "4–6 páginas",
    focus:
      "Transferencia de la propiedad de una casa, lote o departamento, con precio cierto y condiciones de pago.",
    keyClauses: [
      "Identificación de las partes y del inmueble (ubicación, matrícula, superficie).",
      "Precio y forma de pago.",
      "Entrega de la posesión y saneamiento por evicción.",
      "Cláusulas de mora, intereses y resolución por incumplimiento.",
    ],
  },
  {
    id: "arrendamiento",
    name: "Contrato de arrendamiento de vivienda",
    tag: "Arrendamiento",
    level: "Básico",
    estimated: "3–5 páginas",
    focus:
      "Cede el uso temporal de un inmueble a cambio del pago de un canon de alquiler.",
    keyClauses: [
      "Destino del inmueble (vivienda, oficina, etc.).",
      "Canon de alquiler, reajustes y forma de pago.",
      "Plazo del arrendamiento y renovación.",
      "Conservación del inmueble y gastos.",
    ],
  },
  {
    id: "servicios",
    name: "Contrato de prestación de servicios",
    tag: "Servicios",
    level: "Intermedio",
    estimated: "3–4 páginas",
    focus:
      "Regula la realización de un servicio profesional o técnico a cambio de honorarios.",
    keyClauses: [
      "Descripción del servicio a prestar.",
      "Honorarios, forma y tiempos de pago.",
      "Responsabilidad por incumplimiento o defectos.",
      "Propiedad de resultados o entregables.",
    ],
  },
  {
    id: "mutuo",
    name: "Contrato de préstamo de dinero (mutuo)",
    tag: "Créditos",
    level: "Intermedio",
    estimated: "2–3 páginas",
    focus:
      "Entrega de una suma de dinero con obligación de devolución, con o sin intereses.",
    keyClauses: [
      "Monto del préstamo y moneda.",
      "Plazo y forma de devolución.",
      "Intereses y moras.",
      "Garantías (si corresponde).",
    ],
  },
];

const MOCK_PORTFOLIO: PortfolioItem[] = [
  {
    id: "C-001",
    title: "Compraventa dpto. Sacaba",
    type: "Compraventa de bien inmueble",
    status: "Revisado",
    teacherStatus: "Aprobado",
    score: 88,
    updatedAt: "12/11/2025",
  },
  {
    id: "C-002",
    title: "Arrendamiento habitación Cochabamba",
    type: "Arrendamiento de vivienda",
    status: "Revisado",
    teacherStatus: "Observado",
    score: 76,
    updatedAt: "10/11/2025",
  },
  {
    id: "C-003",
    title: "Prestación de servicios de consultoría",
    type: "Prestación de servicios",
    status: "Enviado",
    teacherStatus: "Pendiente",
    score: 80,
    updatedAt: "08/11/2025",
  },
  {
    id: "C-004",
    title: "Préstamo de dinero entre particulares",
    type: "Mutuo de dinero",
    status: "Borrador",
    teacherStatus: "Pendiente",
    score: null,
    updatedAt: "05/11/2025",
  },
];

const COMMON_ERRORS = [
  {
    type: "error",
    title: "Objeto poco claro o incompleto",
    text:
      "Se describe el bien de manera vaga (por ejemplo, solo la zona), sin datos de ubicación precisa, superficie o referencias registrales.",
  },
  {
    type: "error",
    title: "Sin cláusula de incumplimiento",
    text:
      "No se prevé qué ocurre si alguna de las partes no paga, no entrega el bien o no cumple con el servicio.",
  },
  {
    type: "error",
    title: "Falta de cláusula de controversias",
    text:
      "No se determina el juez competente o el mecanismo de solución de conflictos (proceso ordinario, conciliación, arbitraje, etc.).",
  },
  {
    type: "good",
    title: "Buena práctica: cronograma de pagos",
    text:
      "Incluir un cuadro con fechas, montos y condiciones de pago reduce conflictos y facilita la ejecución del contrato.",
  },
];

const THEORY_ITEMS: TheoryItem[] = [
  {
    id: "nocion",
    question: "¿Qué es un contrato según el Código Civil boliviano?",
    article: "Art. 450 CC",
    code: "Código Civil",
    answer:
      "Hay contrato cuando dos o más personas se ponen de acuerdo para constituir, modificar o extinguir una relación jurídica. En la práctica, es una fuente de obligaciones que nace del consentimiento responsable de las partes.",
  },
  {
    id: "requisitos",
    question: "¿Cuáles son los requisitos de formación del contrato?",
    article: "Art. 452 CC",
    code: "Código Civil",
    answer:
      "De forma general, se consideran cuatro elementos esenciales: consentimiento de las partes, objeto, causa y forma cuando la ley la exige. Si uno de estos falta, puede haber nulidad o ineficacia del contrato.",
  },
  {
    id: "consentimiento",
    question: "¿Qué importancia tiene el consentimiento y sus vicios?",
    article: "Arts. 451 y ss. CC",
    code: "Código Civil",
    answer:
      "El consentimiento debe ser libre y consciente. Se regulan vicios como error, dolo o violencia, que pueden invalidar el contrato cuando afectan de manera relevante la decisión de una de las partes.",
  },
  {
    id: "tipos",
    question: "¿Qué tipos de contratos civiles se usan con más frecuencia?",
    article: "Libro V CC (contratos en particular)",
    code: "Código Civil",
    answer:
      "Entre otros, se regulan compraventa, permuta, arrendamiento, mutuo (préstamo de dinero), comodato, depósito, fianza, mandato, etc. En la práctica civil cotidiana destacan la compraventa, el arrendamiento y la prestación de servicios.",
  },
  {
    id: "procesal",
    question:
      "¿Qué rol cumple el Código Procesal Civil cuando hay conflictos por contratos?",
    article: "Normas sobre competencia, proceso ordinario, ejecución",
    code: "Código Procesal Civil",
    answer:
      "Cuando surge un conflicto por el incumplimiento de un contrato, el Código Procesal Civil define la competencia del juez, la vía procesal (por ejemplo, proceso ordinario) y las reglas para la prueba, las medidas cautelares y la ejecución de la sentencia o de títulos ejecutivos.",
  },
];

const CONTRACT_PARTS: ContractPart[] = [
  {
    id: "encabezado",
    name: "Encabezado / Título",
    summary: "Nombre del contrato y lugar-fecha de celebración.",
    func:
      "Presenta al lector qué tipo de contrato es, dónde y cuándo se celebra. Da contexto temporal y espacial al acuerdo.",
    mustInclude:
      "Título claro (por ejemplo: “Contrato de Compraventa de Bien Inmueble”), ciudad, fecha completa de celebración.",
    commonErrors:
      "Usar títulos genéricos (“Contrato privado”) sin especificar el tipo; omitir fecha; mezclar lugar de celebración con lugar de cumplimiento sin claridad.",
    tip:
      "Conecta el título con el tipo de contrato que estudiarás en clase y asegúrate de que la fecha coincida con la que aparecerá en las firmas.",
  },
  {
    id: "partes",
    name: "Identificación de las partes",
    summary: "Datos de las personas que celebran el contrato.",
    func:
      "Determina quiénes asumen las obligaciones. Permite saber quién puede exigir y quién debe cumplir.",
    mustInclude:
      "Nombre completo, C.I., domicilio, estado civil, profesión u ocupación, y la calidad en la que actúa (propietario, arrendador, arrendatario, prestatario, etc.).",
    commonErrors:
      "Falta de datos de identificación; no indicar en qué calidad actúa una parte; confundir vendedor con comprador o acreedor con deudor.",
    tip:
      "Revisa que cada parte se identifique siempre igual en todo el contrato. Evita abreviaturas confusas y usa siglas coherentes (por ejemplo, “EL VENDEDOR”, “EL COMPRADOR”).",
  },
  {
    id: "antecedentes",
    name: "Antecedentes",
    summary: "Historia breve que explica por qué se firma el contrato.",
    func:
      "Describe los hechos previos que justifican el acuerdo: propiedad del bien, acuerdos verbales anteriores, situación actual.",
    mustInclude:
      "Referencia a la titularidad del bien o servicio, menciones a documentos relevantes (minutas previas, certificados, matrículas), contexto de la negociación.",
    commonErrors:
      "Repetir información irrelevante; no mencionar documentos que se adjuntan; no explicar la situación jurídica del bien (por ejemplo, si está libre de gravámenes).",
    tip:
      "Piensa en los antecedentes como el ‘contexto’ del caso práctico: deben ser suficientes para que un juez entienda cómo se llegó al contrato.",
  },
  {
    id: "objeto",
    name: "Objeto del contrato",
    summary: "Qué se transmite, se da, se hace o se deja de hacer.",
    func:
      "Define la prestación principal: la cosa, el servicio o la conducta que será cumplida por una de las partes. Es un elemento esencial.",
    mustInclude:
      "Descripción clara, precisa y lícita del bien o servicio: ubicación, características, superficie, cantidad, calidad, alcance del servicio.",
    commonErrors:
      "Objeto genérico (“un inmueble”, “un servicio”) sin detalle; no indicar ubicación exacta; omitir que el objeto debe ser lícito y posible.",
    tip:
      "Si un tercero lee solo la cláusula de objeto, debería entender perfectamente qué se está contratando, sin necesidad de adivinar.",
  },
  {
    id: "precio",
    name: "Precio / contraprestación",
    summary: "Lo que se paga o entrega a cambio del objeto.",
    func:
      "Establece el valor económico del contrato y cómo se cumplirá esa obligación de pago.",
    mustInclude:
      "Monto total, moneda, forma de pago (al contado, en cuotas), plazos, intereses si los hay, lugar y medio de pago.",
    commonErrors:
      "No señalar la moneda; no definir fechas de pago; omitir qué pasa si la parte se retrasa; mezclar precio con gastos adicionales sin claridad.",
    tip:
      "Usa cuadros o frases ordenadas (por ejemplo, ‘cronograma de pagos’) para que el docente y la IA identifiquen fácilmente el flujo del dinero.",
  },
  {
    id: "plazo",
    name: "Plazo / duración",
    summary: "Cuánto tiempo dura el contrato o la obligación.",
    func:
      "Determina desde cuándo y hasta cuándo se mantendrán las obligaciones de las partes.",
    mustInclude:
      "Fecha de inicio, fecha de finalización o condición de término (por ejemplo, duración de la obra o del servicio), renovaciones si las hay.",
    commonErrors:
      "No fijar duración; decir solo ‘por tiempo indefinido’ sin reglas de terminación; no vincular el plazo con el cumplimiento de otras obligaciones.",
    tip:
      "Relaciona el plazo con el tipo de contrato: en arrendamientos suele ser clave; en préstamos, el plazo se conecta con el calendario de pagos.",
  },
  {
    id: "garantias",
    name: "Garantías y penalidades",
    summary: "Protecciones frente al incumplimiento.",
    func:
      "Regula qué pasa si alguna parte no cumple: multas, intereses, pérdida de arras, ejecución de garantías, etc.",
    mustInclude:
      "Tipo de garantía (real o personal), penalidades por incumplimiento, intereses moratorios, posibilidad de resolución del contrato.",
    commonErrors:
      "Cláusulas muy genéricas (“se aplicará la ley”); penalidades desproporcionadas; omitir qué ocurre con pagos ya realizados si se resuelve el contrato.",
    tip:
      "Piensa en escenarios de incumplimiento del caso práctico y diseña una cláusula que los cubra de forma razonable y clara.",
  },
  {
    id: "controversias",
    name: "Solución de controversias",
    summary: "Cómo se resolverán los conflictos.",
    func:
      "Indica qué juez o tribunal es competente y qué reglas procesales se aplicarán en caso de conflicto.",
    mustInclude:
      "Mención de la jurisdicción, juez competente (por ejemplo, jueces ordinarios de determinada ciudad), referencia al Código Procesal Civil o mecanismos alternativos.",
    commonErrors:
      "No incluir la cláusula; copiar fórmulas sin adaptarlas al lugar; generar contradicción con el domicilio de las partes.",
    tip:
      "Redacta esta cláusula pensando en cómo se iniciaría un proceso real: qué juzgado recibiría la demanda y qué procedimiento se seguiría.",
  },
  {
    id: "finales",
    name: "Cláusulas finales y firmas",
    summary: "Declaraciones finales y suscripción del contrato.",
    func:
      "Cierra el contrato con declaraciones de lectura y conformidad, número de ejemplares y firmas.",
    mustInclude:
      "Declaración de que las partes han leído y aceptan, número de ejemplares, lugar y fecha, firmas de las partes y, si corresponde, de testigos.",
    commonErrors:
      "Omitir la ubicación de las firmas; no repetir la fecha; no dejar espacio suficiente para firma y aclaración.",
    tip:
      "Cuida la presentación gráfica: en la práctica, la claridad en la sección de firmas evita confusiones sobre quién firmó y cuándo.",
  },
];

/* =========================================================
   COMPONENTE PRINCIPAL
   ========================================================= */

export default function EstudianteContratos() {
  const [active, setActive] = useState<TabId>("biblioteca");

  const contractsStudied = MOCK_CONTRACTS_STUDIED;
  const contractsCreated = MOCK_CONTRACTS_CREATED;
  const avgScore = MOCK_AVG_SCORE;

  const targetContractsWeek = 2;
  const progressContractsWeek = useMemo(() => {
    const pct = (contractsCreated / targetContractsWeek) * 100;
    return Math.max(0, Math.min(100, pct));
  }, [contractsCreated]);

  // Modales
  const [showErrorsModal, setShowErrorsModal] = useState(false);
  const [showReviewDetails, setShowReviewDetails] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] =
    useState<PortfolioItem | null>(null);
  const [selectedLibraryContract, setSelectedLibraryContract] =
    useState<CivilContract | null>(null);

  return (
    <div className="ec-root">
      {/* HEADER */}
      <header className="ec-hdr">
        <div>
          <h1 className="ec-h1">Centro de Contratos Civiles</h1>
          <p className="ec-sub">
            Aprende, crea y revisa contratos civiles con apoyo de IA dentro de
            IUSAcademy.
          </p>
        </div>
      </header>

      {/* MINI DASHBOARD DE KPIs */}
      <section className="ec-kpi-row">
        <KpiCard
          label="Contratos estudiados"
          hint="Modelos revisados desde la biblioteca civil."
          value={contractsStudied}
          icon={<BookOpen size={18} />}
          badge="Objetivo: 4+"
        />
        <KpiCard
          label="Contratos creados"
          hint="Borradores generados con el asistente."
          value={contractsCreated}
          icon={<FolderOpen size={18} />}
          progress={progressContractsWeek}
          badge="Meta semanal: 2"
        />
        <KpiCard
          label="Promedio IA en contratos"
          hint="Calidad preliminar según el revisor automático (mock)."
          value={`${avgScore}/100`}
          icon={<TrendingUp size={18} />}
          accent
        />
      </section>

      {/* LAYOUT PRINCIPAL */}
      <main className="ec-main">
        {/* NAV IZQUIERDO */}
        <nav className="ec-nav">
          <p className="ec-nav-title">Módulos</p>
          <ul className="ec-nav-list">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  className={`ec-nav-item ${active === tab.id ? "active" : ""}`}
                  onClick={() => setActive(tab.id)}
                >
                  <div className="ec-nav-icon">
                    {tab.id === "biblioteca" && <BookOpen size={18} />}
                    {tab.id === "flujo" && <Workflow size={18} />}
                    {tab.id === "asistente" && <Sparkles size={18} />}
                    {tab.id === "revisor" && <ScanSearch size={18} />}
                    {tab.id === "portafolio" && <FolderOpen size={18} />}
                  </div>
                  <div className="ec-nav-text">
                    <span className="ec-nav-label">{tab.label}</span>
                    <span className="ec-nav-desc">{tab.desc}</span>
                  </div>
                  <ChevronRight size={16} className="ec-nav-arrow" />
                </button>
              </li>
            ))}
          </ul>

          <div className="ec-nav-tip">
            <Info size={16} className="ec-tip-ico" />
            <p>
              De momento trabajas solo con <strong>contratos civiles</strong>.
              Más áreas se activarán en futuras versiones de IUSAcademy.
            </p>
          </div>
        </nav>

        {/* CONTENIDO DERECHA */}
        <section className="ec-content">
          {active === "biblioteca" && (
            <BibliotecaContratosCivil
              onOpenContract={setSelectedLibraryContract}
            />
          )}
          {active === "flujo" && (
            <FlujoContratosCivil
              onOpenErrors={() => setShowErrorsModal(true)}
            />
          )}
          {active === "asistente" && <AsistenteCreacionContratos />}
          {active === "revisor" && (
            <RevisorContratosIA onOpenDetails={() => setShowReviewDetails(true)} />
          )}
          {active === "portafolio" && (
            <PortafolioContratos
              items={MOCK_PORTFOLIO}
              onOpenItem={setSelectedPortfolioItem}
            />
          )}
        </section>
      </main>

      {/* MODAL: ERRORES FRECUENTES */}
      <Modal
        open={showErrorsModal}
        title="Errores frecuentes en contratos civiles"
        onClose={() => setShowErrorsModal(false)}
      >
        <p className="ec-modal-text">
          Usa esta lista como checklist al momento de revisar tu contrato con el
          módulo de IA o junto a tu docente.
        </p>
        <ul className="ec-errors-list">
          {COMMON_ERRORS.map((e) => (
            <li
              key={e.title}
              className={`ec-error-card ${e.type === "good" ? "good" : "bad"}`}
            >
              <div className="ec-error-header">
                {e.type === "good" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{e.title}</span>
              </div>
              <p>{e.text}</p>
            </li>
          ))}
        </ul>
      </Modal>

      {/* MODAL: DESGLOSE REVISOR IA (resumen) */}
      <Modal
        open={showReviewDetails}
        title="¿Cómo se calcula la nota del contrato?"
        onClose={() => setShowReviewDetails(false)}
      >
        <p className="ec-modal-text">
          Para la demo en frontend, el sistema simula un análisis basado en cuatro
          dimensiones: estructura, objeto, cláusulas de seguridad y controversias /
          jurisdicción. En una versión con IA real, estos criterios se alimentarían
          con modelos entrenados sobre contratos civiles bolivianos.
        </p>
        <h4 className="ec-modal-subtitle">Ejemplo de criterios</h4>
        <ul className="ec-checklist">
          <li className="ok">
            <CheckCircle2 size={16} />
            El contrato identifica correctamente a las partes (nombres completos,
            C.I., domicilio).
          </li>
          <li className="ok">
            <CheckCircle2 size={16} />
            El objeto del contrato está descrito de forma concreta y lícita.
          </li>
          <li className="warn">
            <AlertCircle size={16} />
            Falta una cláusula de solución de controversias que remita a la
            competencia y procedimiento civil.
          </li>
          <li className="warn">
            <AlertCircle size={16} />
            Las penalidades por incumplimiento no son proporcionales ni claras.
          </li>
        </ul>
      </Modal>

      {/* MODAL: DETALLE PORTAFOLIO */}
      <Modal
        open={!!selectedPortfolioItem}
        title="Detalle de contrato del portafolio"
        onClose={() => setSelectedPortfolioItem(null)}
      >
        {selectedPortfolioItem && (
          <div className="ec-portfolio-detail">
            <p className="ec-modal-label">
              Código: <span className="mono">{selectedPortfolioItem.id}</span>
            </p>
            <p className="ec-modal-label">
              Título: <span>{selectedPortfolioItem.title}</span>
            </p>
            <p className="ec-modal-label">
              Tipo de contrato: <span>{selectedPortfolioItem.type}</span>
            </p>
            <p className="ec-modal-label">
              Estado:
              <span>
                <BadgeEstado status={selectedPortfolioItem.status} />
              </span>
            </p>
            <p className="ec-modal-label">
              Estado con docente:
              <span>
                <BadgeDocente status={selectedPortfolioItem.teacherStatus} />
              </span>
            </p>
            <p className="ec-modal-label">
              Puntaje IA:
              <span>
                {selectedPortfolioItem.score !== null ? (
                  <span className="score">
                    {selectedPortfolioItem.score}
                    <span className="score-suffix">/100</span>
                  </span>
                ) : (
                  <span className="score pending">Sin analizar</span>
                )}
              </span>
            </p>
            <p className="ec-modal-label">
              Última actualización:
              <span className="mono">{selectedPortfolioItem.updatedAt}</span>
            </p>
            <div className="ec-modal-actions">
              <button className="ec-btn ghost" type="button">
                Descargar (mock)
              </button>
              <button className="ec-btn" type="button">
                Enviar nuevamente a IA (mock)
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL: DETALLE CONTRATO DE BIBLIOTECA */}
      <Modal
        open={!!selectedLibraryContract}
        title={
          selectedLibraryContract
            ? `Modelo: ${selectedLibraryContract.name}`
            : "Modelo de contrato civil"
        }
        onClose={() => setSelectedLibraryContract(null)}
      >
        {selectedLibraryContract && (
          <LibraryContractDetail contract={selectedLibraryContract} />
        )}
      </Modal>

      <style>{styles}</style>
    </div>
  );
}

/* =========================================================
   KPI CARD
   ========================================================= */

function KpiCard({
  label,
  hint,
  value,
  icon,
  progress,
  badge,
  accent,
}: {
  label: string;
  hint?: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  progress?: number;
  badge?: string;
  accent?: boolean;
}) {
  const hasProgress = typeof progress === "number";

  return (
    <motion.article
      className={`ec-kpi-card ${accent ? "accent" : ""}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="ec-kpi-top">
        <div className="ec-kpi-icon">{icon}</div>
        {badge && <span className="ec-kpi-badge">{badge}</span>}
      </div>
      <p className="ec-kpi-label">{label}</p>
      <p className="ec-kpi-value">{value}</p>
      {hint && <p className="ec-kpi-hint">{hint}</p>}

      {hasProgress && (
        <div className="ec-kpi-progress">
          <div className="ec-kpi-progress-track">
            <motion.div
              className="ec-kpi-progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
          <span className="ec-kpi-progress-text">
            {Math.round(progress!)}% de la meta semanal
          </span>
        </div>
      )}
    </motion.article>
  );
}

/* =========================================================
   TAB 1: BIBLIOTECA — CARDS SIMPLES + MODAL
   ========================================================= */

function BibliotecaContratosCivil({
  onOpenContract,
}: {
  onOpenContract: (c: CivilContract) => void;
}) {
  return (
    <motion.div
      className="ec-card ec-card-main"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="ec-card-hdr">
        <div>
          <h2 className="ec-h2">Biblioteca de contratos — Área Civil</h2>
          <p className="ec-sub-mini">
            Elige un modelo civil y revisa sus detalles en el modal. Luego podrás
            descargar un borrador básico para trabajar en clase.
          </p>
        </div>
      </div>

      <div className="ec-biblio-grid">
        {CIVIL_CONTRACTS.map((c) => (
          <motion.article
            key={c.id}
            className="ec-biblio-card"
            whileHover={{ y: -2, boxShadow: "var(--shadow-md)" }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
          >
            {/* Foto simulada */}
            <div className="ec-biblio-thumb">
              <div className="ec-biblio-thumb-inner">
                <FileText size={32} />
              </div>
            </div>

            {/* Solo nombre en la card */}
            <h3 className="ec-biblio-title">{c.name}</h3>

            <div className="ec-biblio-actions">
              <button
                className="ec-btn ghost"
                type="button"
                onClick={() => onOpenContract(c)}
              >
                Ver detalles
              </button>
              <button
                className="ec-btn"
                type="button"
                onClick={() => downloadContractMock(c)}
              >
                Descargar contrato (.txt)
              </button>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.div>
  );
}

function downloadContractMock(contract: CivilContract) {
  const contenido = [
    `MODELO BÁSICO — ${contract.name.toUpperCase()}`,
    "",
    "Este es un modelo de ejemplo generado desde el módulo de Biblioteca de IUSAcademy.",
    "Completa y ajusta el contenido conforme al Código Civil boliviano y las instrucciones de tu docente.",
    "",
    "Cláusulas clave sugeridas:",
    ...contract.keyClauses.map((c, idx) => `${idx + 1}. ${c}`),
    "",
    "Nota: Este archivo es solo una base de práctica para fines académicos.",
  ].join("\n");

  const blob = new Blob([contenido], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `modelo-${contract.id}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function LibraryContractDetail({ contract }: { contract: CivilContract }) {
  return (
    <>
      <p className="ec-modal-text">
        Resumen del modelo civil seleccionado. Úsalo como referencia para
        analizar estructura, cláusulas típicas y redacción.
      </p>
      <p className="ec-modal-label">
        Tipo de contrato: <span>{contract.name}</span>
      </p>
      <p className="ec-modal-label">
        Categoría: <span>{contract.tag}</span>
      </p>
      <p className="ec-modal-label">
        Nivel sugerido: <span>{contract.level}</span>
      </p>
      <p className="ec-modal-label">
        Extensión estimada: <span>{contract.estimated}</span>
      </p>

      <h4 className="ec-modal-subtitle">Objetivo del contrato</h4>
      <p className="ec-modal-text">{contract.focus}</p>

      <h4 className="ec-modal-subtitle">Cláusulas clave recomendadas</h4>
      <ul className="ec-errors-list">
        {contract.keyClauses.map((cl) => (
          <li key={cl} className="ec-error-card good">
            <div className="ec-error-header">
              <CheckCircle2 size={16} />
              <span>Cláusula sugerida</span>
            </div>
            <p>{cl}</p>
          </li>
        ))}
      </ul>

      <div className="ec-modal-actions">
        <button
          className="ec-btn ghost"
          type="button"
          onClick={() => downloadContractMock(contract)}
        >
          Descargar contrato (.txt)
        </button>
      </div>
    </>
  );
}

/* =========================================================
   TAB 2: TEORÍA / FLUJO — PREGUNTAS + PARTES CON TABLA
   ========================================================= */

function FlujoContratosCivil({ onOpenErrors }: { onOpenErrors: () => void }) {
  const [activeTheory, setActiveTheory] = useState<TheoryItem | null>(null);
  const [activePart, setActivePart] = useState<ContractPart | null>(null);

  return (
    <>
      <motion.div
        className="ec-card ec-card-main"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="ec-card-hdr">
          <div>
            <h2 className="ec-h2">Teoría y flujo de contratos civiles</h2>
            <p className="ec-sub-mini">
              Combina preguntas clave sobre contratos con un mapa visual de las
              partes que componen un contrato civil típico.
            </p>
          </div>
          <button className="ec-btn ghost" type="button" onClick={onOpenErrors}>
            <AlertCircle size={16} />
            Ver errores frecuentes
          </button>
        </div>

        <div className="ec-theory-layout">
          {/* Lista de preguntas */}
          <section className="ec-theory-list">
            {THEORY_ITEMS.map((item) => (
              <button
                key={item.id}
                className="ec-theory-item"
                type="button"
                onClick={() => setActiveTheory(item)}
              >
                <div className="ec-theory-meta">
                  <span className="ec-theory-article">{item.article}</span>
                  <span className="ec-theory-code">{item.code}</span>
                </div>
                <p className="ec-theory-question">{item.question}</p>
              </button>
            ))}
          </section>

          {/* Aside: requisitos + partes del contrato */}
          <aside className="ec-flow-aside">
            <h3 className="ec-flow-aside-title">
              Requisitos esenciales del contrato
            </h3>
            <p className="ec-flow-aside-text">
              Al estudiar contratos civiles, verifica siempre estos cuatro
              elementos básicos.
            </p>

            <ul className="ec-pill-list">
              <li className="ec-pill">
                <strong>Consentimiento</strong>
                <span>
                  Acuerdo libre y consciente de las partes, sin error, dolo ni
                  violencia.
                </span>
              </li>
              <li className="ec-pill">
                <strong>Objeto</strong>
                <span>
                  Prestación posible, lícita y suficientemente determinada o
                  determinable.
                </span>
              </li>
              <li className="ec-pill">
                <strong>Causa</strong>
                <span>
                  Fin económico-jurídico perseguido con el contrato (uso, venta,
                  préstamo, etc.).
                </span>
              </li>
              <li className="ec-pill">
                <strong>Forma</strong>
                <span>
                  En algunos contratos, la ley exige formas especiales (por
                  ejemplo, escritura pública para inmuebles).
                </span>
              </li>
            </ul>

            <div className="ec-tip">
              <CheckCircle2 className="ec-tip-ico" size={18} />
              <p>
                <span className="ec-strong">Tip:</span> usa estas preguntas como
                guía para construir tus cláusulas en el asistente de creación.
              </p>
            </div>

            {/* NUEVO: PARTES DEL CONTRATO */}
            <section className="ec-parts-section">
              <h3 className="ec-flow-aside-title">Partes del contrato civil</h3>
              <p className="ec-flow-aside-text">
                Selecciona una parte para ver en un <strong>modal con tabla</strong> qué
                es, qué debe contener, errores típicos y un tip práctico.
              </p>
              <div className="ec-part-chips">
                {CONTRACT_PARTS.map((part) => (
                  <button
                    key={part.id}
                    type="button"
                    className="ec-part-chip"
                    onClick={() => setActivePart(part)}
                  >
                    {part.name}
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </motion.div>

      {/* Modal de teoría (preguntas/artículos) */}
      <Modal
        open={!!activeTheory}
        title={activeTheory ? activeTheory.question : "Detalle teórico"}
        onClose={() => setActiveTheory(null)}
      >
        {activeTheory && (
          <>
            <p className="ec-modal-label">
              Referencia:
              <span>
                {activeTheory.article} — {activeTheory.code}
              </span>
            </p>
            <p className="ec-modal-text">{activeTheory.answer}</p>
          </>
        )}
      </Modal>

      {/* Modal de partes del contrato con TABLA */}
      <Modal
        open={!!activePart}
        title={activePart ? `Parte del contrato: ${activePart.name}` : ""}
        onClose={() => setActivePart(null)}
      >
        {activePart && <ContractPartTable part={activePart} />}
      </Modal>
    </>
  );
}

function ContractPartTable({ part }: { part: ContractPart }) {
  return (
    <>
      <p className="ec-modal-text">
        {part.summary}
      </p>
      <table className="ec-part-table">
        <thead>
          <tr>
            <th>Aspecto</th>
            <th>Descripción</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Función jurídica</td>
            <td>{part.func}</td>
          </tr>
          <tr>
            <td>¿Qué debe incluir?</td>
            <td>{part.mustInclude}</td>
          </tr>
          <tr>
            <td>Errores frecuentes</td>
            <td>{part.commonErrors}</td>
          </tr>
          <tr>
            <td>Tip para el estudiante</td>
            <td>{part.tip}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

/* =========================================================
   TAB 3: ASISTENTE DE CREACIÓN — GENERA CONTRATO TEXTO
   ========================================================= */

type AsistenteForm = {
  tipo: string;
  lugarFecha: string;
  parte1: string;
  parte2: string;
  objeto: string;
  precio: string;
  plazo: string;
  garantias: string;
  controversias: string;
  notas: string;
};

function AsistenteCreacionContratos() {
  const [form, setForm] = useState<AsistenteForm>({
    tipo: "Compraventa de bien inmueble",
    lugarFecha: "",
    parte1: "",
    parte2: "",
    objeto: "",
    precio: "",
    plazo: "",
    garantias: "",
    controversias: "",
    notas: "",
  });

  const [generated, setGenerated] = useState<string | null>(null);

  function handleChange<K extends keyof AsistenteForm>(
    field: K,
    value: AsistenteForm[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function buildContratoText(values: AsistenteForm): string {
    const {
      tipo,
      lugarFecha,
      parte1,
      parte2,
      objeto,
      precio,
      plazo,
      garantias,
      controversias,
      notas,
    } = values;

    return [
      `CONTRATO DE ${tipo.toUpperCase()}`,
      "",
      lugarFecha
        ? `En ${lugarFecha}, las partes que se describen a continuación celebran el presente contrato de ${tipo}.`
        : "En la ciudad de __________, a _____ de __________ de 20____, las partes que se describen a continuación celebran el presente contrato.",
      "",
      "PRIMERA (PARTES CONTRATANTES).-",
      parte1
        ? `PRIMERA PARTE.- ${parte1}`
        : "PRIMERA PARTE.- [Describir a la parte 1: nombre completo, C.I., domicilio, estado civil, profesión u ocupación].",
      parte2
        ? `SEGUNDA PARTE.- ${parte2}`
        : "SEGUNDA PARTE.- [Describir a la parte 2 con los mismos datos de identificación].",
      "",
      "SEGUNDA (ANTECEDENTES).-",
      "Las partes declaran que tienen capacidad para contratar y que el presente acuerdo se celebra de forma libre y voluntaria, conforme a las disposiciones del Código Civil boliviano.",
      "",
      "TERCERA (OBJETO DEL CONTRATO).-",
      objeto
        ? objeto
        : "[Describir de manera clara y completa el objeto del contrato: bien o servicio, características, ubicación, etc.].",
      "",
      "CUARTA (PRECIO O CONTRAPRESTACIÓN).-",
      precio
        ? precio
        : "[Establecer el precio, forma de pago, moneda, fechas y condiciones de pago].",
      "",
      "QUINTA (PLAZO O DURACIÓN).-",
      plazo
        ? plazo
        : "[Indicar la duración del contrato y la fecha de inicio y conclusión].",
      "",
      "SEXTA (GARANTÍAS Y PENALIDADES).-",
      garantias
        ? garantias
        : "[Describir garantías, penalidades por incumplimiento, intereses moratorios, etc.].",
      "",
      "SÉPTIMA (SOLUCIÓN DE CONTROVERSIAS).-",
      controversias
        ? controversias
        : "[Definir la jurisdicción y el juez competente, así como la aplicación del procedimiento civil en caso de conflicto].",
      "",
      "OCTAVA (DISPOSICIONES FINALES).-",
      "Las partes declaran haber leído íntegramente el presente contrato, aceptando su contenido y firmando en dos ejemplares de un mismo tenor.",
      "",
      "FIRMAN:",
      "______________________________      ______________________________",
      "PRIMERA PARTE                        SEGUNDA PARTE",
      "",
      notas
        ? "NOTAS DEL ESTUDIANTE (no forman parte del contrato impreso):\n" +
          notas
        : "",
    ].join("\n");
  }

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    const texto = buildContratoText(form);
    setGenerated(texto);
  }

  function handleDownload() {
    if (!generated) return;
    const blob = new Blob([generated], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contrato-civil-generado.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div
      className="ec-card ec-card-main"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="ec-card-hdr">
        <div>
          <h2 className="ec-h2">Asistente para crear contrato civil</h2>
          <p className="ec-sub-mini">
            Completa los bloques principales y genera un contrato en texto listo
            para descargar. Todo funciona en frontend para tu presentación.
          </p>
        </div>
      </div>

      <div className="ec-assistant-layout">
        {/* FORMULARIO IZQUIERDA */}
        <form className="ec-form-grid" onSubmit={handleGenerate}>
          <section className="ec-form-section">
            <h3 className="ec-form-title">1. Tipo de contrato y partes</h3>
            <div className="ec-form-row">
              <div className="ec-field">
                <label className="ec-label">Tipo de contrato civil</label>
                <select
                  className="ec-input"
                  value={form.tipo}
                  onChange={(e) => handleChange("tipo", e.target.value)}
                >
                  <option>Compraventa de bien inmueble</option>
                  <option>Arrendamiento de vivienda</option>
                  <option>Prestación de servicios</option>
                  <option>Préstamo de dinero (mutuo)</option>
                  <option>Otro (personalizado)</option>
                </select>
              </div>
              <div className="ec-field">
                <label className="ec-label">
                  Ciudad y fecha (ej.: Cochabamba, 15 de noviembre de 2025)
                </label>
                <input
                  className="ec-input"
                  type="text"
                  value={form.lugarFecha}
                  onChange={(e) => handleChange("lugarFecha", e.target.value)}
                  placeholder="Lugar y fecha de celebración"
                />
              </div>
            </div>

            <div className="ec-form-row">
              <div className="ec-field">
                <label className="ec-label">Datos de la parte 1</label>
                <textarea
                  className="ec-input"
                  rows={3}
                  value={form.parte1}
                  onChange={(e) => handleChange("parte1", e.target.value)}
                  placeholder="Nombre completo, C.I., domicilio, estado civil..."
                />
              </div>
              <div className="ec-field">
                <label className="ec-label">Datos de la parte 2</label>
                <textarea
                  className="ec-input"
                  rows={3}
                  value={form.parte2}
                  onChange={(e) => handleChange("parte2", e.target.value)}
                  placeholder="Nombre completo, C.I., domicilio, estado civil..."
                />
              </div>
            </div>
          </section>

          <section className="ec-form-section">
            <h3 className="ec-form-title">2. Objeto, precio y plazo</h3>
            <div className="ec-form-row">
              <div className="ec-field">
                <label className="ec-label">Descripción del objeto</label>
                <textarea
                  className="ec-input"
                  rows={4}
                  value={form.objeto}
                  onChange={(e) => handleChange("objeto", e.target.value)}
                  placeholder="Describe claramente el bien o servicio objeto del contrato."
                />
              </div>
            </div>

            <div className="ec-form-row">
              <div className="ec-field">
                <label className="ec-label">Precio / contraprestación</label>
                <input
                  className="ec-input"
                  type="text"
                  value={form.precio}
                  onChange={(e) => handleChange("precio", e.target.value)}
                  placeholder="Monto, forma de pago, moneda..."
                />
              </div>
              <div className="ec-field">
                <label className="ec-label">Plazo o duración</label>
                <input
                  className="ec-input"
                  type="text"
                  value={form.plazo}
                  onChange={(e) => handleChange("plazo", e.target.value)}
                  placeholder="Ej.: 12 meses a partir de la firma."
                />
              </div>
            </div>
          </section>

          <section className="ec-form-section">
            <h3 className="ec-form-title">3. Cláusulas clave</h3>
            <div className="ec-form-row">
              <div className="ec-field">
                <label className="ec-label">Garantías / penalidades</label>
                <textarea
                  className="ec-input"
                  rows={3}
                  value={form.garantias}
                  onChange={(e) => handleChange("garantias", e.target.value)}
                  placeholder="Cláusulas de garantía, penalidades por incumplimiento, etc."
                />
              </div>
            </div>

            <div className="ec-form-row">
              <div className="ec-field">
                <label className="ec-label">
                  Solución de controversias / jurisdicción
                </label>
                <textarea
                  className="ec-input"
                  rows={3}
                  value={form.controversias}
                  onChange={(e) =>
                    handleChange("controversias", e.target.value)
                  }
                  placeholder="Define juez competente, arbitraje, conciliación, etc."
                />
              </div>
            </div>
          </section>

          <section className="ec-form-section">
            <h3 className="ec-form-title">4. Notas internas</h3>
            <div className="ec-form-row">
              <div className="ec-field">
                <label className="ec-label">
                  Notas del estudiante (no se imprimen)
                </label>
                <textarea
                  className="ec-input"
                  rows={3}
                  value={form.notas}
                  onChange={(e) => handleChange("notas", e.target.value)}
                  placeholder="Apunta dudas, observaciones del docente o referencias a artículos."
                />
              </div>
            </div>
          </section>

          <div className="ec-form-actions">
            <button className="ec-btn ghost" type="submit">
              <Sparkles size={16} />
              Generar borrador
            </button>
          </div>
        </form>

        {/* PREVIEW DERECHA */}
        <section className="ec-assistant-preview">
          <h3 className="ec-form-title">Vista previa del contrato</h3>
          <p className="ec-sub-mini">
            Aquí se muestra el texto que se generará a partir del formulario.
          </p>

          <div className="ec-preview-box">
            <pre className="ec-preview-text">
              {generated
                ? generated
                : "Completa el formulario de la izquierda y haz clic en “Generar borrador” para ver aquí el contrato en texto."}
            </pre>
          </div>

          <div className="ec-form-actions">
            <button
              className="ec-btn"
              type="button"
              disabled={!generated}
              onClick={handleDownload}
            >
              <DownloadIcon size={16} />
              Descargar contrato (.txt)
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}

// Icono sencillo de descarga para no extender imports
function DownloadIcon(props: { size?: number }) {
  const size = props.size ?? 16;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="ec-download-ico"
    >
      <path
        d="M12 3v10m0 0l-4-4m4 4l4-4M5 19h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* =========================================================
   TAB 4: REVISOR DE CONTRATOS CON IA (FRONT MOCK)
   ========================================================= */

function RevisorContratosIA({ onOpenDetails }: { onOpenDetails: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<ReviewResult | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setResult(null);
    if (f) {
      const kb = Math.round(f.size / 1024);
      setFileInfo(`${f.name} (${kb} KB)`);
      setErrorMsg(null);
    } else {
      setFileInfo(null);
    }
  }

  function simulateAnalysis(): ReviewResult {
    const textLen = text.trim().length;
    const baseLen = textLen || (file ? file.size / 10 : 0);
    const factor = Math.max(0.2, Math.min(1, baseLen / 2000)); // 0.2–1

    const structure = Math.round(60 + 25 * factor);
    const object = Math.round(65 + 20 * factor);
    const safety = Math.round(55 + 25 * factor);
    const jurisdiction = Math.round(50 + 25 * factor);
    const global = Math.round(
      (structure + object + safety + jurisdiction) / 4
    );

    const observations: string[] = [];

    if (structure < 75) {
      observations.push(
        "La estructura general del contrato podría organizarse mejor en cláusulas numeradas (Antecedentes, Objeto, Precio, Plazo, etc.)."
      );
    } else {
      observations.push(
        "La estructura del contrato es adecuada: se distingue claramente entre antecedentes, objeto, precio y disposiciones finales."
      );
    }

    if (object < 80) {
      observations.push(
        "Revisa que el objeto esté descrito de forma concreta (ubicación del inmueble, características del servicio, etc.)."
      );
    }

    if (safety < 70) {
      observations.push(
        "Las cláusulas de garantías y penalidades parecen escasas. Considera añadir consecuencias claras ante el incumplimiento."
      );
    }

    if (jurisdiction < 70) {
      observations.push(
        "Incluye una cláusula que defina la jurisdicción y el juez competente, remitiendo al procedimiento civil aplicable."
      );
    }

    let feedback: string;
    if (global >= 85) {
      feedback =
        "El contrato se encuentra bien construido para un nivel estudiantil. Refuerza detalles en las cláusulas de seguridad y revisa siempre los artículos relevantes.";
    } else if (global >= 70) {
      feedback =
        "Buen punto de partida. Revisa el objeto, las cláusulas de incumplimiento y la jurisdicción para acercarte a un contrato más robusto.";
    } else {
      feedback =
        "La estructura presenta varias debilidades. Te conviene reorganizar cláusulas básicas (partes, objeto, precio, plazos) y añadir una cláusula expresa de solución de controversias.";
    }

    return {
      global,
      structure,
      object,
      safety,
      jurisdiction,
      observations,
      feedback,
    };
  }

  function handleAnalyze() {
    if (!file && text.trim() === "") {
      setErrorMsg("Sube un archivo o pega el texto de tu contrato para analizar.");
      setResult(null);
      return;
    }
    setErrorMsg(null);
    setLoading(true);

    // Simulación sencilla (sin backend)
    setTimeout(() => {
      const r = simulateAnalysis();
      setResult(r);
      setLoading(false);
    }, 700);
  }

  return (
    <motion.div
      className="ec-card ec-card-main"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="ec-card-hdr">
        <div>
          <h2 className="ec-h2">Revisor de contratos con IA (mock)</h2>
          <p className="ec-sub-mini">
            Versión de demostración completamente en frontend. Simula cómo sería
            el revisor cuando se conecte a un backend de IA entrenado con
            contratos civiles bolivianos.
          </p>
        </div>
        <button className="ec-btn ghost" type="button" onClick={onOpenDetails}>
          <Info size={16} />
          ¿Cómo se calcula la nota?
        </button>
      </div>

      <div className="ec-review-layout">
        {/* IZQUIERDA: entrada */}
        <section className="ec-review-left">
          <div className="ec-upload-box">
            <Upload size={20} className="ec-upload-ico" />
            <p className="ec-upload-title">Subir contrato en PDF / DOCX (mock)</p>
            <p className="ec-upload-sub">
              Para la presentación, el archivo solo se usa como referencia visual
              (nombre y tamaño), el análisis es simulado.
            </p>
            <label className="ec-upload-btn">
              <span>Seleccionar archivo</span>
              <input type="file" onChange={handleFileChange} />
            </label>
            {fileInfo && <p className="ec-upload-file">{fileInfo}</p>}
          </div>

          <div className="ec-or">o</div>

          <div className="ec-field">
            <label className="ec-label">Pegar texto del contrato</label>
            <textarea
              className="ec-input"
              rows={6}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setResult(null);
              }}
              placeholder="Pega aquí el contenido completo de tu contrato civil..."
            />
          </div>

          {errorMsg && <p className="ec-error-msg">{errorMsg}</p>}

          <button
            className="ec-btn ec-btn-full"
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? (
              <>
                <ScanSearch size={16} /> Analizando...
              </>
            ) : (
              <>
                <ScanSearch size={16} /> Analizar contrato
              </>
            )}
          </button>
        </section>

        {/* DERECHA: dashboard de resultados */}
        <section className="ec-review-right">
          {result ? (
            <>
              <div className="ec-score-card">
                <div className="ec-score-row">
                  <div>
                    <p className="ec-score-label">Puntaje preliminar IA (mock)</p>
                    <p className="ec-score-value">
                      {result.global}
                      <span className="ec-score-unit">/100</span>
                    </p>
                    <p className="ec-score-hint">
                      Referencia general de calidad del contrato según su
                      estructura y cláusulas esenciales.
                    </p>
                  </div>
                  <SemaforoRiesgo
                    level={
                      result.global >= 85
                        ? "low"
                        : result.global >= 70
                        ? "medium"
                        : "high"
                    }
                  />
                </div>
              </div>

              <div className="ec-metrics-card">
                <h4 className="ec-modal-subtitle">Dashboard de criterios</h4>
                <MetricBar
                  label="Estructura general del contrato"
                  value={result.structure}
                />
                <MetricBar
                  label="Claridad del objeto y causa"
                  value={result.object}
                />
                <MetricBar
                  label="Cláusulas de seguridad / penalidades"
                  value={result.safety}
                />
                <MetricBar
                  label="Controversias y jurisdicción"
                  value={result.jurisdiction}
                />
              </div>

              <div className="ec-tip">
                <Sparkles size={18} className="ec-tip-ico" />
                <p>{result.feedback}</p>
              </div>

              <div className="ec-observations">
                <h4 className="ec-modal-subtitle">Observaciones</h4>
                <ul className="ec-errors-list">
                  {result.observations.map((obs, idx) => (
                    <li key={idx} className="ec-error-card bad">
                      <div className="ec-error-header">
                        <AlertCircle size={16} />
                        <span>Observación {idx + 1}</span>
                      </div>
                      <p>{obs}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="ec-checklist-box">
                <h4 className="ec-modal-subtitle">
                  Checklist de contrato civil
                </h4>
                <ul className="ec-checklist">
                  <li className="ok">
                    <CheckCircle2 size={16} />
                    Identificación completa de las partes (nombre, C.I., domicilio).
                  </li>
                  <li className="ok">
                    <CheckCircle2 size={16} />
                    Objeto lícito y determinado (bien o servicio claramente
                    descrito).
                  </li>
                  <li className="ok">
                    <CheckCircle2 size={16} />
                    Precio o contraprestación definido y forma de pago.
                  </li>
                  <li className="warn">
                    <AlertCircle size={16} />
                    Cláusulas de incumplimiento y penalidades suficientemente
                    claras.
                  </li>
                  <li className="warn">
                    <AlertCircle size={16} />
                    Cláusula de jurisdicción y competencia vinculada al procedimiento
                    civil aplicable.
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <div className="ec-empty-review">
              <p className="ec-sub-mini">
                Sube un archivo o pega el texto de tu contrato y luego haz clic en
                <strong> “Analizar contrato”</strong> para ver aquí el dashboard de
                resultados.
              </p>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
}

function SemaforoRiesgo({
  level,
}: {
  level: "low" | "medium" | "high";
}) {
  return (
    <div className={`ec-semaforo ec-semaforo-${level}`}>
      <span className="ec-semaforo-dot red" />
      <span className="ec-semaforo-dot yellow" />
      <span className="ec-semaforo-dot green" />
      <span className="ec-semaforo-label">
        {level === "low"
          ? "Riesgo bajo"
          : level === "medium"
          ? "Riesgo medio"
          : "Riesgo alto"}
      </span>
    </div>
  );
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="ec-metric-row">
      <div className="ec-metric-info">
        <span className="ec-metric-label">{label}</span>
      </div>
      <div className="ec-metric-bar">
        <div
          className="ec-metric-fill"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <span className="ec-metric-value">{value}/100</span>
    </div>
  );
}

/* =========================================================
   TAB 5: PORTAFOLIO
   ========================================================= */

function PortafolioContratos({
  items,
  onOpenItem,
}: {
  items: PortfolioItem[];
  onOpenItem: (item: PortfolioItem) => void;
}) {
  return (
    <motion.div
      className="ec-card ec-card-main"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="ec-card-hdr">
        <div>
          <h2 className="ec-h2">Portafolio de contratos</h2>
          <p className="ec-sub-mini">
            Historial de contratos creados, enviados y revisados. En el futuro se
            conectará a la base de datos real del estudiante.
          </p>
        </div>
        <button className="ec-btn ghost" type="button">
          <Filter size={16} />
          Filtros (mock)
        </button>
      </div>

      <div className="ec-portfolio-summary">
        <div className="ec-portfolio-pill">
          <span>Total contratos</span>
          <strong>{items.length}</strong>
        </div>
        <div className="ec-portfolio-pill">
          <span>Con revisión IA</span>
          <strong>{items.filter((i) => i.score !== null).length}</strong>
        </div>
        <div className="ec-portfolio-pill">
          <span>Aprobados por docente</span>
          <strong>
            {items.filter((i) => i.teacherStatus === "Aprobado").length}
          </strong>
        </div>
      </div>

      <div className="ec-portfolio-table">
        <div className="ec-portfolio-header-row">
          <span>ID</span>
          <span>Título</span>
          <span>Tipo</span>
          <span>Estado</span>
          <span>Puntaje IA</span>
          <span>Docente</span>
          <span>Actualización</span>
          <span>Acciones</span>
        </div>
        <div className="ec-portfolio-body">
          {items.map((item) => (
            <div key={item.id} className="ec-portfolio-row">
              <span className="mono">{item.id}</span>
              <span className="title">{item.title}</span>
              <span>{item.type}</span>
              <span>
                <BadgeEstado status={item.status} />
              </span>
              <span>
                {item.score !== null ? (
                  <span className="score">
                    {item.score}
                    <span className="score-suffix">/100</span>
                  </span>
                ) : (
                  <span className="score pending">Sin analizar</span>
                )}
              </span>
              <span>
                <BadgeDocente status={item.teacherStatus} />
              </span>
              <span className="mono">{item.updatedAt}</span>
              <span className="ec-portfolio-actions">
                <button
                  className="ec-link-btn"
                  type="button"
                  onClick={() => onOpenItem(item)}
                >
                  Ver
                </button>
                <button className="ec-link-btn" type="button">
                  Enviar a IA
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="ec-tip">
        <Clock3 size={18} className="ec-tip-ico" />
        <p>
          Este portafolio permitirá medir la evolución del estudiante en
          contratos a lo largo del semestre.
        </p>
      </div>
    </motion.div>
  );
}

function BadgeEstado({ status }: { status: PortfolioItem["status"] }) {
  return (
    <span className={`ec-badge-status ec-badge-${status.toLowerCase()}`}>
      {status}
    </span>
  );
}

function BadgeDocente({
  status,
}: {
  status: PortfolioItem["teacherStatus"];
}) {
  return (
    <span
      className={`ec-badge-teacher ec-badge-teacher-${status.toLowerCase()}`}
    >
      {status}
    </span>
  );
}

/* =========================================================
   MODAL GENÉRICO
   ========================================================= */

function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="ec-modal-backdrop" onClick={onClose}>
      <div
        className="ec-modal"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <header className="ec-modal-header">
          <h3 className="ec-modal-title">{title}</h3>
          <button className="ec-modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </header>
        <div className="ec-modal-body">{children}</div>
      </div>
    </div>
  );
}

/* =========================================================
   STYLES
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
  --grid:#F1E4DB;
  --axis:#F0E0D8;
  --cursor:#FFF2EA;

  --ok:#059669;
  --warn:#B45309;

  --tip-bg:#FFEFE6;
  --tip-br:#F6D9C9;

  --shadow-sm:0 4px 12px rgba(0,0,0,.06);
  --shadow-md:0 12px 28px rgba(0,0,0,.08), 0 2px 6px rgba(0,0,0,.04);
}

/* ROOT */
.ec-root{
  background:var(--bg);
  width:100%;
  padding:16px 0 16px 0;
}

/* HEADER */
.ec-hdr{
  padding:0 0 8px 0;
  border-bottom:1px solid var(--line);
}
.ec-h1{
  font-size:1.45rem;
  font-weight:900;
  margin:0;
  color:var(--text);
}
.ec-sub{
  margin:.25rem 0 0;
  color:var(--subtext);
  font-size:.93rem;
}

/* KPIs CONTRATOS */
.ec-kpi-row{
  display:grid;
  grid-template-columns: repeat(1, minmax(0,1fr));
  gap:10px;
  margin:12px 0 10px;
}
@media(min-width:900px){
  .ec-kpi-row{
    grid-template-columns: repeat(3, minmax(0,1fr));
  }
}
.ec-kpi-card{
  background:var(--panel);
  border-radius:16px;
  border:1px solid #F3D8C7;
  padding:10px 12px;
  box-shadow:var(--shadow-sm);
  display:flex;
  flex-direction:column;
  gap:4px;
}
.ec-kpi-card.accent{
  border-color:var(--brand-400);
  box-shadow:var(--shadow-md);
}
.ec-kpi-top{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:8px;
}
.ec-kpi-icon{
  width:28px; height:28px;
  border-radius:999px;
  display:flex; align-items:center; justify-content:center;
  background:#FFF2EA;
  color:var(--brand-500);
}
.ec-kpi-badge{
  font-size:.7rem;
  padding:3px 8px;
  border-radius:999px;
  background:#FFF7F2;
  color:#8a4d2b;
  border:1px solid #FFD6BB;
}
.ec-kpi-label{
  margin:2px 0 0;
  font-size:.8rem;
  color:var(--subtext);
}
.ec-kpi-value{
  margin:0;
  font-size:1.25rem;
  font-weight:800;
  color:var(--text);
}
.ec-kpi-hint{
  margin:0;
  font-size:.78rem;
  color:var(--subtext);
}
.ec-kpi-progress{
  margin-top:4px;
}
.ec-kpi-progress-track{
  width:100%;
  height:7px;
  border-radius:999px;
  background:#FFE3D3;
  overflow:hidden;
}
.ec-kpi-progress-bar{
  height:7px;
  border-radius:999px;
  background:var(--brand-400);
}
.ec-kpi-progress-text{
  margin-top:2px;
  font-size:.73rem;
  color:var(--subtext);
}

/* MAIN LAYOUT */
.ec-main{
  display:grid;
  grid-template-columns: minmax(220px,260px) minmax(0,1fr);
  gap:16px;
  padding:4px 0 0 0;
}
@media(max-width:768px){
  .ec-main{
    grid-template-columns: 1fr;
  }
}

/* NAV IZQUIERDO */
.ec-nav{
  display:flex;
  flex-direction:column;
  gap:10px;
}
.ec-nav-title{
  font-size:.85rem;
  font-weight:700;
  color:var(--subtext);
  text-transform:uppercase;
  letter-spacing:.06em;
}
.ec-nav-list{
  list-style:none;
  margin:0;
  padding:0;
  display:flex;
  flex-direction:column;
  gap:8px;
}
.ec-nav-item{
  width:100%;
  border:none;
  display:flex;
  align-items:flex-start;
  gap:10px;
  padding:9px 10px;
  border-radius:14px;
  background:#FFF8F4;
  cursor:pointer;
  text-align:left;
  transition:background .18s ease, box-shadow .18s ease, transform .1s ease;
  border:1px solid transparent;
}
.ec-nav-item:hover{
  background:#FFE9DC;
  box-shadow:var(--shadow-sm);
  transform:translateY(-1px);
}
.ec-nav-item.active{
  background:#FFE3D3;
  border-color:var(--brand-400);
  box-shadow:var(--shadow-md);
}
.ec-nav-icon{
  width:28px;
  height:28px;
  border-radius:999px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:#FFF2EA;
  color:var(--brand-500);
  flex-shrink:0;
}
.ec-nav-text{
  flex:1;
}
.ec-nav-label{
  display:block;
  font-size:.9rem;
  font-weight:700;
  color:var(--text);
}
.ec-nav-desc{
  display:block;
  font-size:.75rem;
  color:var(--subtext);
  margin-top:2px;
}
.ec-nav-arrow{
  color:var(--subtext);
  margin-left:4px;
  flex-shrink:0;
}

.ec-nav-tip{
  border-radius:14px;
  padding:8px 10px;
  border:1px dashed var(--tip-br);
  background:var(--tip-bg);
  font-size:.78rem;
  display:flex;
  gap:8px;
  color:var(--text);
}

/* CONTENIDO DERECHA */
.ec-content{
  width:100%;
}

/* CARD BASE */
.ec-card{
  background:var(--panel);
  border-radius:16px;
  border:1px solid transparent;
  padding:14px 16px;
  box-shadow:var(--shadow-md);
}
.ec-card-main{
  display:flex;
  flex-direction:column;
  gap:16px;
}
.ec-card-hdr{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:12px;
}

/* TEXTOS */
.ec-h2{
  margin:0;
  font-size:1.05rem;
  font-weight:800;
  color:var(--text);
}
.ec-sub-mini{
  margin:4px 0 0;
  font-size:.84rem;
  color:var(--subtext);
}
.ec-strong{
  color:var(--brand-500);
  font-weight:700;
}

/* BOTONES */
.ec-btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:6px;
  padding:7px 12px;
  border-radius:12px;
  border:none;
  background:var(--brand-400);
  color:#fff;
  font-size:.82rem;
  font-weight:700;
  cursor:pointer;
  box-shadow:0 10px 20px rgba(255,138,76,.22);
}
.ec-btn:hover{
  background:var(--brand-500);
}
.ec-btn.ghost{
  background:#FFF2EA;
  color:var(--brand-500);
  box-shadow:none;
  border:1px solid #FFD6BB;
}
.ec-btn.ghost:hover{
  background:#FFE3D3;
}
.ec-btn-full{
  width:100%;
}

/* BIBLIOTECA */
.ec-biblio-grid{
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap:12px;
}
.ec-biblio-card{
  background:#FFFDFC;
  border-radius:14px;
  padding:10px 12px;
  border:1px solid #F3D8C7;
  box-shadow:var(--shadow-sm);
  display:flex;
  flex-direction:column;
  gap:8px;
  align-items:stretch;
}
.ec-biblio-thumb{
  width:100%;
  aspect-ratio:16/9;
  border-radius:10px;
  background:linear-gradient(135deg, #FFE3D3, #FFF8F4);
  display:flex;
  align-items:center;
  justify-content:center;
}
.ec-biblio-thumb-inner{
  width:60px;
  height:60px;
  border-radius:18px;
  background:#fff;
  border:1px solid #F3D8C7;
  display:flex;
  align-items:center;
  justify-content:center;
  color:var(--brand-500);
  box-shadow:0 10px 25px rgba(0,0,0,.06);
}
.ec-biblio-title{
  margin:4px 0 0;
  font-size:.95rem;
  font-weight:700;
  color:var(--text);
}
.ec-biblio-actions{
  display:flex;
  justify-content:space-between;
  gap:6px;
  flex-wrap:wrap;
}

/* TEORÍA */
.ec-theory-layout{
  display:grid;
  grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);
  gap:14px;
}
@media(max-width:900px){
  .ec-theory-layout{
    grid-template-columns:1fr;
  }
}
.ec-theory-list{
  display:flex;
  flex-direction:column;
  gap:6px;
}
.ec-theory-item{
  width:100%;
  border-radius:12px;
  border:1px solid #F3D8C7;
  background:#FFFDFB;
  padding:7px 9px;
  cursor:pointer;
  text-align:left;
  display:flex;
  flex-direction:column;
  gap:4px;
}
.ec-theory-item:hover{
  background:#FFEFE6;
}
.ec-theory-meta{
  display:flex;
  align-items:center;
  gap:6px;
  font-size:.7rem;
}
.ec-theory-article{
  padding:2px 7px;
  border-radius:999px;
  background:#FFF2EA;
  color:var(--brand-500);
  font-weight:600;
}
.ec-theory-code{
  color:var(--subtext);
}
.ec-theory-question{
  margin:0;
  font-size:.85rem;
  font-weight:600;
  color:var(--text);
}

/* Aside */
.ec-flow-aside{
  border-radius:12px;
  padding:10px;
  border:1px solid #F3D8C7;
  background:#FFF8F4;
  display:flex;
  flex-direction:column;
  gap:8px;
}
.ec-flow-aside-title{
  margin:0;
  font-size:.92rem;
  font-weight:700;
  color:var(--text);
}
.ec-flow-aside-text{
  margin:2px 0 0;
  font-size:.82rem;
  color:var(--subtext);
}
.ec-pill-list{
  list-style:none;
  margin:6px 0 0;
  padding:0;
  display:flex;
  flex-direction:column;
  gap:6px;
}
.ec-pill{
  border-radius:999px;
  background:#FFF;
  border:1px solid #F3D8C7;
  padding:6px 10px;
  font-size:.79rem;
  display:flex;
  flex-direction:column;
}
.ec-pill strong{
  font-size:.8rem;
}
.ec-pill span{
  font-size:.75rem;
  color:var(--subtext);
}

/* NUEVO: PARTES DEL CONTRATO */
.ec-parts-section{
  margin-top:4px;
  border-top:1px dashed #F3D8C7;
  padding-top:6px;
}
.ec-part-chips{
  margin-top:4px;
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}
.ec-part-chip{
  border-radius:999px;
  padding:5px 9px;
  border:1px solid #F3D8C7;
  background:#FFFFFF;
  font-size:.78rem;
  cursor:pointer;
  color:#7C2D12;
}
.ec-part-chip:hover{
  background:#FFEFE6;
}

/* Tip compartido */
.ec-tip{
  margin-top:4px;
  border-radius:12px;
  border:1px solid var(--tip-br);
  background:var(--tip-bg);
  padding:7px 9px;
  display:flex;
  gap:8px;
  font-size:.8rem;
  color:var(--text);
}
.ec-tip-ico{
  flex-shrink:0;
}

/* ASISTENTE CREACIÓN */
.ec-assistant-layout{
  display:grid;
  grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);
  gap:14px;
}
@media(max-width:1000px){
  .ec-assistant-layout{
    grid-template-columns:1fr;
  }
}
.ec-form-grid{
  display:flex;
  flex-direction:column;
  gap:12px;
}
.ec-form-section{
  border-radius:12px;
  border:1px solid #F3D8C7;
  background:#FFFDFB;
  padding:9px 11px;
  display:flex;
  flex-direction:column;
  gap:9px;
}
.ec-form-title{
  margin:0;
  font-size:.93rem;
  font-weight:700;
  color:var(--text);
}
.ec-form-row{
  display:grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap:8px;
}
.ec-field{
  display:flex;
  flex-direction:column;
  gap:4px;
}
.ec-label{
  font-size:.79rem;
  font-weight:600;
  color:var(--subtext);
}
.ec-input{
  border-radius:9px;
  border:1px solid #E5E7EB;
  padding:6px 8px;
  font-size:.84rem;
  outline:none;
  resize:vertical;
}
.ec-input:focus{
  border-color:var(--brand-400);
  box-shadow:0 0 0 1px rgba(255,138,76,.35);
}
.ec-form-actions{
  display:flex;
  justify-content:flex-end;
  gap:8px;
  margin-top:4px;
}

/* Preview contrato */
.ec-assistant-preview{
  border-radius:12px;
  border:1px solid #F3D8C7;
  background:#FFFDFB;
  padding:9px 11px;
  display:flex;
  flex-direction:column;
  gap:8px;
}
.ec-preview-box{
  border-radius:10px;
  border:1px solid #E5E7EB;
  background:#FFFFFF;
  padding:8px;
  max-height:260px;
  overflow:auto;
}
.ec-preview-text{
  margin:0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size:.78rem;
  white-space:pre-wrap;
}
.ec-download-ico{
  display:block;
}

/* REVISOR IA */
.ec-review-layout{
  display:grid;
  grid-template-columns: minmax(0,1.2fr) minmax(0,1fr);
  gap:14px;
}
@media(max-width:900px){
  .ec-review-layout{
    grid-template-columns: 1fr;
  }
}
.ec-review-left{
  display:flex;
  flex-direction:column;
  gap:9px;
}
.ec-upload-box{
  border-radius:12px;
  border:1px dashed #F3D8C7;
  background:#FFF8F4;
  padding:11px;
  text-align:center;
  display:flex;
  flex-direction:column;
  gap:5px;
  align-items:center;
}
.ec-upload-ico{
  color:var(--brand-500);
}
.ec-upload-title{
  margin:0;
  font-size:.9rem;
  font-weight:700;
  color:var(--text);
}
.ec-upload-sub{
  margin:0;
  font-size:.79rem;
  color:var(--subtext);
}
.ec-upload-btn{
  margin-top:4px;
  border-radius:999px;
  padding:5px 12px;
  border:1px solid #FFD6BB;
  background:#FFF2EA;
  font-size:.78rem;
  cursor:pointer;
  position:relative;
  overflow:hidden;
}
.ec-upload-btn input{
  position:absolute;
  inset:0;
  opacity:0;
  cursor:pointer;
}
.ec-upload-file{
  margin:2px 0 0;
  font-size:.78rem;
  color:var(--subtext);
}
.ec-or{
  text-align:center;
  font-size:.78rem;
  color:var(--subtext);
}
.ec-error-msg{
  margin:0;
  font-size:.78rem;
  color:#B91C1C;
}

/* Dashboard derecha */
.ec-review-right{
  display:flex;
  flex-direction:column;
  gap:9px;
}
.ec-score-card{
  border-radius:12px;
  border:1px solid #F3D8C7;
  background:#FFFDFB;
  padding:9px 11px;
}
.ec-score-row{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:8px;
}
.ec-score-label{
  margin:0;
  font-size:.79rem;
  color:var(--subtext);
}
.ec-score-value{
  margin:4px 0 0;
  font-size:1.5rem;
  font-weight:800;
  color:var(--text);
}
.ec-score-unit{
  font-size:.93rem;
  color:var(--subtext);
  margin-left:4px;
}
.ec-score-hint{
  margin:2px 0 0;
  font-size:.79rem;
  color:var(--subtext);
}

/* Semáforo */
.ec-semaforo{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:4px 8px;
  border-radius:999px;
  font-size:.74rem;
  border:1px solid #E5E7EB;
  background:#F9FAFB;
}
.ec-semaforo-dot{
  width:9px;
  height:9px;
  border-radius:999px;
  display:inline-block;
}
.ec-semaforo-dot.red{ background:#EF4444; }
.ec-semaforo-dot.yellow{ background:#F59E0B; }
.ec-semaforo-dot.green{ background:#22C55E; }
.ec-semaforo-label{
  color:#374151;
}
.ec-semaforo-low{ border-color:#BBF7D0; background:#ECFDF3; }
.ec-semaforo-medium{ border-color:#FEF3C7; background:#FFFBEB; }
.ec-semaforo-high{ border-color:#FECACA; background:#FEF2F2; }

/* Metric bars */
.ec-metrics-card{
  border-radius:12px;
  border:1px solid #E5E7EB;
  background:#FFFFFF;
  padding:9px 11px;
}
.ec-metric-row{
  display:grid;
  grid-template-columns:minmax(0,1.7fr) minmax(0,1.6fr) auto;
  gap:6px;
  align-items:center;
  font-size:.78rem;
  margin:4px 0;
}
.ec-metric-label{
  color:#374151;
}
.ec-metric-bar{
  width:100%;
  height:7px;
  border-radius:999px;
  background:#F3F4F6;
  overflow:hidden;
}
.ec-metric-fill{
  height:7px;
  border-radius:999px;
  background:var(--brand-400);
}
.ec-metric-value{
  font-weight:600;
  color:#4B5563;
}

/* Observaciones & checklist */
.ec-observations{
  margin-top:4px;
}
.ec-checklist-box{
  margin-top:4px;
}
.ec-checklist{
  list-style:none;
  margin:4px 0 0;
  padding:0;
  display:flex;
  flex-direction:column;
  gap:4px;
  font-size:.8rem;
}
.ec-checklist li{
  display:flex;
  align-items:flex-start;
  gap:6px;
}
.ec-checklist li.ok{
  color:#14532D;
}
.ec-checklist li.warn{
  color:#7F1D1D;
}
.ec-empty-review{
  border-radius:12px;
  border:1px dashed #E5E7EB;
  background:#F9FAFB;
  padding:9px 11px;
}

/* PORTAFOLIO */
.ec-portfolio-summary{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}
.ec-portfolio-pill{
  border-radius:999px;
  padding:5px 9px;
  background:#FFF8F4;
  border:1px solid #F3D8C7;
  font-size:.78rem;
  display:flex;
  align-items:center;
  gap:6px;
}
.ec-portfolio-pill span{
  color:var(--subtext);
}
.ec-portfolio-pill strong{
  color:var(--text);
}

.ec-portfolio-table{
  margin-top:9px;
  border-radius:12px;
  border:1px solid #E5E7EB;
  overflow:hidden;
}
.ec-portfolio-header-row{
  display:grid;
  grid-template-columns: 0.7fr 1.4fr 1.3fr 1fr 0.9fr 1fr 1fr 1.2fr;
  gap:4px;
  padding:7px 9px;
  background:#FFF7F2;
  border-bottom:1px solid #E5E7EB;
  font-size:.74rem;
  font-weight:600;
  color:#4B5563;
}
.ec-portfolio-body{
  max-height:250px;
  overflow:auto;
}
.ec-portfolio-row{
  display:grid;
  grid-template-columns: 0.7fr 1.4fr 1.3fr 1fr 0.9fr 1fr 1fr 1.2fr;
  gap:4px;
  padding:7px 9px;
  font-size:.78rem;
  align-items:center;
  border-bottom:1px solid #F3F4F6;
}
.ec-portfolio-row:nth-child(odd){
  background:#FFFDFB;
}
.ec-portfolio-row:nth-child(even){
  background:#FFFFFF;
}
.ec-portfolio-row .mono{
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size:.76rem;
}
.ec-portfolio-row .title{
  font-weight:600;
}
.ec-portfolio-actions{
  display:flex;
  flex-wrap:wrap;
  gap:4px;
}
.ec-link-btn{
  border:none;
  background:none;
  padding:0;
  font-size:.75rem;
  color:var(--brand-500);
  cursor:pointer;
  text-decoration:underline;
}

/* Badges */
.ec-badge-status,
.ec-badge-teacher{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:2px 8px;
  border-radius:999px;
  font-size:.72rem;
}
.ec-badge-borrador{
  background:#EFF6FF;
  color:#1D4ED8;
}
.ec-badge-enviado{
  background:#FEF9C3;
  color:#92400E;
}
.ec-badge-revisado{
  background:#ECFDF3;
  color:#166534;
}
.ec-badge-teacher-pendiente{
  background:#E5E7EB;
  color:#374151;
}
.ec-badge-teacher-observado{
  background:#FEF2F2;
  color:#B91C1C;
}
.ec-badge-teacher-aprobado{
  background:#ECFDF3;
  color:#15803D;
}

/* Score */
.score{
  font-weight:700;
  color:var(--text);
}
.score-suffix{
  font-size:.75rem;
  color:var(--subtext);
  margin-left:2px;
}
.score.pending{
  font-style:italic;
  color:var(--subtext);
}

/* MODALES */
.ec-modal-backdrop{
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.36);
  display:flex;
  align-items:center;
  justify-content:center;
  z-index:50;
}
.ec-modal{
  background:#fff;
  border-radius:18px;
  box-shadow:0 24px 60px rgba(0,0,0,.2);
  width:min(560px, 100% - 32px);
  max-height:80vh;
  display:flex;
  flex-direction:column;
}
.ec-modal-header{
  padding:10px 14px;
  border-bottom:1px solid #E5E7EB;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}
.ec-modal-title{
  margin:0;
  font-size:.98rem;
  font-weight:800;
  color:var(--text);
}
.ec-modal-close{
  border:none;
  background:none;
  cursor:pointer;
  color:#6B7280;
}
.ec-modal-body{
  padding:10px 14px 12px;
  overflow:auto;
}
.ec-modal-text{
  margin:0 0 8px;
  font-size:.83rem;
  color:var(--subtext);
}
.ec-modal-subtitle{
  margin:10px 0 4px;
  font-size:.86rem;
  font-weight:700;
  color:var(--text);
}
.ec-modal-label{
  margin:4px 0;
  font-size:.83rem;
  color:var(--subtext);
  display:flex;
  justify-content:space-between;
  gap:8px;
}
.ec-modal-actions{
  margin-top:10px;
  display:flex;
  justify-content:flex-end;
  gap:8px;
}

/* Errores en modal */
.ec-errors-list{
  list-style:none;
  margin:4px 0 0;
  padding:0;
  display:flex;
  flex-direction:column;
  gap:4px;
}
.ec-error-card{
  border-radius:10px;
  padding:6px 8px;
  font-size:.78rem;
  display:flex;
  flex-direction:column;
  gap:2px;
}
.ec-error-card.bad{
  background:#FEF2F2;
  border:1px solid #FECACA;
  color:#7F1D1D;
}
.ec-error-card.good{
  background:#ECFDF3;
  border:1px solid #BBF7D0;
  color:#14532D;
}
.ec-error-header{
  display:flex;
  align-items:center;
  gap:6px;
  font-weight:600;
}
.ec-error-card p{
  margin:0;
}

/* TABLA PARTES DEL CONTRATO */
.ec-part-table{
  width:100%;
  border-collapse:collapse;
  margin-top:4px;
  font-size:.8rem;
}
.ec-part-table th,
.ec-part-table td{
  border:1px solid #E5E7EB;
  padding:6px 8px;
  text-align:left;
  vertical-align:top;
}
.ec-part-table thead th{
  background:#FFF7F2;
  font-weight:700;
  color:#4B5563;
}
.ec-part-table tbody td:first-child{
  width:30%;
  font-weight:600;
  color:#374151;
}
` as const;
