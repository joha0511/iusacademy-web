// src/pages/estudiante/EstudianteAsistente.tsx
import React, { useEffect, useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  BookOpen,
  Brain,
  Mic,
  FileText,
} from "lucide-react";
import VoiceAssistant from "../../components/VoiceAssistant";
import drFranz from "../../assets/drFranz.png";
import { meApi } from "@/services/auth";

/* ===================== TIPOS ===================== */
type ChatMessage = {
  id: number;
  from: "bot" | "user";
  text: string;
};

const quickQuestions = [
  "¿Cómo estructuro un memorial básico?",
  "Explícame la diferencia entre demanda y contestación.",
  "¿Qué etapas tiene una audiencia preliminar?",
  "¿Cómo cito un artículo del Código correctamente?",
];

/* Saludo según la hora */
function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Buenos días";
  if (hour >= 12 && hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function EstudianteAsistente() {
  /* =============== NOMBRE DEL USUARIO CONECTADO =============== */
  const [userName, setUserName] = useState<string>("");
  const [timeGreeting, setTimeGreeting] = useState<string>(getTimeGreeting());

  useEffect(() => {
    async function loadUser() {
      try {
        const res: any = await meApi();
        const data = res?.data ?? res;
        const name =
          data?.nombreCompleto ||
          data?.fullName ||
          data?.name ||
          data?.nombre ||
          "";
        setUserName(name);
      } catch {
        setUserName("");
      }
    }
    loadUser();
    setTimeGreeting(getTimeGreeting());
  }, []);

  const displayName = userName || "estudiante";

  /* ===================== MANUAL (MODAL) ===================== */
  const [openManual, setOpenManual] = useState(false);

  /* ===================== CHAT ===================== */
  const [chatOpen, setChatOpen] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Mensaje inicial con el nombre del usuario y saludo
  useEffect(() => {
    const first: ChatMessage = {
      id: 1,
      from: "bot",
      text: `${timeGreeting}, ${displayName}! Soy el Dr. Franz 👦✨. ¿En qué puedo ayudarte hoy? Puedo orientarte con memoriales, artículos del Código y simulaciones.`,
    };
    setMessages([first]);
  }, [displayName, timeGreeting]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const nextId = messages.length + 1;
    const userMsg: ChatMessage = {
      id: nextId,
      from: "user",
      text,
    };

    const botMsg: ChatMessage = {
      id: nextId + 1,
      from: "bot",
      text:
        "Gracias por tu mensaje 😊. En futuras versiones podré responderte con IA jurídica especializada.",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  }

  function sendQuickQuestion(text: string) {
    setInput(text);
    setTimeout(() => {
      const fakeEvent = { preventDefault() {} } as unknown as React.FormEvent;
      sendMessage(fakeEvent);
    }, 80);
  }

  /* ===================== UI ===================== */
  return (
    <main className="ea-wrap">
      {/* HEADER */}
      <header className="ea-header">
        <h1 className="ea-title">Asistente virtual</h1>
        <p className="ea-sub">
          Te acompaño en tu estudio de Derecho. Puedes usar chat, voz y revisar el
          manual interactivo.
        </p>
      </header>

      {/* LAYOUT PRINCIPAL */}
      <div className="ea-main">
        {/* IZQUIERDA: Manual + voz */}
        <section className="ea-left">
          {/* Card Manual pequeño */}
          <div className="ea-manual-card" onClick={() => setOpenManual(true)}>
            <BookOpen size={28} />
            <div>
              <h3>Manual del asistente</h3>
              <p>Cómo usar al Dr. Franz con ejemplos, pasos y consejos.</p>
            </div>
          </div>

          {/* Card de Voz debajo del manual */}
          <div className="ea-voice-card">
            <div className="ea-voice-top">
              <Mic size={26} />
              <div>
                <h3>Hablar con el asistente</h3>
                <p>Usa el micrófono para hacer preguntas rápidas.</p>
              </div>
            </div>

            <VoiceAssistant />
          </div>
        </section>

        {/* DERECHA: Dr. Franz */}
        <section className="ea-right">
          <div className="ea-drfranz-wrapper">
            <div className="ea-drfranz-halo" />
            <img src={drFranz} className="ea-drfranz-img" alt="Dr. Franz" />
            <div className="ea-drfranz-label">Dr. Franz</div>
          </div>
        </section>
      </div>

      {/* CHAT FLOTANTE (alineado tipo captura, left: 22rem) */}
      <button
        className="ea-chat-fab"
        onClick={() => setChatOpen((v) => !v)}
        aria-label="Abrir chat del asistente"
      >
        {chatOpen ? <X size={18} /> : <MessageCircle size={20} />}
      </button>

      {chatOpen && (
        <div className="ea-chat-floating">
          <div className="ea-chat-header">
            <div className="ea-chat-avatar-wrap">
              <img src={drFranz} className="ea-chat-avatar" alt="Avatar Dr. Franz" />
            </div>
            <div>
              <h3>Chat con el Dr. Franz</h3>
              <p>
                {timeGreeting}, {displayName}. Escribe tu duda y te responderé 😊
              </p>
            </div>
          </div>

          {/* Chips de preguntas rápidas */}
          <div className="ea-chat-chips">
            {quickQuestions.map((q) => (
              <button
                key={q}
                type="button"
                className="ea-chip"
                onClick={() => sendQuickQuestion(q)}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Mensajes */}
          <div className="ea-chat-body">
            {messages.map((m) => (
              <div key={m.id} className={`ea-msg-row ${m.from}`}>
                <div className="ea-msg-bubble">{m.text}</div>
              </div>
            ))}

            {isTyping && (
              <div className="ea-msg-row bot">
                <div className="ea-typing-bubble">
                  Dr. Franz está escribiendo
                  <span className="ea-typing-dot dot1" />
                  <span className="ea-typing-dot dot2" />
                  <span className="ea-typing-dot dot3" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form className="ea-chat-input" onSubmit={sendMessage}>
            <input
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* MODAL MANUAL INTERACTIVO */}
      {openManual && (
        <div className="ea-modal">
          <div className="ea-modal-content">
            <div className="ea-modal-header">
              <h2>Manual del Asistente Virtual</h2>
              <button onClick={() => setOpenManual(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="ea-modal-body">
              {/* Sección 1 */}
              <div className="ea-section">
                <Brain size={30} className="ea-icon" />
                <h3>¿Qué hace el asistente?</h3>
                <p>
                  El Dr. Franz convierte temas jurídicos complejos en explicaciones claras:
                  memoriales, artículos del Código, audiencias y simulaciones académicas.
                </p>
              </div>

              {/* Sección 2 */}
              <div className="ea-section">
                <FileText size={28} className="ea-icon" />
                <h3>¿Qué puedo preguntarle?</h3>
                <ul>
                  <li>📌 Cómo estructurar un memorial según tu materia.</li>
                  <li>📌 Explicación sencilla de un artículo del Código.</li>
                  <li>📌 Pasos de una audiencia preliminar o preparatoria.</li>
                  <li>📌 Recomendaciones para tus simulaciones y tareas.</li>
                </ul>
              </div>

              {/* Sección 3 */}
              <div className="ea-section">
                <Mic size={28} className="ea-icon" />
                <h3>Formas de usarlo</h3>
                <ul>
                  <li>🎤 Modo voz: preguntas orales usando el micrófono.</li>
                  <li>💬 Modo chat: preguntas escritas y respuestas guiadas.</li>
                  <li>📘 Este manual: atajos, ejemplos y recordatorios rápidos.</li>
                </ul>
                <p>
                  En futuras versiones se conectará con IA jurídica para ofrecerte
                  respuestas más completas y personalizadas.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{styles}</style>
    </main>
  );
}

/* =========================================================
   🎨 ESTILOS COMPLETOS
========================================================= */
const styles = `
:root {
  --ea-text: #111827;
  --ea-sub: #6b7280;
  --ea-orange: #ff8a4c;
  --ea-orange-dark: #e36c2d;
}

/* CONTENEDOR PRINCIPAL */
.ea-wrap {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1180px;
  margin: 0 auto;
}

/* HEADER */
.ea-title {
  font-size: 2.1rem;
  font-weight: 900;
  color: var(--ea-text);
  margin: 0;
}
.ea-sub {
  color: var(--ea-sub);
  margin-top: .3rem;
}

/* GRID PRINCIPAL */
.ea-main {
  display: flex;
  gap: 2.4rem;
}
.ea-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
}
.ea-right {
  flex: 1.2;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* CARD MANUAL */
.ea-manual-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: .95rem 1.2rem;
  border: 1px solid #ececec;
  border-radius: 1.1rem;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(0,0,0,.08);
}
.ea-manual-card h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
}
.ea-manual-card p {
  margin: .2rem 0 0;
  color: #666;
  font-size: .85rem;
}

/* CARD VOZ */
.ea-voice-card {
  padding: 1.1rem 1.3rem;
  border-radius: 1.2rem;
  border: 1px solid #e5e7eb;
  background: white;
  box-shadow: 0 10px 24px rgba(15,23,42,.1);
}
.ea-voice-top {
  display: flex;
  align-items: center;
  gap: .9rem;
  margin-bottom: .8rem;
}
.ea-voice-top h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
}

/* DR FRANZ */
.ea-drfranz-wrapper {
  position: relative;
  width: 380px;
}
.ea-drfranz-halo {
  position: absolute;
  inset: 10% 5% 0 5%;
  background: radial-gradient(circle, #ffe7cc 0%, #fff3e5 50%, #fff 100%);
  border-radius: 999px;
  filter: drop-shadow(0 18px 40px rgba(0,0,0,.2));
  z-index: -1;
}
@keyframes floatIn {
  from { opacity: 0; transform: translateY(20px) scale(.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.ea-drfranz-img {
  width: 100%;
  animation: floatIn .8s ease-out;
}
.ea-drfranz-label {
  position: absolute;
  top: -10px;
  right: 12px;
  background: #fef3c7;
  padding: .35rem .9rem;
  border-radius: 999px;
  border: 1px solid #fcd9a2;
  font-weight: 700;
  color: #92400e;
  box-shadow: 0 8px 20px rgba(0,0,0,.18);
}

/* CHAT FLOTANTE — left: 22rem; */
.ea-chat-fab {
  position: fixed;
  left: 22rem;
  bottom: 1.6rem;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  border: none;
  background: var(--ea-orange);
  color: white;
  box-shadow: 0 14px 30px rgba(255,138,76,.45);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
}

@keyframes chatPop {
  from { opacity: 0; transform: translateY(14px) scale(.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.ea-chat-floating {
  position: fixed;
  left: 22rem;
  bottom: 5.3rem;
  width: 320px;
  background: white;
  border-radius: 1.2rem;
  box-shadow: 0 16px 40px rgba(0,0,0,.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 29;
  animation: chatPop .22s ease-out;
}

/* HEADER CHAT */
.ea-chat-header {
  display: flex;
  gap: .6rem;
  padding: .7rem .85rem;
  border-bottom: 1px solid #eee;
  background: #fff6ee;
}
.ea-chat-header h3 {
  margin: 0;
  font-size: .95rem;
  font-weight: 800;
}
.ea-chat-header p {
  margin: .1rem 0 0;
  font-size: .8rem;
  color: #666;
}
.ea-chat-avatar-wrap {
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 999px;
}
.ea-chat-avatar {
  width: 110%;
}

/* CHIPS PREGUNTAS RÁPIDAS */
.ea-chat-chips {
  display: flex;
  flex-wrap: wrap;
  gap: .35rem;
  padding: .45rem .55rem 0;
}
.ea-chip {
  border-radius: 999px;
  border: none;
  font-size: .75rem;
  padding: .25rem .6rem;
  background: #f3f4ff;
  color: #374151;
  cursor: pointer;
}

/* CUERPO CHAT */
.ea-chat-body {
  padding: .6rem;
  max-height: 230px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: .45rem;
}
.ea-msg-row {
  display: flex;
}
.ea-msg-row.user {
  justify-content: flex-end;
}
.ea-msg-row.bot {
  justify-content: flex-start;
}
.ea-msg-bubble {
  max-width: 75%;
  padding: .5rem .75rem;
  border-radius: 1rem;
  font-size: .86rem;
  line-height: 1.35;
}
.ea-msg-row.user .ea-msg-bubble {
  background: var(--ea-orange);
  color: white;
  border-bottom-right-radius: .3rem;
}
.ea-msg-row.bot .ea-msg-bubble {
  background: #f1f5f9;
  color: #555;
  border-bottom-left-radius: .3rem;
}

/* TYPING INDICATOR */
.ea-typing-bubble {
  background: #f1f5f9;
  color: #555;
  border-radius: 1rem;
  padding: .45rem .7rem;
  font-size: .78rem;
  display: inline-flex;
  align-items: center;
  gap: .15rem;
}
.ea-typing-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: #9ca3af;
  display: inline-block;
}
@keyframes bounceDot {
  0%, 80%, 100% { transform: translateY(0); opacity: .5; }
  40% { transform: translateY(-3px); opacity: 1; }
}
.ea-typing-dot.dot1 { animation: bounceDot 1s infinite .0s; }
.ea-typing-dot.dot2 { animation: bounceDot 1s infinite .15s; }
.ea-typing-dot.dot3 { animation: bounceDot 1s infinite .30s; }

/* INPUT CHAT */
.ea-chat-input {
  padding: .6rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: .4rem;
}
.ea-chat-input input {
  flex: 1;
  padding: .55rem .75rem;
  border-radius: 999px;
  border: 1px solid #ddd;
  font-size: .85rem;
}
.ea-chat-input button {
  background: var(--ea-orange);
  border: none;
  border-radius: 999px;
  width: 36px;
  height: 36px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* MODAL MANUAL */
.ea-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.ea-modal-content {
  width: min(540px, 95%);
  background: white;
  border-radius: 1.2rem;
  padding: 1.3rem;
  box-shadow: 0 16px 40px rgba(0,0,0,.45);
}
.ea-modal-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.ea-modal-body .ea-section {
  margin-bottom: 1.3rem;
}
.ea-modal-body h3 {
  margin: .4rem 0;
}
.ea-icon {
  color: var(--ea-orange);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .ea-wrap {
    padding: 1.2rem;
  }
  .ea-main {
    flex-direction: column-reverse;
  }
  .ea-chat-fab,
  .ea-chat-floating {
    left: 1.2rem;
  }
}
`;
