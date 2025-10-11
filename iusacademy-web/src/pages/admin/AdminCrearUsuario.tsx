import { useEffect, useMemo, useState } from "react";

/** ========= Config ========= */
const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:4000";

type Role = "admin" | "docente" | "estudiante";
type RoleApi = "ADMIN" | "DOCENTE" | "ESTUDIANTE";

/** ========= Tipos ========= */
interface NewUser {
  name: string;
  lastname: string;
  email: string;
  username: string;
  password: string;
  role: Role;
}

interface UserRow {
  id: string;
  name: string;
  lastname: string;
  email: string;
  username: string;
  role: Role;
}

/** ========= Helpers API ========= */
async function apiCreateUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  role: RoleApi;
}) {
  const r = await fetch(`${API_BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error ?? "No se pudo crear el usuario");
  return data;
}

async function apiListUsers(params: { q?: string; page?: number; pageSize?: number }) {
  const usp = new URLSearchParams();
  if (params.q) usp.set("q", params.q);
  if (params.page) usp.set("page", String(params.page));
  if (params.pageSize) usp.set("pageSize", String(params.pageSize));
  const r = await fetch(`${API_BASE}/api/users?${usp.toString()}`);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error ?? "No se pudo listar usuarios");
  return data as {
    items: Array<{
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      username: string;
      role: RoleApi;
      createdAt: string;
      updatedAt: string;
    }>;
    total: number;
    page: number;
    pageSize: number;
  };
}

async function apiUpdateUser(input: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: RoleApi;
  password?: string;
}) {
  const r = await fetch(`${API_BASE}/api/users/${input.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error ?? "No se pudo actualizar");
  return data as {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: RoleApi;
  };
}

async function apiDeleteUser(id: string) {
  const r = await fetch(`${API_BASE}/api/users/${id}`, { method: "DELETE" });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data?.error ?? "No se pudo eliminar");
  return data;
}

