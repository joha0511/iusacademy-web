// src/pages/estudiante/EstudiantePerfil.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";

/** ================== Tipos ================== */
type Role = "estudiante" | "docente" | "admin";
type Perfil = {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudadPais: string;
  fechaNac: string;     // YYYY-MM-DD
  genero: "M" | "F" | "";
  role: Role;
  avatarUrl?: string;
};

type PasswordDraft = { actual: string; nueva: string; confirmar: string };

/** ================== Mocks / Utils ================== */
async function mockLoadMe(): Promise<Perfil> {
  return {
    nombre: "Erika",
    apellido: "Claros",
    email: "erika@iusacademy.edu",
    telefono: "+591 70123456",
    direccion: "Av. America 123",
    ciudadPais: "Cochabamba, BO",
    fechaNac: "2002-05-01",
    genero: "F",
    role: "estudiante",
    avatarUrl: "",
  };
}
async function mockUpdateMe(_: Perfil): Promise<void> {
  await new Promise(r => setTimeout(r, 500));
}
async function mockChangePassword(_: { actual: string; nueva: string }): Promise<void> {
  await new Promise(r => setTimeout(r, 500));
}
const fileToDataURL = (f: File) =>
  new Promise<string>((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.onerror = () => rej(fr.error);
    fr.readAsDataURL(f);
  });

