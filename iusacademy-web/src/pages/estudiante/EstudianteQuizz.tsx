// src/pages/estudiante/EstudianteQuizIA.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  BookOpenCheck,
  Shuffle,
  Timer,
  Trophy,
  Play,
  RefreshCw,
  BookOpen,
  Landmark,
  Gavel,
  Scale,
} from "lucide-react";

/* ================== Tipos ================== */
type Topic =
  | "Obligaciones"
  | "Contratos"
  | "Responsabilidad Civil"
  | "Derechos Reales"
  | "Personas y Familia";

type Difficulty = "Fácil" | "Media" | "Difícil";

type Choice = { id: string; text: string };
type Question = {
  id: string;
  topic: Topic;
  difficulty: Difficulty;
  prompt: string;
  choices: Choice[];
  correctId: string;
  explanation: string;
};

/* ================== Utils ================== */
const uid = () => Math.random().toString(36).slice(2, 10);
const shuffle = <T,>(arr: T[]) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const sample = <T,>(arr: T[], n: number) => shuffle(arr).slice(0, n);

/* Etiquetas */
const tagColor: Record<Topic, string> = {
  Obligaciones: "bg-[var(--primarySoft)] text-[var(--accent)] ring-[var(--accent)]/30",
  Contratos: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "Responsabilidad Civil": "bg-rose-50 text-rose-700 ring-rose-200",
  "Derechos Reales": "bg-amber-50 text-amber-800 ring-amber-200",
  "Personas y Familia": "bg-sky-50 text-sky-700 ring-sky-200",
};
const diffColor: Record<Difficulty, string> = {
  Fácil: "bg-green-100 text-green-800",
  Media: "bg-yellow-100 text-yellow-800",
  Difícil: "bg-red-100 text-red-800",
};

/* ================== Banco MOCK ================== */
const BANK: Question[] = [
  {
    id: uid(),
    topic: "Obligaciones",
    difficulty: "Fácil",
    prompt:
      "Según el Código Civil boliviano, una obligación es una relación jurídica por la cual:",
    choices: [
      { id: "a", text: "El acreedor está obligado a dar, hacer o no hacer." },
      { id: "b", text: "El deudor puede exigir una prestación al acreedor." },
      { id: "c", text: "El acreedor puede exigir al deudor una prestación." },
      { id: "d", text: "Ambas partes solo tienen deberes morales." },
    ],
    correctId: "c",
    explanation:
      "La obligación implica que el acreedor puede exigir al deudor una prestación: dar, hacer o no hacer.",
  },
  {
    id: uid(),
    topic: "Obligaciones",
    difficulty: "Media",
    prompt:
      "En una obligación alternativa, si la elección corresponde al deudor y una de las prestaciones se torna imposible por caso fortuito:",
    choices: [
      { id: "a", text: "Se extingue la obligación sin responsabilidad." },
      { id: "b", text: "El deudor debe cumplir con la prestación restante." },
      { id: "c", text: "El acreedor elige una prestación nueva." },
      { id: "d", text: "Se reduce el precio de la obligación." },
    ],
    correctId: "b",
    explanation:
      "Si una prestación deviene imposible sin culpa, subsiste la otra (obligaciones alternativas).",
  },
  {
    id: uid(),
    topic: "Obligaciones",
    difficulty: "Difícil",
    prompt: "La mora del deudor se configura cuando:",
    choices: [
      { id: "a", text: "Transcurre el término sin requerimiento alguno." },
      {
        id: "b",
        text: "Existe requerimiento o está pactado el vencimiento cierto y no cumple.",
      },
      { id: "c", text: "El acreedor renuncia a intereses moratorios." },
      { id: "d", text: "El juez lo declara en rebeldía." },
    ],
    correctId: "b",
    explanation:
      "Regla general: mora por interpelación o por vencimiento de término cierto si así se convino.",
  },
  // ... resto del banco igual, no modificado ...
];

/* ================== UI helpers ================== */
const Chip: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <span
    className={
      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset " +
      className
    }
  >
    {children}
  </span>
);

const Card: React.FC<
  React.PropsWithChildren<{ title?: string; icon?: React.ReactNode; right?: React.ReactNode }>
> = ({ title, icon, right, children }) => (
  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
    {(title || right) && (
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2 text-gray-800 font-semibold">
          {icon}
          {title && <span>{title}</span>}
        </div>
        <div>{right}</div>
      </div>
    )}
    <div className="p-4">{children}</div>
  </div>
);

