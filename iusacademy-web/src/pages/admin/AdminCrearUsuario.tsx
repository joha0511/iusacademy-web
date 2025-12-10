// src/pages/admin/AdminCrearUsuario.tsx
import { useEffect, useState } from "react";
import {
  Mail,
  Pencil,
  Trash2,
  Clock,
  UserPlus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/** ========= Config ========= */
const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:4001";

// longitud de la contraseña temporal generada al crear usuario
const TEMP_PASSWORD_LENGTH = 8;

// ⚠️ Fix de zona horaria para el backend WEB (UTC → Bolivia -4h)
const MS_PER_HOUR = 60 * 60 * 1000;
const TZ_FIX_HOURS = 4;

/** ========= Tipos ========= */
type Rol = "admin" | "docente" | "estudiante";
type Materia =
  | "Derecho Procesal Civil"
  | "Derecho Digital Penal"
  | "Derecho Corporativo Digital"
  | "Contratos";

interface Usuario {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  rol: Rol;
  materia: Materia | null;

  mustChangePassword: boolean;
  lastAccessEmailAt: string | null;
  tempPasswordExpiresAt: string | null;
}

/** ========= Helpers materias ========= */
const materiaFromEnum = (value: string | null): Materia | null => {
  if (!value) return null;
  switch (value) {
    case "DERECHO_PROCESAL_CIVIL":
      return "Derecho Procesal Civil";
    case "DERECHO_DIGITAL_PENAL":
      return "Derecho Digital Penal";
    case "DERECHO_CORPORATIVO_DIGITAL":
      return "Derecho Corporativo Digital";
    case "CONTRATOS":
      return "Contratos";
    default:
      return null;
  }
};

const ROLES: { key: Rol; label: string }[] = [
  { key: "admin", label: "Admin" },
  { key: "docente", label: "Docente" },
  { key: "estudiante", label: "Estudiante" },
];

const MATERIAS: Materia[] = [
  "Derecho Procesal Civil",
  "Derecho Digital Penal",
  "Derecho Corporativo Digital",
  "Contratos",
];

// 🔐 Generar contraseña aleatoria (8 caracteres por defecto)
const generatePassword = (length = TEMP_PASSWORD_LENGTH) => {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
};

// ⏱ formatea el tiempo restante
const formatRemaining = (msLeft: number) => {
  if (msLeft <= 0) return "0d 0h";
  const totalSec = Math.floor(msLeft / 1000);
  const days = Math.floor(totalSec / (24 * 3600));
  const hours = Math.floor((totalSec % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}min`;
  return `${minutes}min`;
};

export default function AdminCrearUsuario() {
  /** ====== lista usuarios ====== */
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  /** ====== formulario (panel) ====== */
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [password, setPassword] = useState(""); // generada, no visible

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState<Rol>("docente");
  const [materia, setMateria] = useState<Materia>("Derecho Procesal Civil");

  /** ====== envío acceso ====== */
  const [sendingAccessId, setSendingAccessId] = useState<string | null>(null);

  // para actualizar labels de expiración
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  /** ==========================
   *    Cargar usuarios
   *  ========================== */
  const fetchUsuarios = async () => {
    try {
      setLoadingList(true);
      setErrorList(null);
      const res = await fetch(`${API_BASE}/api/usuarios`);
      const data = await res.json();

      if (!res.ok) {
        console.error("Error fetch usuarios:", data);
        setErrorList(
          data.message || "Ocurrió un error al obtener los usuarios."
        );
        return;
      }

      if (!Array.isArray(data)) {
        console.error("Respuesta inesperada /api/usuarios:", data);
        setErrorList("Formato de respuesta inválido en /api/usuarios.");
        return;
      }

      const parsed: Usuario[] = data.map((u: any) => ({
        id: String(u.id),
        nombre: u.nombre,
        apellidos: u.apellidos,
        correo: u.correo,
        telefono: u.telefono || "",
        rol: (u.rol?.toLowerCase() || "estudiante") as Rol,
        materia: materiaFromEnum(u.materia) ?? null,
        mustChangePassword: !!u.mustChangePassword,
        lastAccessEmailAt: u.lastAccessEmailAt ?? null,
        tempPasswordExpiresAt: u.tempPasswordExpiresAt ?? null,
      }));

      setUsuarios(parsed);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setErrorList("Ocurrió un error al obtener los usuarios.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  /** ==========================
   *    Helpers formulario
   *  ========================== */
  const resetForm = () => {
    setEditingId(null);
    setPassword("");
    setNombre("");
    setApellidos("");
    setCorreo("");
    setTelefono("");
    setRol("docente");
    setMateria("Derecho Procesal Civil");
    setFormError(null);
  };

  // 👉 Botón "Agregar usuario"
  const handleAddMainClick = () => {
    if (panelOpen && !editingId) {
      setPanelOpen(false);
      return;
    }
    resetForm();
    setPassword(generatePassword(TEMP_PASSWORD_LENGTH));
    setPanelOpen(true);
  };

  const openEdit = (u: Usuario) => {
    setEditingId(u.id);
    setPassword("");
    setNombre(u.nombre);
    setApellidos(u.apellidos);
    setCorreo(u.correo);
    setTelefono(u.telefono);
    setRol(u.rol);
    setMateria(u.materia ?? "Derecho Procesal Civil");
    setFormError(null);
    setPanelOpen(true);
  };

  const validar = () => {
    if (!nombre.trim() || !apellidos.trim() || !correo.trim()) {
      setFormError(
        "Nombre, apellidos y correo institucional son obligatorios."
      );
      return false;
    }
    if (!correo.endsWith("@unifranz.edu.bo")) {
      setFormError("El correo debe ser institucional (@unifranz.edu.bo).");
      return false;
    }
    setFormError(null);
    return true;
  };

  /** ==========================
   *   Crear / Actualizar
   *  ========================== */
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validar()) return;

    try {
      setSaving(true);

      const payload: any = {
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim(),
        telefono: telefono.trim(),
        rol,
        materia,
      };

      if (!editingId) {
        payload.password = password.trim();
      }

      const url = editingId
        ? `${API_BASE}/api/usuarios/${editingId}`
        : `${API_BASE}/api/usuarios`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Error guardar usuario:", data);
        setFormError(data.message || "No se pudo guardar el usuario.");
        return;
      }

      const usuarioGuardado: Usuario = {
        id: String(data.id),
        nombre: data.nombre,
        apellidos: data.apellidos,
        correo: data.correo,
        telefono: data.telefono || "",
        rol: (data.rol?.toLowerCase() || "estudiante") as Rol,
        materia: materiaFromEnum(data.materia) ?? null,
        mustChangePassword: !!data.mustChangePassword,
        lastAccessEmailAt: data.lastAccessEmailAt ?? null,
        tempPasswordExpiresAt: data.tempPasswordExpiresAt ?? null,
      };

      if (editingId) {
        setUsuarios((prev) =>
          prev.map((u) => (u.id === editingId ? usuarioGuardado : u))
        );
      } else {
        setUsuarios((prev) => [usuarioGuardado, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error("Error al guardar usuario:", err);
      setFormError("Ocurrió un error al guardar el usuario.");
    } finally {
      setSaving(false);
    }
  };

  const handleEliminar = async (u: Usuario) => {
    if (
      !confirm(
        `¿Seguro que deseas eliminar a "${u.nombre} ${u.apellidos}" (${u.correo})?`
      )
    )
      return;

    try {
      const res = await fetch(`${API_BASE}/api/usuarios/${u.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Error eliminar usuario:", data);
        alert(data.message || "No se pudo eliminar el usuario.");
        return;
      }

      setUsuarios((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      console.error("Error al eliminar usuario:", err);
      alert("Ocurrió un error al eliminar el usuario.");
    }
  };

  /** ==========================
   *   Enviar acceso por correo
   *  ========================== */
  const handleEnviarAcceso = async (user: Usuario) => {
    try {
      setSendingAccessId(user.id);

      const res = await fetch(
        `${API_BASE}/api/usuarios/${user.id}/enviar-acceso`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Error enviar acceso:", data);
        alert(
          data.message || "No se pudo enviar el correo de acceso temporal."
        );
        return;
      }

      alert(
        `Se envió un correo a ${user.correo} con la contraseña temporal y enlaces de acceso.`
      );

      await fetchUsuarios();
    } catch (err) {
      console.error("Error al enviar acceso:", err);
      alert("Ocurrió un problema al enviar el correo de acceso.");
    } finally {
      setSendingAccessId(null);
    }
  };

  /** ==========================
   *   Estilos badge rol
   *  ========================== */
  const badgeStylesForRole = (r: Rol) => {
    switch (r) {
      case "admin":
        return { bg: "#FFF0F0", text: "#C44242" };
      case "docente":
        return { bg: "#FFF4E6", text: "#E36C2D" };
      case "estudiante":
        return { bg: "#EAF7FF", text: "#245B8F" };
      default:
        return { bg: "#EEE", text: "#111827" };
    }
  };

  /** ==========================
   *   Filtro búsqueda
   *  ========================== */
  const filteredUsuarios = usuarios.filter((u) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      u.nombre.toLowerCase().includes(q) ||
      u.apellidos.toLowerCase().includes(q) ||
      u.correo.toLowerCase().includes(q) ||
      u.telefono.toLowerCase().includes(q)
    );
  });

  return (
    <main className="au-page">
      {/* HEADER CON CARD BLANCA + BOTÓN ADENTRO */}
      <header className="au-header">
        <div className="au-header-card">
          <div className="au-header-top">
            <div>
              <h1 className="au-title">Usuarios</h1>
              <p className="au-sub">
                Gestión unificada de administradores, docentes y estudiantes.
              </p>
            </div>

            <button className="au-add-main" onClick={handleAddMainClick}>
              <UserPlus size={18} />
              <span>Agregar usuario</span>
            </button>
          </div>
        </div>
      </header>

      {/* PANEL FORMULARIO */}
      <section className={`au-panel ${panelOpen ? "open" : ""}`}>
        <button
          type="button"
          className="au-panel-toggle"
          onClick={() => setPanelOpen((v) => !v)}
        >
          <span>{editingId ? "Editar usuario" : "Nuevo usuario"}</span>
          {panelOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {panelOpen && (
          <form className="au-form" onSubmit={handleGuardar} noValidate>
            <div className="au-form-grid">
              <label className="au-label">
                Correo institucional
                <input
                  type="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="nombre.apellido@unifranz.edu.bo"
                />
              </label>

              <label className="au-label">
                Nombre
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre"
                />
              </label>

              <label className="au-label">
                Apellidos
                <input
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Apellidos completos"
                />
              </label>

              <label className="au-label">
                Teléfono
                <input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+591 ..."
                />
              </label>

              {/* ROL */}
              <div className="au-label au-label-full">
                <span>Rol</span>
                <div className="au-chips">
                  {ROLES.map((r) => (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => setRol(r.key)}
                      className={`au-chip ${rol === r.key ? "active" : ""}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* MATERIA solo si no es admin */}
              {rol !== "admin" && (
                <div className="au-label au-label-full">
                  <span>Materia</span>
                  <div className="au-mat-box">
                    {MATERIAS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMateria(m)}
                        className={`au-mat-item ${
                          materia === m ? "active" : ""
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {formError && (
              <div className="au-alert au-alert-err">{formError}</div>
            )}

            <div className="au-form-actions">
              {editingId && (
                <button
                  type="button"
                  className="au-btn-secondary"
                  onClick={resetForm}
                >
                  Cancelar edición
                </button>
              )}
              <button
                type="submit"
                className="au-btn-primary"
                disabled={saving}
              >
                {saving
                  ? "Guardando…"
                  : editingId
                  ? "Actualizar usuario"
                  : "Crear usuario"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* CARD SOLO PARA TÍTULO + FILTRO */}
      <section className="au-reg-card">
        <div className="au-reg-header">
          <div>
            <h2 className="au-list-title">Usuarios registrados</h2>
            <p className="au-list-sub">
              Visualiza y gestiona todas las cuentas activas.
            </p>
          </div>
          <span className="au-pill-count">
            {usuarios.length} usuario{usuarios.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="au-search au-search-inline">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M21 20l-4.5-4.5M5 11a6 6 0 1112 0 6 6 0 01-12 0z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, correo o teléfono…"
          />
        </div>
      </section>

      {/* SECCIÓN TABLA */}
      <section className="au-table-section">
        {loadingList && (
          <div className="au-empty au-empty-inner">
            <div className="au-spinner" />
            <p>Cargando usuarios…</p>
          </div>
        )}

        {!loadingList && errorList && (
          <div className="au-empty au-empty-error au-empty-inner">
            <p>{errorList}</p>
          </div>
        )}

        {!loadingList && !errorList && filteredUsuarios.length === 0 && (
          <div className="au-empty au-empty-inner">
            <p>
              No hay usuarios que coincidan con{" "}
              <strong>{search || "el criterio actual"}</strong>.
            </p>
            {!usuarios.length && (
              <p className="au-empty-hint">
                Pulsa <strong>“Agregar usuario”</strong> para crear el primero.
              </p>
            )}
          </div>
        )}

        {!loadingList && !errorList && filteredUsuarios.length > 0 && (
          <div className="au-table-wrapper">
            <table className="au-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Materia</th>
                  <th>Acceso</th>
                  <th style={{ width: "1%" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.map((item) => {
                  const roleStyles = badgeStylesForRole(item.rol);
                  const isSending = sendingAccessId === item.id;

                  const expiryTs = item.tempPasswordExpiresAt
                    ? new Date(item.tempPasswordExpiresAt).getTime()
                    : null;

                  const hasActiveTemp =
                    item.mustChangePassword &&
                    expiryTs !== null &&
                    expiryTs > now;

                  const neverSentAccess = !item.lastAccessEmailAt;
                  const alreadyUsedTemp =
                    !!item.lastAccessEmailAt && !item.mustChangePassword;

                  let canResend = false;
                  let accessLabel = "Acceso";
                  let remainingLabel: string | null = null;

                  if (neverSentAccess) {
                    canResend = true;
                    accessLabel = "Acceso";
                  } else if (alreadyUsedTemp) {
                    canResend = false;
                    accessLabel = "Usado";
                  } else if (hasActiveTemp) {
                    canResend = false;
                    accessLabel = "En espera";

                    if (expiryTs) {
                      const rawMsLeft = expiryTs - now;
                      // ✅ Ajuste +4h porque el backend WEB está adelantado 4h
                      const fixedMsLeft =
                        rawMsLeft + TZ_FIX_HOURS * MS_PER_HOUR;
                      remainingLabel = formatRemaining(fixedMsLeft);
                    }
                  } else {
                    canResend = true;
                    accessLabel = "Reenviar";
                  }

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="au-user-cell">
                          <div className="au-avatar">
                            <span>
                              {item.nombre.charAt(0)}
                              {item.apellidos.charAt(0)}
                            </span>
                          </div>
                          <div className="au-user-text">
                            <span className="au-name">
                              {item.nombre} {item.apellidos}
                            </span>
                            {item.telefono && (
                              <span className="au-phone">
                                {item.telefono}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="au-email">{item.correo}</span>
                      </td>
                      <td>
                        <span
                          className="au-role-badge"
                          style={{
                            backgroundColor: roleStyles.bg,
                            color: roleStyles.text,
                          }}
                        >
                          {item.rol.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {item.rol !== "admin" && item.materia ? (
                          <span className="au-materia">{item.materia}</span>
                        ) : (
                          <span className="au-materia au-materia-muted">
                            —
                          </span>
                        )}
                      </td>
                      <td className="au-cell-access">
                        <button
                          className="au-btn au-btn-access"
                          onClick={() => handleEnviarAcceso(item)}
                          disabled={isSending || !canResend}
                          style={
                            !canResend || isSending
                              ? { opacity: 0.55 }
                              : undefined
                          }
                        >
                          {isSending ? (
                            <span className="au-spinner-sm" />
                          ) : (
                            <Mail size={16} />
                          )}
                          <span>{isSending ? "Enviando…" : accessLabel}</span>
                        </button>
                        {remainingLabel && (
                          <div className="au-expire-inline">
                            <Clock size={14} />
                            <span>Expira en {remainingLabel}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="au-actions">
                          <button
                            className="au-btn au-btn-edit"
                            onClick={() => openEdit(item)}
                          >
                            <Pencil size={16} />
                            <span>Editar</span>
                          </button>

                          <button
                            className="au-btn au-btn-del"
                            onClick={() => handleEliminar(item)}
                          >
                            <Trash2 size={16} />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style>{styles}</style>
    </main>
  );
}

/* =============== STYLES =============== */
const styles = `
:root{
  --au-text:#1E1E1E;
  --au-sub:#6B6B6B;
  --au-primary:#FF8A4C;
  --au-primary-dark:#E36C2D;
  --au-border:#F3D0C6;
  --au-soft:#FFF3E9;
  --au-error:#B91C1C;
}

.au-page{
  background:transparent;
  padding:2.5rem 1.75rem 1.75rem 1.75rem;
}

/* HEADER */
.au-header{
  margin-bottom:1.5rem;
}
.au-header-card{
  background:#fff;
  border-radius:1.2rem;
  border:1px solid var(--au-border);
  padding:1rem 1.3rem;
  box-shadow:0 14px 34px rgba(0,0,0,.06);
}
.au-header-top{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:1rem;
}
.au-title{
  margin:0;
  font-size:1.8rem;
  font-weight:900;
  color:var(--au-text);
}
.au-sub{
  margin:.25rem 0 0;
  font-size:.95rem;
  color:var(--au-sub);
}
.au-add-main{
  display:inline-flex;
  align-items:center;
  gap:.5rem;
  background:var(--au-primary);
  color:#fff;
  border:none;
  padding:.7rem 1.2rem;
  border-radius:999px;
  font-weight:800;
  cursor:pointer;
  box-shadow:0 14px 30px rgba(255,138,76,.25);
  white-space:nowrap;
}
.au-add-main:hover{ background:var(--au-primary-dark); }

/* PANEL FORM */
.au-panel{
  background:#fff;
  border-radius:1.1rem;
  border:1px solid var(--au-border);
  box-shadow:0 12px 30px rgba(0,0,0,.06);
  margin-bottom:1.5rem;
  overflow:hidden;
}
.au-panel-toggle{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:.75rem 1.1rem;
  border:none;
  background:linear-gradient(to right,#FFF7F1,#FFEADF);
  font-weight:800;
  font-size:.95rem;
  cursor:pointer;
  color:var(--au-text);
}
.au-form{
  padding:1rem 1.1rem 1.1rem;
  display:flex;
  flex-direction:column;
  gap:.75rem;
}
.au-form-grid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:.75rem 1rem;
}
.au-label{
  font-size:.82rem;
  color:var(--au-sub);
  display:flex;
  flex-direction:column;
  gap:.25rem;
}
.au-label-full{
  grid-column:1 / -1;
}
.au-label input{
  border-radius:.9rem;
  border:1px solid var(--au-border);
  padding:.65rem .85rem;
  font-size:.9rem;
  outline:none;
}
.au-label input:focus{
  border-color:var(--au-primary);
  box-shadow:0 0 0 2px rgba(255,138,76,.25);
}

/* Chips rol */
.au-chips{
  display:flex;
  flex-wrap:wrap;
  gap:.4rem;
  margin-top:.25rem;
}
.au-chip{
  border-radius:999px;
  border:1px solid var(--au-border);
  padding:.3rem .8rem;
  background:#fff;
  font-size:.8rem;
  cursor:pointer;
}
.au-chip.active{
  background:#FFEADF;
  border-color:#FFC19A;
  color:var(--au-primary-dark);
  font-weight:700;
}

/* Materias */
.au-mat-box{
  border-radius:.9rem;
  border:1px solid var(--au-border);
  background:#FFF9F4;
  padding:.25rem 0;
  display:flex;
  flex-direction:column;
}
.au-mat-item{
  padding:.4rem .9rem;
  border:none;
  background:transparent;
  text-align:left;
  font-size:.85rem;
  cursor:pointer;
}
.au-mat-item.active{
  background:#FFEADF;
  font-weight:700;
  color:var(--au-primary-dark);
}

/* Alert */
.au-alert{
  border-radius:.7rem;
  padding:.55rem .8rem;
  font-size:.8rem;
}
.au-alert-err{
  background:#FFE6E6;
  border:1px solid #FFC7C7;
  color:#991B1B;
}

/* Form buttons */
.au-form-actions{
  margin-top:.4rem;
  display:flex;
  justify-content:flex-end;
  gap:.5rem;
}
.au-btn-primary,
.au-btn-secondary{
  padding:.55rem 1.1rem;
  border-radius:.9rem;
  border:none;
  cursor:pointer;
  font-size:.86rem;
  font-weight:800;
}
.au-btn-primary{
  background:var(--au-primary-dark);
  color:#fff;
}
.au-btn-primary:disabled{
  opacity:.7;
  cursor:not-allowed;
}
.au-btn-secondary{
  background:#FFF0E4;
  color:var(--au-primary-dark);
}

/* CARD REGISTRO USUARIOS (solo título + filtro) */
.au-reg-card{
  background:#fff;
  border-radius:1.1rem;
  border:1px solid var(--au-border);
  box-shadow:0 10px 25px rgba(0,0,0,.05);
  padding:1.1rem 1.2rem 1.2rem;
  display:flex;
  flex-direction:column;
  gap:.9rem;
}
.au-reg-header{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:1rem;
}
.au-list-title{
  font-size:1rem;
  font-weight:800;
  margin:0;
  color:var(--au-text);
}
.au-list-sub{
  margin:.15rem 0 0;
  font-size:.85rem;
  color:var(--au-sub);
}
.au-pill-count{
  padding:.25rem .7rem;
  border-radius:999px;
  background:#FFF3E9;
  border:1px solid var(--au-border);
  font-size:.8rem;
  font-weight:700;
  color:var(--au-primary-dark);
}

/* SEARCH */
.au-search{
  max-width:420px;
  display:flex;
  align-items:center;
  gap:.5rem;
  padding:.55rem .9rem;
  border-radius:.9rem;
  background:#fff;
  border:1px solid var(--au-border);
  box-shadow:0 10px 22px rgba(0,0,0,.04);
}
.au-search-inline{
  max-width:none;
}
.au-search input{
  border:none;
  outline:none;
  flex:1;
  font-size:.9rem;
}

/* SECCIÓN TABLA */
.au-table-section{
  margin-top:.7rem;
}

/* EMPTY */
.au-empty{
  background:var(--au-soft);
  border-radius:1.1rem;
  padding:1.25rem 1.1rem;
  border:1px solid var(--au-border);
  color:var(--au-sub);
  font-size:.9rem;
}
.au-empty-inner{
  margin-top:.1rem;
}
.au-empty p{ margin:.1rem 0; }
.au-empty-hint{ font-size:.85rem; }
.au-empty-error{
  background:#FFE6E6;
  border-color:#FFC7C7;
  color:var(--au-error);
}

/* Spinner */
.au-spinner,
.au-spinner-sm{
  border-radius:999px;
  border:2px solid rgba(249,115,22,.3);
  border-top-color:var(--au-primary-dark);
  animation:au-spin .8s linear infinite;
}
.au-spinner{
  width:22px;
  height:22px;
}
.au-spinner-sm{
  width:14px;
  height:14px;
}
@keyframes au-spin{
  to{ transform:rotate(360deg); }
}

/* TABLA */
.au-table-wrapper{
  border-radius:.9rem;
  border:1px solid #F5D8CB;
  overflow:hidden;
}
.au-table{
  width:100%;
  border-collapse:collapse;
  font-size:.86rem;
  background:#fff;
}
.au-table thead{
  background:linear-gradient(to right,#FFF7F1,#FFEADF);
}
.au-table th,
.au-table td{
  padding:.6rem .75rem;
  text-align:left;
  border-bottom:1px solid #F7E0D4;
}
.au-table th{
  font-weight:700;
  font-size:.78rem;
  letter-spacing:.02em;
  text-transform:uppercase;
  color:#7C7C7C;
}
.au-table tbody tr:last-child td{
  border-bottom:none;
}
.au-table tbody tr:hover{
  background:#FFF9F4;
}

/* Celda usuario */
.au-user-cell{
  display:flex;
  align-items:center;
  gap:.5rem;
}
.au-avatar{
  width:36px;
  height:36px;
  border-radius:999px;
  background:#FFF3E9;
  border:1px solid var(--au-border);
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:800;
  color:var(--au-primary-dark);
  flex-shrink:0;
}
.au-user-text{
  display:flex;
  flex-direction:column;
}
.au-name{
  margin:0;
  font-weight:800;
  color:var(--au-text);
}
.au-phone{
  font-size:.75rem;
  color:var(--au-sub);
}
.au-email{
  font-size:.8rem;
  color:var(--au-sub);
  word-break:break-all;
}

/* Rol & materia */
.au-role-badge{
  padding:.15rem .6rem;
  border-radius:999px;
  font-size:.72rem;
  font-weight:800;
}
.au-materia{
  font-size:.8rem;
  color:var(--au-sub);
}
.au-materia-muted{
  color:#D1D5DB;
}

/* Acceso & acciones */
.au-cell-access{
  display:flex;
  flex-direction:column;
  gap:.25rem;
}
.au-actions{
  display:flex;
  gap:.45rem;
  justify-content:flex-end;
}
.au-btn{
  display:inline-flex;
  align-items:center;
  gap:.3rem;
  padding:.35rem .7rem;
  border-radius:999px;
  font-size:.78rem;
  font-weight:700;
  border:1px solid transparent;
  background:#FFF;
  cursor:pointer;
  white-space:nowrap;
}
.au-btn svg{ width:16px; height:16px; }
.au-btn-access{
  background:#E8F3FF;
  color:#245B8F;
  border-color:#C7E2FF;
}
.au-btn-edit{
  background:#FFF4E6;
  color:var(--au-primary-dark);
  border-color:#FBD4B4;
}
.au-btn-del{
  background:#FFF1F1;
  color:#C44242;
  border-color:#F3C8C8;
}
.au-btn:disabled{
  cursor:not-allowed;
}

/* Expiración inline */
.au-expire-inline{
  display:flex;
  align-items:center;
  gap:.3rem;
  font-size:.72rem;
  color:#6B7280;
}

/* Responsive */
@media(max-width:960px){
  .au-header-top{
    flex-direction:column;
    align-items:flex-start;
  }
  .au-add-main{
    align-self:stretch;
    justify-content:center;
  }
  .au-form-grid{
    grid-template-columns:1fr;
  }
  .au-table-wrapper{
    border-radius:.7rem;
    overflow-x:auto;
  }
  .au-table{
    min-width:720px;
  }
}

@media(max-width:860px){
  .au-page{ padding:1.6rem 1rem 1.5rem; }
}
` as const;
