// src/components/VoiceAssistant.tsx
import React, { useEffect, useRef, useState } from "react";

type SpeechRecognitionType = any;

const VoiceAssistant: React.FC = () => {
  const [supported, setSupported] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);

  // Texto con pausas pensadas para narrador
  const FIXED_ANSWER = `
  ¡Hola! Soy el Dr. Franz. Estoy muy feliz de verte por aquí.
  Aún estoy en desarrollo, pero muy pronto seré tu asistente virtual dentro de IUSAcademy.
  Podré ayudarte a comprender memoriales,
  artículos del Código, simulaciones y todo lo que necesites para tus estudios de Derecho.
  Estoy trabajando para ti, y estaré listo muy pronto.
  `;

  // Referencia a la voz seleccionada (masculina / narrador)
  const maleVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const selectMaleVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;

    const preferredVoices = [
      "Google español (Latinoamérica)",
      "Google español de Estados Unidos",
      "Google español",
      "Microsoft Raul",
      "Microsoft Pablo",
      "Microsoft Jorge",
    ];

    // Intentar coincidir con alguna de las voces que suelen sonar profesionales
    let found =
      voices.find((v) =>
        preferredVoices.some((p) =>
          v.name.toLowerCase().includes(p.toLowerCase())
        )
      ) || null;

    // Si no encuentra, buscar una voz que parezca masculina
    if (!found) {
      found =
        voices.find((v) =>
          /male|hombre|man|masculino/i.test(v.name)
        ) || null;
    }

    // Si aún no hay, escoger alguna voz en español
    if (!found) {
      found = voices.find((v) => v.lang.startsWith("es")) || null;
    }

    // Último recurso: primera voz disponible
    maleVoiceRef.current = found || voices[0] || null;
  };

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SR) {
      setSupported(false);
      return;
    }

    const rec = new SR();
    rec.lang = "es-ES";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onresult = () => {
      setIsListening(false);
      window.speechSynthesis.cancel();
      speak(FIXED_ANSWER);
    };

    rec.onerror = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    // Las voces se cargan asíncronamente
    window.speechSynthesis.onvoiceschanged = selectMaleVoice;
    selectMaleVoice();
  }, []);

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) return;

    const utter = new SpeechSynthesisUtterance(text);

    // Parámetros de narrador profesional
    utter.lang = "es-ES";
    utter.rate = 0.9;   // un poco más lento
    utter.pitch = 0.75; // tono más grave
    utter.volume = 1;   // máximo volumen

    if (maleVoiceRef.current) {
      utter.voice = maleVoiceRef.current;
    }

    window.speechSynthesis.speak(utter);
  };

  const handleClick = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    window.speechSynthesis.cancel(); // corta cualquier narración previa
    recognitionRef.current.start();
    setIsListening(true);
  };

  if (!supported) {
    return (
      <p className="text-xs text-slate-500 mt-2">
        Tu navegador no soporta reconocimiento de voz.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium shadow-sm transition 
          ${
            isListening
              ? "bg-red-500 text-white"
              : "bg-amber-500 text-white hover:bg-amber-600"
          }`}
      >
        {isListening ? "Escuchando..." : "Hablar con el asistente 🎙️"}
      </button>
    </div>
  );
};

export default VoiceAssistant;