/** ========= Componente ========= */
export default function AdminCrearUsuario() {
  // ---------- Estado ----------
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);

  const [open, setOpen] = useState(false); // despliegue form
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // form + edición
  const emptyForm: NewUser = {
    name: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    role: "docente",
  };
  const [form, setForm] = useState<NewUser>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  // filtros + paginación (del lado servidor)
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // ---------- Carga desde backend ----------
  useEffect(() => {
    let on = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await apiListUsers({ q: query.trim(), page, pageSize });
        if (!on) return;
        const rows: UserRow[] = data.items.map((u) => ({
          id: u.id,
          name: u.firstName,
          lastname: u.lastName,
          email: u.email,
          username: u.username,
          role: u.role.toLowerCase() as Role,
        }));
        setUsers(rows);
        setTotal(data.total);
      } catch (e: any) {
        if (!on) return;
        setErr(e.message || "Error al cargar usuarios");
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [query, page, pageSize]);

  // ---------- Handlers ----------
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
    setErr(null);
    setMsg(null);
  };

  const startEdit = (u: UserRow) => {
    setEditingId(u.id);
    setForm({
      name: u.name,
      lastname: u.lastname,
      email: u.email,
      username: u.username,
      password: "",
      role: u.role,
    });
    setOpen(true);
    setErr(null);
    setMsg(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!form.name || !form.lastname || !form.email || !form.username || (!editingId && !form.password)) {
      setErr("Completa todos los campos requeridos.");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        const updated = await apiUpdateUser({
          id: editingId,
          firstName: form.name,
          lastName: form.lastname,
          email: form.email,
          username: form.username,
          role: form.role.toUpperCase() as RoleApi,
          // password: form.password || undefined, // si quieres permitir cambiar password en edición
        });

        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingId
              ? {
                  id: updated.id,
                  name: updated.firstName,
                  lastname: updated.lastName,
                  email: updated.email,
                  username: updated.username,
                  role: (updated.role as string).toLowerCase() as Role,
                }
              : u
          )
        );
        setMsg("Usuario actualizado.");
      } else {
        const created = await apiCreateUser({
          firstName: form.name,
          lastName: form.lastname,
          email: form.email,
          username: form.username,
          password: form.password,
          role: form.role.toUpperCase() as RoleApi,
        });

        const newRow: UserRow = {
          id: created.id,
          name: created.firstName,
          lastname: created.lastName,
          email: created.email,
          username: created.username,
          role: (created.role as string).toLowerCase() as Role,
        };
        setUsers((prev) => [newRow, ...prev]);
        setTotal((t) => t + 1);
        setMsg("Usuario creado con éxito.");
      }

      setForm(emptyForm);
      setEditingId(null);
      setPage(1);
    } catch (e: any) {
      setErr(e?.message || "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (id: string) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    if (!confirm(`¿Eliminar al usuario "${u.name} ${u.lastname}" (@${u.username})?`)) return;

    setLoading(true);
    setErr(null);
    setMsg(null);
    try {
      await apiDeleteUser(id);
      setUsers((prev) => prev.filter((x) => x.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      setMsg("Usuario eliminado.");
    } catch (e: any) {
      setErr(e?.message || "No se pudo eliminar");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Paginación (server) + filtro local visual ----------
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);

  // (solo para resaltar búsqueda en UI; los datos ya vienen del server filtrados)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.name, u.lastname, u.email, u.username].some((f) => f.toLowerCase().includes(q))
    );
  }, [users, query]);

  // ---------- UI ----------
  return (
    <main className="page">
      {/* Título + botón nuevo */}
      <header className="hdr">
        <div className="ttl-wrap">
          <h1 className="ttl">Usuarios</h1>
          <p className="sub">Gestiona y administra los usuarios del sistema.</p>
        </div>

        <button className="btn-cta" onClick={startCreate}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <span>Nuevo usuario</span>
        </button>
      </header>

      {/* Formulario colapsable */}
      <section className={`panel ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="panel__inner">
          <div className="panel__hdr">
            <h2 className="panel__ttl">{editingId ? "Editar usuario" : "Crear usuario"}</h2>
            <button className="iconbtn" onClick={() => setOpen((s) => !s)} aria-label="Cerrar panel" title="Cerrar">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <form className="form" onSubmit={submit}>
            <div className="grid">
              <div className="col">
                <label>Nombres</label>
                <input name="name" value={form.name} onChange={onChange} placeholder="María" required />
              </div>
              <div className="col">
                <label>Apellidos</label>
                <input name="lastname" value={form.lastname} onChange={onChange} placeholder="Pérez" required />
              </div>
              <div className="col">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={onChange} placeholder="maria@mail.com" required />
              </div>
              <div className="col">
                <label>Usuario</label>
                <input name="username" value={form.username} onChange={onChange} placeholder="maria.perez" required />
              </div>
              {!editingId && (
                <div className="col">
                  <label>Contraseña</label>
                  <input type="password" name="password" value={form.password} onChange={onChange} placeholder="••••••••" required />
                </div>
              )}
              <div className="col">
                <label>Rol</label>
                <select name="role" value={form.role} onChange={onChange}>
                  <option value="admin">Administrador</option>
                  <option value="docente">Docente</option>
                  <option value="estudiante">Estudiante</option>
                </select>
              </div>
            </div>

            {err && <div className="alert err">{err}</div>}
            {msg && <div className="alert ok">{msg}</div>}

            <div className="actions">
              <button className="btn-primary" disabled={loading}>
                {loading ? "Guardando…" : editingId ? "Actualizar usuario" : "Crear usuario"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-soft"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Barra de controles de tabla (filtro arriba) */}
      <section className="table-controls">
        <div className="search">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <path d="M21 20l-5.6-5.6a7 7 0 10-1.4 1.4L20 21l1-1zM5 10a5 5 0 1110 0A5 5 0 015 10z" fill="currentColor" />
          </svg>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre, apellido, email o usuario…"
          />
        </div>

        <div className="page-size">
          <span>Ver</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
          <span>por página</span>
        </div>
      </section>

      {/* Tabla */}
      <div className="card table">
        <div className="thead">
          <span>Nombre</span>
          <span>Apellido</span>
          <span>Email</span>
          <span>Usuario</span>
          <span>Rol</span>
          <span className="center">Acciones</span>
        </div>

        {filtered.map((u) => (
          <div className="tr" key={u.id}>
            <span>{u.name}</span>
            <span>{u.lastname}</span>
            <span>{u.email}</span>
            <span>@{u.username}</span>
            <span className={`role ${u.role}`}>{u.role}</span>
            <span className="actions-cell">
              <button className="iconbtn edit" title="Editar" onClick={() => startEdit(u)}>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
                  <path d="M20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
              </button>
              <button className="iconbtn del" title="Eliminar" onClick={() => removeUser(u.id)}>
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z" />
                </svg>
              </button>
            </span>
          </div>
        ))}

        {filtered.length === 0 && <div className="empty">No hay resultados para “{query}”.</div>}
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button className="pg-btn" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          « Anterior
        </button>

        <div className="pg-pages">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button key={n} className={`pg-num ${n === currentPage ? "active" : ""}`} onClick={() => setPage(n)}>
              {n}
            </button>
          ))}
        </div>

        <button className="pg-btn" disabled={currentPage >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>
          Siguiente »
        </button>
      </div>

      {/* ====== ESTILOS ====== */}
      <style>{`
        :root{
          --bg:#FFF8F5; --text:#1E1E1E; --sub:#6B6B6B;
          --primary:#FF8A4C; --accent:#E36C2D;
          --border:#F3D7C8; --soft:#FFE3D3; --white:#fff;
          --ok:#12a150; --okbg:#e6faef; --okbr:#bfead1;
          --err:#8a1f1f; --errbg:#ffe6e6; --errbr:#ffc7c7;
          --card-shadow: 0 24px 60px rgba(0,0,0,.06);
        }
        .page{ padding:1rem; }

        /* Título */
        .hdr{ display:flex; align-items:end; justify-content:space-between; gap:1rem; margin-bottom:.75rem; }
        .ttl-wrap{ display:flex; flex-direction:column; gap:.2rem; }
        .ttl{ font-size:1.7rem; font-weight:900; line-height:1; }
        .sub{ color:#8a8a8a; font-size:.95rem; }

        .btn-cta{
          display:inline-flex; align-items:center; gap:.5rem;
          background:var(--primary); color:#fff; font-weight:900;
          border:none; border-radius:.8rem; padding:.65rem 1rem; cursor:pointer;
          box-shadow:0 10px 20px rgba(255,138,76,.25);
        }
        .btn-cta:hover{ background:var(--accent); }

        /* Panel colapsable (form) */
        .panel{
          border:1px solid var(--border); background:#fff; border-radius:1rem;
          overflow:hidden; max-height:0; transition:max-height .35s ease, box-shadow .2s; box-shadow:0 0 0 rgba(0,0,0,0);
          margin-bottom:1rem;
        }
        .panel.open{ max-height:860px; box-shadow:var(--card-shadow); }
        .panel__inner{ padding:1rem; }
        .panel__hdr{ display:flex; align-items:center; justify-content:space-between; }
        .panel__ttl{ font-weight:800; margin:0 0 .75rem; }
        .iconbtn{ border:1px solid var(--border); background:#fff; border-radius:.6rem; padding:.4rem; cursor:pointer; color:#6b6b6b; }
        .iconbtn:hover{ background:#fff5ef; }

        /* Formulario */
        .form{ display:block; }
        .grid{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:1rem; }
        @media(max-width:900px){ .grid{ grid-template-columns: 1fr; } }
        label{ font-size:.9rem; font-weight:700; display:block; margin-bottom:.25rem; }
        input, select{
          width:100%; padding:.9rem 1rem; border-radius:.9rem;
          border:1px solid #eadcd4; outline:none; background:#fff;
        }
        input:focus, select:focus{ border-color:var(--primary); box-shadow:0 0 0 3px rgba(255,138,76,.22); }
        .actions{ margin-top:1rem; display:flex; gap:.6rem; }
        .btn-primary{
          background:var(--primary); color:#fff; font-weight:900; border:none;
          padding:.9rem 1.1rem; border-radius:.9rem; cursor:pointer;
          box-shadow:0 10px 20px rgba(255,138,76,.22);
        }
        .btn-primary:hover{ background:var(--accent); }
        .btn-soft{ background:#fff; color:#573b2d; border:1px solid var(--border); padding:.9rem 1.1rem; border-radius:.9rem; cursor:pointer; }
        .btn-soft:hover{ background:#fff6ef; }

        .alert{ margin-top:.6rem; padding:.65rem .9rem; border-radius:.7rem; }
        .ok{ color:var(--ok); background:var(--okbg); border:1px solid var(--okbr); }
        .err{ color:var(--err); background:var(--errbg); border:1px solid var(--errbr); }

        /* Controles de tabla (buscar + page-size) */
        .table-controls{
          display:flex; align-items:center; justify-content:space-between; gap:.75rem;
          margin: .2rem 0 .6rem;
        }
        .search{
          flex:1; display:flex; align-items:center; gap:.6rem;
          background:#fff; border:1px solid var(--border); border-radius:.9rem;
          padding:.55rem .8rem; box-shadow: var(--card-shadow);
        }
        .search input{ border:none; outline:none; width:100%; min-width:180px; }
        .page-size{ display:flex; align-items:center; gap:.45rem; color:#5b5b5b; }
        .page-size select{ padding:.45rem .6rem; border-radius:.6rem; border:1px solid var(--border); background:#fff; }

        /* Tarjeta tabla */
        .card{
          background:#fff; border:1px solid var(--border); border-radius:1rem;
          box-shadow:var(--card-shadow); overflow:hidden;
        }
        .thead, .tr{
          display:grid; grid-template-columns: 1.2fr 1.2fr 1.8fr 1.2fr .9fr 1fr;
          gap:.5rem; padding:.85rem 1rem; align-items:center;
        }
        .thead{ background:#FFF2EA; font-weight:800; }
        .tr{ border-top:1px solid #f5e5dc; }
        .center{ text-align:center; }
        .empty{ padding:1rem; text-align:center; color:#7a7a7a; }

        .actions-cell{ display:flex; gap:.4rem; justify-content:center; }
        .iconbtn.edit{ color:#1b4a7a; border-color:#cfe3f7; }
        .iconbtn.edit:hover{ background:#eef6ff; }
        .iconbtn.del{ color:#a12828; border-color:#f3c8c8; }
        .iconbtn.del:hover{ background:#ffecec; }

        .role{
          text-transform:capitalize; font-weight:800; padding:.28rem .65rem; border-radius:999px; display:inline-block; text-align:center;
        }
        .role.admin{ background:#FFE3D3; color:#8a4d2b; }
        .role.docente{ background:#eaf5ff; color:#1b4a7a; }
        .role.estudiante{ background:#eaf9f0; color:#1d6b3d; }

        /* Paginación */
        .pagination{ display:flex; align-items:center; justify-content:center; gap:.6rem; margin: .9rem 0; }
        .pg-btn{
          padding:.55rem .9rem; border:1px solid var(--border); background:#fff;
          border-radius:.7rem; cursor:pointer; box-shadow:0 6px 14px rgba(0,0,0,.05);
        }
        .pg-btn:disabled{ opacity:.5; cursor:not-allowed; }
        .pg-pages{ display:flex; gap:.4rem; }
        .pg-num{
          min-width:36px; height:36px; border-radius:.7rem; border:1px solid var(--border);
          background:#fff; cursor:pointer; box-shadow:0 6px 14px rgba(0,0,0,.05);
        }
        .pg-num.active{ background:var(--primary); color:#fff; border-color:transparent; }
      `}</style>
    </main>
  );
}
