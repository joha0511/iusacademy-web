import { PlusCircle, UserPlus, Users, ClipboardList, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

/** Si luego los traes del backend, cambia estos mocks */
const METRICAS = [
  { icon: Users, label: "Usuarios activos", value: 128 },
  { icon: ClipboardList, label: "Procesos en curso", value: 12 },
  { icon: ShieldCheck, label: "Uptime", value: "97%" },
];

const BORRADORES = [
  { id: "p-001", nombre: "Proceso Civil I – Grupo A", inicio: "10/11/2025", estado: "Borrador" },
  { id: "p-002", nombre: "Proceso Monitorio – Grupo B", inicio: "11/20/2025", estado: "Borrador" },
];

export default function AdminHome() {
  return (
    <main className="px-4 md:px-6 py-6 space-y-6 bg-white">
      {/* HERO */}
      <section className="rounded-2xl border border-[#F3D7C8] bg-gradient-to-r from-[#FFF2EA] to-white p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1E1E1E]">Panel Administrador</h1>
            <p className="text-sm text-[#6B6B6B]">
              Gestiona usuarios, crea procesos y monitorea el avance del simulador.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/admin/crear-proceso"
                className="inline-flex items-center gap-2 rounded-xl bg-[#FF8A4C] text-white font-semibold px-4 py-2 hover:opacity-95 active:opacity-100"
              >
                <PlusCircle size={18} /> Nuevo proceso
              </Link>
              <Link
                to="/admin/crear-usuario"
                className="inline-flex items-center gap-2 rounded-xl border border-[#F3D7C8] bg-white text-[#E36C2D] font-semibold px-4 py-2 hover:border-[#FF8A4C]"
              >
                <UserPlus size={18} /> Crear usuario
              </Link>
            </div>
          </div>

          {/* Métricas compactas a la derecha del hero */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">
            {METRICAS.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-[#F3D7C8] bg-white px-4 py-3"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-[#FFE3D3] p-2 text-[#E36C2D]">
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-[#1E1E1E] leading-none">
                      {value}
                    </div>
                    <div className="text-xs text-[#6B6B6B]">{label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACCESOS RÁPIDOS (cards simples) */}
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-[#1E1E1E]">Accesos rápidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Link
            to="/admin/crear-proceso"
            className="block rounded-2xl border border-[#F3D7C8] bg-white p-4 hover:border-[#FF8A4C] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#FFE3D3] p-2 text-[#E36C2D]">
                <PlusCircle size={18} />
              </div>
              <div>
                <h3 className="font-bold text-[#1E1E1E]">Crear proceso</h3>
                <p className="text-sm text-[#6B6B6B]">Configura y publica procesos.</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/crear-usuario"
            className="block rounded-2xl border border-[#F3D7C8] bg-white p-4 hover:border-[#FF8A4C] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#FFE3D3] p-2 text-[#E36C2D]">
                <UserPlus size={18} />
              </div>
              <div>
                <h3 className="font-bold text-[#1E1E1E]">Crear usuario</h3>
                <p className="text-sm text-[#6B6B6B]">Administra roles y accesos.</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/ajustes"
            className="block rounded-2xl border border-[#F3D7C8] bg-white p-4 hover:border-[#FF8A4C] hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-[#FFE3D3] p-2 text-[#E36C2D]">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="font-bold text-[#1E1E1E]">Ajustes</h3>
                <p className="text-sm text-[#6B6B6B]">Preferencias del panel.</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* BORRADORES RECIENTES */}
      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-[#1E1E1E]">Borradores recientes</h2>
        <div className="rounded-2xl border border-[#F3D7C8] overflow-hidden">
          <table className="w-full text-sm bg-white">
            <thead className="bg-[#FFF2EA] text-[#1E1E1E]">
              <tr>
                <th className="text-left px-4 py-3">Nombre</th>
                <th className="text-left px-4 py-3">Inicio</th>
                <th className="text-left px-4 py-3">Estado</th>
                <th className="text-left px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {BORRADORES.map((b) => (
                <tr key={b.id} className="border-t border-[#F3D7C8]">
                  <td className="px-4 py-3">{b.nombre}</td>
                  <td className="px-4 py-3">{b.inicio}</td>
                  <td className="px-4 py-3">{b.estado}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/crear-proceso?id=${b.id}`}
                      className="text-[#E36C2D] font-semibold hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
              {BORRADORES.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-[#6B6B6B]" colSpan={4}>
                    No hay borradores por ahora.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