/* ================== Página ================== */
export default function EstudianteQuizIA() {
  const [phase, setPhase] = useState<"quiz" | "results">("quiz");
  const [pool, setPool] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(60);
  const TIMED = true;

  useEffect(() => {
    const p = sample(BANK, 8);
    setPool(p);
    setAnswers(Object.fromEntries(p.map((q) => [q.id, null])));
    setCurrent(0);
    setPhase("quiz");
    setTimeLeft(TIMED ? 60 : null);
  }, []);

  useEffect(() => {
    if (phase !== "quiz" || timeLeft === null) return;
    if (timeLeft <= 0) return nextAuto();
    const t = setTimeout(() => setTimeLeft((s) => (s ?? 0) - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  const selectAnswer = (qid: string, choiceId: string) =>
    setAnswers((a) => ({ ...a, [qid]: a[qid] === choiceId ? null : choiceId }));

  const prev = () => {
    setCurrent((c) => Math.max(0, c - 1));
    if (TIMED) setTimeLeft(60);
  };
  const next = () => {
    current < pool.length - 1 ? setCurrent(current + 1) : setPhase("results");
    if (TIMED) setTimeLeft(60);
  };
  const nextAuto = () => next();

  const score = useMemo(() => {
    let ok = 0;
    pool.forEach((q) => answers[q.id] === q.correctId && ok++);
    return { ok, total: pool.length, pct: Math.round((ok / pool.length) * 100) };
  }, [answers, pool]);

  const regenerate = () => location.reload();
  const q = pool[current];

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6">
      {/* Encabezado */}
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary)] text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Quiz: Derecho Civil Boliviano — Parte General
          </h1>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* CARD PRINCIPAL */}
        <Card
          title={phase === "quiz" ? `Pregunta ${current + 1}` : "Revisión"}
          icon={<BookOpen className="h-5 w-5" />}
          right={<Chip className="bg-[var(--primarySoft)] text-[var(--accent)] ring-[var(--accent)]/30">
            {phase === "quiz" ? `${current + 1}/${pool.length}` : "Completado"}
          </Chip>}
        >
          {phase === "quiz" && q && (
            <div className="space-y-4">
              {/* Etiquetas */}
              <div className="flex flex-wrap gap-2">
                <Chip className={diffColor[q.difficulty]}>{q.difficulty}</Chip>
                <Chip className={tagColor[q.topic]}>{q.topic}</Chip>
              </div>

              <h2 className="text-lg font-semibold text-gray-900">{q.prompt}</h2>

              {/* Opciones */}
              <div className="grid gap-2">
                {q.choices.map((c) => {
                  const selected = answers[q.id] === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectAnswer(q.id, c.id)}
                      className={
                        "flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition " +
                        (selected
                          ? "border-[var(--accent)] bg-[var(--primary)] text-white"
                          : "border-gray-200 hover:bg-[var(--primarySoft)]")
                      }
                    >
                      {c.text}
                    </button>
                  );
                })}
              </div>

              {/* Navegación */}
              <div className="flex items-center justify-between pt=2">
                <button
                  onClick={prev}
                  disabled={current === 0}
                  className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50"
                >
                  Anterior
                </button>

                <button
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--accent)]"
                >
                  {current < pool.length - 1 ? "Siguiente" : "Finalizar"}
                  <Play className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* RESULTADOS */}
          {phase === "results" && (
            <div className="grid gap-3">
              {pool.map((qq, idx) => {
                const chosen = answers[qq.id];
                const ok = chosen === qq.correctId;
                return (
                  <div key={qq.id} className="rounded-xl border border-gray-200 p-3">
                    <div className="mb-2 text-sm font-semibold text-gray-800">
                      {idx + 1}. {qq.prompt}
                    </div>

                    <div className="text-sm">
                      Tu respuesta:{" "}
                      <span className={ok ? "text-green-700 font-semibold" : "text-rose-700 font-semibold"}>
                        {qq.choices.find((c) => c.id === chosen)?.text ?? "—"}
                      </span>
                    </div>

                    {!ok && (
                      <div className="text-sm">
                        Correcta:{" "}
                        <span className="font-semibold text-gray-900">
                          {qq.choices.find((c) => c.id === qq.correctId)?.text}
                        </span>
                      </div>
                    )}

                    <div className="mt-2 rounded-lg bg-gray-50 p-2 text-sm text-gray-700">
                      {qq.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* PROGRESO / RESULTADOS */}
        <Card
          title={phase === "quiz" ? "Progreso" : "Resultados"}
          icon={<Trophy className="h-5 w-5" />}
          right={
            <Chip className="bg-[var(--primarySoft)] text-[var(--accent)] ring-[var(--accent)]/30">
              {phase === "quiz" ? `${current + 1}/${pool.length}` : `${score.ok}/${score.total}`}
            </Chip>
          }
        >
          {phase === "quiz" ? (
            <div className="space-y-4">
              <div className="h-2 w-full rounded-full bg-[var(--primarySoft)]">
                <div
                  className="h-2 rounded-full bg-[var(--primary)] transition-all"
                  style={{ width: `${((current + 1) / pool.length) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-2 w-full rounded-full bg-[var(--primarySoft)]">
                <div
                  className="h-2 rounded-full bg-[var(--primary)] transition-all"
                  style={{ width: `${score.pct}%` }}
                />
              </div>

              <div className="text-4xl font-extrabold text-gray-900">{score.pct}/100</div>

              <button
                onClick={regenerate}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
              >
                <RefreshCw className="h-4 w-4" />
                Nuevo Quiz
              </button>
            </div>
          )}
        </Card>

        {/* MÁS QUIZZES */}
        <Card title="Más quizzes" icon={<Landmark className="h-5 w-5" />}>
          <div className="grid gap-3">
            <a onClick={regenerate} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 hover:bg-[var(--primarySoft)] cursor-pointer">
              <Gavel className="h-5 w-5 text-[var(--accent)]" />
              <div className="text-sm">
                <div className="font-semibold text-gray-900">Actos jurídicos y nulidad</div>
              </div>
            </a>
            <a onClick={regenerate} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 hover:bg-[var(--primarySoft)] cursor-pointer">
              <BookOpen className="h-5 w-5 text-[var(--accent)]" />
              <div className="text-sm">
                <div className="font-semibold text-gray-900">Contratos: compraventa</div>
              </div>
            </a>
            <a onClick={regenerate} className="flex items-center gap-3 rounded-xl border border-gray-200 p-3 hover:bg-[var(--primarySoft)] cursor-pointer">
              <Scale className="h-5 w-5 text-[var(--accent)]" />
              <div className="text-sm">
                <div className="font-semibold text-gray-900">Responsabilidad civil</div>
              </div>
            </a>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
