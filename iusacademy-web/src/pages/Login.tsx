// src/pages/Login.tsx
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Si usas mi api.ts; si no, cambia estas funciones por tu fetch:
const API_BASE = (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:4000";

async function loginApi(usernameOrEmail: string, password: string) {
  const r = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ← importante para recibir la cookie httpOnly
    body: JSON.stringify({ usernameOrEmail, password }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error ?? "No se pudo iniciar sesión");
  return data as { message: string; role: "ADMIN" | "DOCENTE" | "ESTUDIANTE" };
}

async function meApi() {
  const r = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
  if (r.status === 401) return null;
  return (await r.json()) as {
    id: string; firstName: string; lastName: string; email: string; username: string; role: "ADMIN" | "DOCENTE" | "ESTUDIANTE";
  };
}

export default function Login() {
  const [showPwd, setShowPwd] = useState(false);
  const [userOrEmail, setUserOrEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!userOrEmail.trim() || !pwd.trim()) {
      setError("Por favor, completa tus credenciales.");
      return;
    }

    setLoading(true);
    try {
      await loginApi(userOrEmail.trim(), pwd);

      if (remember) localStorage.setItem("ius.remember", "1");
      else localStorage.removeItem("ius.remember");

      const me = await meApi();
      if (!me) throw new Error("No se pudo obtener la sesión");

      const path =
        me.role === "ADMIN" ? "/admin" :
        me.role === "DOCENTE" ? "/docente" :
        "/estudiante";

      navigate(path, { replace: true });
    } catch (e: any) {
      setError(e?.message || "Usuario o contraseña inválidos.");
    } finally {
      setLoading(false);
    }
  };

  const continueWithGoogle = () => {
    setError("OAuth de Google aún no está implementado.");
  };

  return (
    <main className="login">
      <section className="login__card" aria-labelledby="login-title">
        <h1 id="login-title" className="login__title">Iniciar sesión</h1>

        <form className="login__form" onSubmit={onSubmit} noValidate>
          <label className="login__label" htmlFor="user">
            Usuario o Email
          </label>
          <input
            id="user"
            type="text"
            className="login__input"
            placeholder="tu.usuario o tu@mail.com"
            value={userOrEmail}
            onChange={(e) => setUserOrEmail(e.target.value)}
            required
            autoComplete="username"
          />

          <label className="login__label" htmlFor="password">
            Contraseña
          </label>
          <div className="login__pwdwrap">
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              className="login__input login__input--pwd"
              placeholder="••••••••"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="login__toggle"
              onClick={() => setShowPwd((s) => !s)}
              aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPwd ? "Ocultar" : "Mostrar"}
            </button>
          </div>

          <label className="login__remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Recordarme</span>
          </label>

          {error && <div className="login__error" role="alert">{error}</div>}

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <div className="login__sep" role="separator" aria-label="o continuar con">
          <span>o continuar con</span>
        </div>

        <button type="button" className="btn btn--google" onClick={continueWithGoogle}>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" className="g-icon">
            <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.6-5.6-5.7S8.9 6 12 6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.8 3.8 14.6 3 12 3 6.9 3 2.7 7.1 2.7 12.3S6.9 21.6 12 21.6c6.9 0 9.3-4.9 9.3-7.4 0-.5 0-.8-.1-1.2H12z"/>
          </svg>
          Continuar con Google
        </button>
      </section>

      {/* ===================== ESTILOS ===================== */}
      <style>
        {`
          :root{
            --bg:#FFF8F5;
            --text:#1E1E1E;
            --sub:#6B6B6B;
            --primary:#FF8A4C;
            --primarySoft:#FFE3D3;
            --accent:#E36C2D;
            --card:#FFFFFF;
            --border:#F3D7C8;
            --shadow:0 12px 30px rgba(0,0,0,.08);
          }

          .login{
            min-height:100vh;
            display:grid;
            place-items:center;
            padding:2rem;
            background:var(--bg);
          }

          .login__card{
            width:100%;
            max-width:26rem;
            background:var(--card);
            border:1px solid var(--border);
            border-radius:1rem;
            padding:2rem;
            box-shadow:var(--shadow);
          }

          .login__title{
            font-size:1.875rem;
            font-weight:800;
            color:var(--text);
            text-align:center;
            margin-bottom:1.25rem;
          }

          .login__form{
            display:flex;
            flex-direction:column;
            gap:.75rem;
          }

          .login__label{
            font-size:.9rem;
            color:var(--text);
            font-weight:600;
          }

          .login__input{
            width:100%;
            border:1px solid #e7e2de;
            background:#fff;
            color:var(--text);
            border-radius:.75rem;
            padding:.9rem 1rem;
            outline:none;
            transition:border .15s, box-shadow .15s;
          }

          .login__input:focus{
            border-color:var(--primary);
            box-shadow:0 0 0 3px rgba(255,138,76,.25);
          }

          .login__pwdwrap{ position:relative; }
          .login__toggle{
            position:absolute; right:.6rem; top:50%; transform:translateY(-50%);
            padding:.35rem .6rem; border-radius:.5rem;
            border:1px solid var(--border); background:var(--primarySoft);
            color:#8a4d2b; font-size:.8rem; font-weight:600; cursor:pointer;
          }
          .login__toggle:hover{ background:#ffd9c5; }

          .login__remember{ display:flex; align-items:center; gap:.5rem; color:var(--sub); user-select:none; margin-top:.25rem; }
          .login__remember input{ width:1rem; height:1rem; }

          .login__error{
            margin-top:.5rem; background:#ffe6e6; border:1px solid #ffc7c7;
            color:#8a1f1f; padding:.75rem 1rem; border-radius:.75rem; font-size:.9rem;
          }

          .btn{
            margin-top:1rem; width:100%; padding:.9rem 1rem; border-radius:.9rem;
            font-weight:700; transition:background .2s, transform .05s, box-shadow .2s;
            cursor:pointer; border:none;
          }
          .btn--primary{ background:var(--primary); color:#fff; box-shadow:0 10px 20px rgba(255,138,76,.22); }
          .btn--primary:hover{ background:var(--accent); }
          .btn--primary:active{ transform:translateY(1px); }

          .login__sep{ display:flex; align-items:center; gap:.75rem; color:var(--sub); font-size:.9rem; margin:1rem 0 .25rem; }
          .login__sep::before,.login__sep::after{ content:""; flex:1; height:1px; background:var(--border); }
          .login__sep > span{ white-space:nowrap; }

          .btn--google{
            background:#fff; color:#1f1f1f; border:1px solid #e8e8e8;
            display:flex; align-items:center; justify-content:center; gap:.6rem; padding:.9rem; border-radius:1rem;
          }
          .btn--google:hover{ background:#f9f9f9; box-shadow:0 10px 20px rgba(0,0,0,.06); }
          .g-icon{ display:block; }
        `}
      </style>
    </main>
  );
}