/** ================== Componente ================== */
export default function EstudiantePerfil() {
  const initial: Perfil = useMemo(
    () => ({
      nombre: "Cargando...",
      apellido: "",
      email: "",
      telefono: "",
      direccion: "",
      ciudadPais: "",
      fechaNac: "",
      genero: "",
      role: "estudiante",
      avatarUrl: "",
    }),
    []
  );

  const [perfil, setPerfil] = useState<Perfil>(initial);
  const [original, setOriginal] = useState<Perfil>(initial);
  const [pwd, setPwd] = useState<PasswordDraft>({ actual: "", nueva: "", confirmar: "" });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    (async () => {
      const me = await mockLoadMe();
      setPerfil(me);
      setOriginal(me);
      setLoading(false);
    })();
  }, []);

  const dirty = JSON.stringify(perfil) !== JSON.stringify(original);
  const pwdOk = pwd.actual.trim().length >= 4 && pwd.nueva.trim().length >= 6 && pwd.nueva === pwd.confirmar;

  function strengthLabel(pass: string) {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return ["Mínimo", "Básica", "Mejor", "Fuerte", "Muy fuerte"][Math.min(score, 4)];
  }

  async function onSavePerfil(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty) return;
    try {
      setSaving(true);
      await mockUpdateMe(perfil);
      setOriginal(perfil);
      alert("Perfil actualizado ✅");
    } finally {
      setSaving(false);
    }
  }
  function onUndo() {
    setPerfil(original);
  }

  async function onChangePwd(e: React.FormEvent) {
    e.preventDefault();
    if (!pwdOk) return;
    try {
      setSavingPwd(true);
      await mockChangePassword({ actual: pwd.actual, nueva: pwd.nueva });
      setPwd({ actual: "", nueva: "", confirmar: "" });
      alert("Contraseña actualizada ✅");
    } finally {
      setSavingPwd(false);
    }
  }

  async function onPickAvatar(file?: File | null) {
    if (!file) return;
    const dataUrl = await fileToDataURL(file);
    setPerfil(p => ({ ...p, avatarUrl: dataUrl }));
  }

  return (
    <div className="eperfil">
      {/* Todo vive a la IZQUIERDA. No tocamos tu layout externo */}
      <aside className="card-left">
        <div className="profile-shell">
          {/* Columna izquierda: SOLO foto grande + nombre/rol */}
          <div className="mini-nav">
            <div className="userbox column">
              <div className="avatar avatar--xl">
                <div className="avatar__pic">
                  {perfil.avatarUrl ? (
                    <img src={perfil.avatarUrl} alt="Avatar" />
                  ) : (
                    <span className="avatar__placeholder">{(perfil.nombre || "E").charAt(0)}</span>
                  )}
                </div>
                <button
                  className="badge-edit"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Cambiar foto"
                >
                  ✎
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={e => onPickAvatar(e.target.files?.[0])}
                />
              </div>

              <div className="usernames centered">
                <strong>{perfil.nombre} {perfil.apellido}</strong>
                <span className="muted">
                  {perfil.role === "admin" ? "Administrador" : perfil.role === "docente" ? "Docente" : "Estudiante"}
                </span>
              </div>
            </div>
          </div>

          {/* Formulario principal (compacto, sin scroll) */}
          <div className="main-form">
            <header className="sticky-header">
              <h2>Información personal</h2>
              <div className="gender">
                <label className={`chip ${perfil.genero === "M" ? "chip--on" : ""}`}>
                  <input type="radio" name="genero" value="M" checked={perfil.genero === "M"}
                         onChange={() => setPerfil(p => ({ ...p, genero: "M" }))}/>
                  <span>M</span>
                </label>
                <label className={`chip ${perfil.genero === "F" ? "chip--on" : ""}`}>
                  <input type="radio" name="genero" value="F" checked={perfil.genero === "F"}
                         onChange={() => setPerfil(p => ({ ...p, genero: "F" }))}/>
                  <span>F</span>
                </label>
              </div>
            </header>

            <form onSubmit={onSavePerfil} className="form">
              <div className="grid3">
                <div className="field">
                  <label>Nombre</label>
                  <input value={perfil.nombre} disabled={loading}
                         onChange={e => setPerfil(p => ({ ...p, nombre: e.target.value }))}/>
                </div>
                <div className="field">
                  <label>Apellido</label>
                  <input value={perfil.apellido} disabled={loading}
                         onChange={e => setPerfil(p => ({ ...p, apellido: e.target.value }))}/>
                </div>
                <div className="field">
                  <label>Fecha de nacimiento</label>
                  <input type="date" value={perfil.fechaNac} disabled={loading}
                         onChange={e => setPerfil(p => ({ ...p, fechaNac: e.target.value }))}/>
                </div>
              </div>

              <div className="grid3">
                <div className="field span-2">
                  <label>Email</label>
                  <div className="with-addon">
                    <input type="email" value={perfil.email} disabled={loading}
                           onChange={e => setPerfil(p => ({ ...p, email: e.target.value }))}
                           placeholder="nombre@iusacademy.edu"/>
                    <span className="addon success">● Verificado</span>
                  </div>
                </div>
                <div className="field">
                  <label>Teléfono</label>
                  <input value={perfil.telefono} disabled={loading}
                         onChange={e => setPerfil(p => ({ ...p, telefono: e.target.value }))}
                         placeholder="+591 ..."/>
                </div>
              </div>

              <div className="grid3">
                <div className="field span-2">
                  <label>Dirección</label>
                  <input value={perfil.direccion} disabled={loading}
                         onChange={e => setPerfil(p => ({ ...p, direccion: e.target.value }))}
                         placeholder="Calle / Av. y número"/>
                </div>
                <div className="field">
                  <label>Ubicación</label>
                  <input value={perfil.ciudadPais} disabled={loading}
                         onChange={e => setPerfil(p => ({ ...p, ciudadPais: e.target.value }))}
                         placeholder="Ciudad, País"/>
                </div>
              </div>

              <div className="actions">
                <button type="button" className="btn-outlined" onClick={onUndo} disabled={!dirty || saving}>
                  Descartar
                </button>
                <button className="btn-primary" disabled={!dirty || saving}>
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>

            <div className="divider"><span>Login & Password</span></div>

            <form className="form" onSubmit={onChangePwd}>
              <div className="grid3">
                <div className="field">
                  <label>Actual</label>
                  <input type="password" value={pwd.actual}
                         onChange={e => setPwd({ ...pwd, actual: e.target.value })}
                         placeholder="••••••"/>
                </div>
                <div className="field">
                  <label>Nueva</label>
                  <input type="password" value={pwd.nueva}
                         onChange={e => setPwd({ ...pwd, nueva: e.target.value })}
                         placeholder="Mínimo 6 caracteres"/>
                  <div className="strength">{strengthLabel(pwd.nueva)}</div>
                </div>
                <div className="field">
                  <label>Confirmar</label>
                  <input type="password" value={pwd.confirmar}
                         onChange={e => setPwd({ ...pwd, confirmar: e.target.value })}
                         placeholder="Repite la nueva"/>
                </div>
              </div>
              <div className="actions">
                <button className="btn-primary" disabled={!pwdOk || savingPwd}>
                  {savingPwd ? "Confirmando..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </aside>

      {/* Hueco a la derecha para respetar layout */}
      <div className="right-blank" />

      <style>{styles}</style>
    </div>
  );
}

