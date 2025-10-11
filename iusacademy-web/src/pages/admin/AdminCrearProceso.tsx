import { useState } from "react";

interface NewProceso { nombre: string; descripcion: string; inicio: string; fin: string; }
interface ProcesoRow { id: string; nombre: string; descripcion: string; inicio: string; fin: string; estado: "borrador" | "publicado"; }

export default function AdminCrearProceso() {
  const [form, setForm] = useState<NewProceso>({ nombre:"", descripcion:"", inicio:"", fin:"" });
  const [procesos, setProcesos] = useState<ProcesoRow[]>([]);
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({...prev, [name]: value}));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg(null); setErr(null);
    if (!form.nombre || !form.descripcion || !form.inicio || !form.fin) { setErr("Completa todos los campos."); return; }
    setLoading(true);
    try {
      // TODO: conecta con API real
      // const res = await fetch("http://localhost:4000/admin/processes", {...})
      await new Promise(r => setTimeout(r, 400));
      const row: ProcesoRow = { id: `p_${Date.now()}`, ...form, estado:"borrador" };
      setProcesos(prev => [row, ...prev]);
      setForm({ nombre:"", descripcion:"", inicio:"", fin:"" });
      setMsg("Proceso creado como borrador.");
    } catch (e:any) {
      setErr(e?.message || "Error al crear proceso");
    } finally {
      setLoading(false);
    }
  };

  const publicar = (id: string) => {
    setProcesos(prev => prev.map(p => p.id===id? {...p, estado:"publicado"} : p));
  };

  return (
    <main className="p">
      <h1 className="t">Crear proceso</h1>

      <form className="f" onSubmit={submit}>
        <div className="row">
          <div className="col">
            <label>Nombre del proceso</label>
            <input name="nombre" value={form.nombre} onChange={onChange} placeholder="Proceso Civil I - Grupo A" />
          </div>
          <div className="col">
            <label>Fecha de inicio</label>
            <input type="date" name="inicio" value={form.inicio} onChange={onChange} />
          </div>
        </div>

        <div className="row">
          <div className="col">
            <label>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={onChange} rows={4} placeholder="Objetivo, alcance, fases del simulador..." />
          </div>
          <div className="col">
            <label>Fecha de fin</label>
            <input type="date" name="fin" value={form.fin} onChange={onChange} />
          </div>
        </div>

        <div className="row">
          <div className="col col-btn">
            <button className="btn" disabled={loading}>{loading?"Guardando…":"Guardar borrador"}</button>
          </div>
        </div>

        {msg && <div className="ok">{msg}</div>}
        {err && <div className="err">{err}</div>}
      </form>

      <h2 className="st">Procesos</h2>
      <div className="table">
        <div className="thead">
          <span>Nombre</span><span>Inicio</span><span>Fin</span><span>Estado</span><span>Acciones</span>
        </div>
        {procesos.map(p => (
          <div className="tr" key={p.id}>
            <span>{p.nombre}</span>
            <span>{p.inicio || "-"}</span>
            <span>{p.fin || "-"}</span>
            <span className={`estado ${p.estado}`}>{p.estado}</span>
            <span className="acts">
              {p.estado === "borrador" && <button className="btn-sm" onClick={() => publicar(p.id)}>Publicar</button>}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        :root{ --primary:#FF8A4C; --accent:#E36C2D; --border:#F3D7C8; --sub:#6B6B6B; }
        .p{ padding:1rem; }
        .t{ font-size:1.5rem; font-weight:800; margin-bottom:.75rem; }
        .f{ background:#fff; border:1px solid var(--border); border-radius:1rem; padding:1rem; }
        .row{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:1rem; }
        @media(max-width:800px){ .row{ grid-template-columns: 1fr; } }
        .col label{ display:block; font-weight:700; font-size:.9rem; margin-bottom:.25rem; }
        .col input, .col textarea{
          width:100%; padding:.8rem .9rem; border-radius:.75rem; border:1px solid #eadcd4; outline:none;
        }
        .col textarea{ resize:vertical; }
        .col input:focus, .col textarea:focus{ border-color:var(--primary); box-shadow:0 0 0 3px rgba(255,138,76,.22); }
        .col-btn{ display:flex; align-items:flex-end; }
        .btn{
          width:100%; background:var(--primary); color:#fff; font-weight:800; border:none; padding:.9rem 1rem; border-radius:.9rem; cursor:pointer;
        }
        .btn:hover{ background:var(--accent); }
        .ok{ margin-top:.75rem; background:#eaffea; border:1px solid #b5e0b5; color:#135913; padding:.6rem .9rem; border-radius:.75rem; }
        .err{ margin-top:.75rem; background:#ffe6e6; border:1px solid #ffc7c7; color:#8a1f1f; padding:.6rem .9rem; border-radius:.75rem; }
        .st{ margin-top:1rem; font-weight:800; }
        .table{ margin-top:.5rem; background:#fff; border:1px solid var(--border); border-radius:1rem; overflow:hidden; }
        .thead, .tr{ display:grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr; gap:.5rem; padding:.75rem 1rem; }
        .thead{ background:#FFF2EA; font-weight:800; }
        .tr{ border-top:1px solid #f5e5dc; }
        .estado{ text-transform:capitalize; font-weight:800; padding:.2rem .5rem; border-radius:.6rem; display:inline-block; text-align:center; }
        .estado.borrador{ background:#FFF7E6; color:#885b08; }
        .estado.publicado{ background:#eaf9f0; color:#1d6b3d; }
        .acts{ display:flex; gap:.5rem; }
        .btn-sm{ background:#fff; border:1px solid var(--border); padding:.45rem .7rem; border-radius:.6rem; font-weight:700; cursor:pointer; }
        .btn-sm:hover{ border-color:var(--primary); }
      `}</style>
    </main>
  );
}