/** ================== ESTILOS ================== */
/** ================== ESTILOS ================== */
const styles = `
:root{
  --white:#ffffff;
  --ink:#3b2f2a;
  --muted:#7b6f69;
  --border:#e6d9cf;
  --brand:#FF8A4C;
  --ring: rgba(255,138,76,.28);       
}

/* ================= CONTENEDOR GENERAL ================= */
.eperfil{
  display:flex;
  gap:.5rem;
  padding:8px 8px 0 0;
  height:95vh;
}
.right-blank{ flex:0 0 8px; }

/* ================= CARD PRINCIPAL ================= */
.card-left{
  flex: 1 1 auto;
  border:1px solid var(--border);
  border-radius:28px;
  box-shadow:0 18px 42px rgba(0,0,0,.06);
  overflow:hidden;
  height:100%;
}

.profile-shell{
  display:grid;
  grid-template-columns: 360px 1fr;
  height:100%;
}
@media(max-width:980px){
  .profile-shell{ grid-template-columns:1fr; }
}

/* ================= COLUMNA IZQUIERDA (FOTO) ================= */
.mini-nav{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:flex-start;
  border-right:1px solid var(--border);
  padding-top:45px;
  padding-bottom:55px;
  gap:18px;
  overflow:hidden;

  /* <<< AQUÍ QUITAMOS EL NARANJA >>> */
  background: transparent !important;
  box-shadow:none !important;
}

/* Esto elimina el cuadro naranja detrás de la foto */
.userbox,
.userbox.column {
  background: transparent !important;
  box-shadow: none !important;
}
.userbox::before,
.userbox.column::before {
  content:none !important;
}

/* Foto */
.avatar--xl{
  width:260px !important;
  height:260px !important;
  position:relative;
  /* Quitar posible fondo heredado */
  background: transparent !important;
  box-shadow: none !important;
}

/* Círculo de la foto (ya sin halo) */
.avatar__pic{
  width:100%;
  height:100%;
  border-radius:999px;
  overflow:hidden;
  background:#fff;
  border:none !important;          /* <<< SIN BORDE */
  box-shadow:0 14px 24px rgba(0,0,0,.10) !important;  /* sombra limpia */
}


.avatar__pic img{
  width:100%;
  height:100%;
  object-fit:cover;
}
.avatar__placeholder{
  font-weight:900;
  font-size:2.7rem;
}

/* Botón editar foto */
.badge-edit{
  position:absolute;
  bottom:14px;
  right:14px;
  background:var(--brand);
  color:#fff;
  border:none;
  border-radius:14px;
  font-size:.95rem;
  padding:.55rem .75rem;
  cursor:pointer;
  box-shadow:0 12px 26px rgba(255,138,76,.38);
}

/* Nombre + rol */
.usernames{
  text-align:center;
}
.usernames strong{
  font-size:1.35rem;
  font-weight:900;
  color:var(--ink);
}
.usernames .muted{
  color:var(--muted);
  font-size:1rem;
}

/* ================= FORMULARIO DERECHA ================= */
.main-form{
  padding:0;
  overflow:hidden;
  display:flex;
  flex-direction:column;
  height:100%;
}

.sticky-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:16px 40px 10px;
  background:#fff;
  border-bottom:1px solid #f3e6de;
}
.sticky-header h2{
  font-size:1.26rem;
  font-weight:900;
  color:var(--ink);
}

/* Género */
.gender{ display:flex; gap:8px; }
.chip{
  display:flex;
  align-items:center;
  border:1px solid var(--border);
  border-radius:999px;
  padding:.35rem .7rem;
  font-weight:800;
  font-size:.9rem;
  color:#524238;
  background:#fff;
  cursor:pointer;
}
.chip--on{
  background:#faf9f7;
  border-color:#ddcfc6;
}

/* Campos */
.form{
  padding:18px 20px 32px;
}
.field{ margin-bottom:.65rem; }
.form label{
  font-weight:900;
  font-size:.92rem;
  color:var(--ink);
  margin-bottom:.32rem;
  display:block;
}
.form input, .form select{
  width:100%;
  height:44px;
  border:1px solid var(--border);
  border-radius:14px;
  padding:0 .9rem;
  background:#fff;
  box-shadow:0 10px 22px rgba(0,0,0,.04);
  transition:border-color .15s, box-shadow .15s;
  font-size:.95rem;
}
.form input:focus, .form select:focus{
  border-color:var(--brand);
  box-shadow:0 0 0 4px var(--ring);
}

/* Grid */
.grid3{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:.85rem;
}
.span-2{ grid-column:span 2; }
@media(max-width:900px){
  .grid3{ grid-template-columns:1fr; }
  .span-2{ grid-column:span 1; }
}

/* Email verificado */
.with-addon{ position:relative; }
.addon{
  position:absolute;
  right:10px;
  top:50%;
  transform:translateY(-50%);
  font-size:.82rem;
  font-weight:900;
  border-radius:999px;
  padding:.25rem .55rem;
  background:#ecf9ef;
  border:1px solid #d7f0db;
  color:#1f8f3a;
}

/* Separador */
.divider{
  margin:0px 20px 0px;
  text-align:center;
  position:relative;
}
.divider::before{
  content:"";
  position:absolute;
  left:0; right:0; top:50%;
  height:1px;
  background:#efe5dd;
}
.divider span{
  position:relative;
  padding:.1rem .7rem;
  background:#fff;
  border-radius:12px;
  font-weight:900;
  color:#6b5a51;
}

/* Botones */
.actions{
  display:flex;
  justify-content:flex-end;
  gap:.8rem;
  margin-top:.8rem;
}
.btn-primary{
  background:var(--brand);
  color:#fff;
  border:none;
  border-radius:14px;
  padding:.65rem 1.2rem;
  font-weight:900;
  cursor:pointer;
  box-shadow:0 12px 26px rgba(255,138,76,.28);
}
.btn-outlined{
  background:#fff;
  color:#4a3a32;
  border:1px solid var(--border);
  border-radius:14px;
  padding:.6rem 1.1rem;
  font-weight:800;
}
.btn-primary:disabled{ opacity:.6; cursor:not-allowed; }

.strength{
  margin-top:.25rem;
  font-size:.8rem;
  font-weight:800;
  color:#6b6b6b;
}
`;
