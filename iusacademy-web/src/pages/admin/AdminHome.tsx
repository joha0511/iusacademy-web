// src/pages/admin/AdminHome.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  GraduationCap,
  UserCog,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const API_URL =
  import.meta.env.VITE_API_WEB_URL || "http://localhost:4001";

type MateriaResumen = {
  materia: string | null;
  count: number;
};

type DashboardAdminResumen = {
  totalEstudiantes: number;
  totalDocentes: number;
  totalUsuarios: number;
  totalGrupos: number;
  materias: MateriaResumen[];
};

function prettifyMateria(materia: string | null): string {
  if (!materia) return "Sin materia";

  switch (materia) {
    case "DERECHO_PROCESAL_CIVIL":
      return "Procesal Civil";
    case "DERECHO_DIGITAL_PENAL":
      return "Digital Penal";
    case "DERECHO_CORPORATIVO_DIGITAL":
      return "Corporativo Digital";
    case "CONTRATOS":
      return "Contratos";
    default:
      return materia
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
  }
}

export default function AdminHome() {
  const [data, setData] = useState<DashboardAdminResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/dashboard/admin/resumen`);
        if (!res.ok) throw new Error("Respuesta no válida del servidor");

        const json = (await res.json()) as DashboardAdminResumen;
        setData(json);
      } catch (e) {
        console.error("Error cargando dashboard:", e);
        setError("No se pudo cargar el dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalUsuarios = data?.totalUsuarios ?? 0;
  const totalEstudiantes = data?.totalEstudiantes ?? 0;
  const totalDocentes = data?.totalDocentes ?? 0;
  const totalAdmins = Math.max(
    totalUsuarios - totalEstudiantes - totalDocentes,
    0
  );

  const materiasChartData = useMemo(
    () =>
      (data?.materias ?? []).map((m) => ({
        name: prettifyMateria(m.materia),
        value: m.count,
      })),
    [data]
  );

  const rolesChartData = useMemo(
    () => [
      { name: "Estudiantes", value: totalEstudiantes, color: "#FF8A4C" },
      { name: "Docentes", value: totalDocentes, color: "#FDBA74" },
      { name: "Admins", value: totalAdmins, color: "#FACC15" },
    ],
    [totalEstudiantes, totalDocentes, totalAdmins]
  );

  return (
    <main className="ah-root">
      {/* HEADER - fondo blanco */}
      <section className="ah-header">
        <h1 className="ah-title">Panel Administrador</h1>
        <p className="ah-subtitle">
          Resumen general de usuarios y actividad de la plataforma.
        </p>
      </section>

      {/* KPI CARDS */}
      <section className="ah-kpi-grid">
        <KpiCard
          icon={<Users size={20} />}
          tone="primary"
          label="Usuarios totales"
          value={loading ? "–" : totalUsuarios}
          helper="Suma de admins, docentes y estudiantes registrados."
        />
        <KpiCard
          icon={<GraduationCap size={20} />}
          tone="primary"
          label="Estudiantes"
          value={loading ? "–" : totalEstudiantes}
          helper="Participantes activos en el simulador."
        />
        <KpiCard
          icon={<UserCog size={20} />}
          tone="success"
          label="Docentes"
          value={loading ? "–" : totalDocentes}
          helper="Responsables de guiar y evaluar a los grupos."
        />
      </section>

      {error && (
        <div className="ah-alert-error">{error}</div>
      )}

      {!loading && !error && (
        <section className="ah-charts-grid">
          {/* BARRAS HORIZONTALES */}
          <div className="ah-card">
            <h2 className="ah-card-title">Estudiantes por materia</h2>

            {materiasChartData.length === 0 ? (
              <p className="ah-card-empty">
                Aún no hay estudiantes registrados por materia.
              </p>
            ) : (
              <div className="ah-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={materiasChartData}
                    layout="vertical"
                    margin={{ top: 10, left: 24, right: 16, bottom: 10 }}
                    barCategoryGap={10}
                    barSize={16} // 🔸 barras más delgadas
                  >
                    <defs>
                      <linearGradient
                        id="gradBarDashboard"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#FFB38A" />
                        <stop offset="100%" stopColor="#FF8A4C" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      horizontal
                      vertical={false}
                      stroke="#F5E4DA"
                    />
                    <XAxis
                      type="number"
                      tickLine={false}
                      axisLine={{ stroke: "#F3D7C8" }}
                      tick={{ fill: "#9CA3AF", fontSize: 11 }}
                      allowDecimals={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tickLine={false}
                      axisLine={false}
                      width={90} // 🔸 menos ancho a la izquierda
                      tick={{ fill: "#6B6B6B", fontSize: 11 }}
                    />
                    <RTooltip
                      cursor={{ fill: "rgba(255,138,76,0.08)" }}
                      formatter={(v: any) => [`${v} estudiantes`, "Total"]}
                    />
                    <Bar
                      dataKey="value"
                      radius={[999, 999, 999, 999]}
                      fill="url(#gradBarDashboard)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* DONUT ROLES */}
          <div className="ah-card">
            <h2 className="ah-card-title">
              Distribución de usuarios por rol
            </h2>

            <div className="ah-chart-donut">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rolesChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    isAnimationActive
                  >
                    {rolesChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <RTooltip
                    formatter={(v: any, n: any) => [`${v} usuarios`, n]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => (
                      <span className="ah-legend-text">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* CSS embebido al final */}
      <style>{styles}</style>
    </main>
  );
}

/* ===================== Subcomponentes ===================== */

type KpiCardProps = {
  icon: React.ReactNode;
  tone?: "primary" | "success";
  label: string;
  value: number | string;
  helper?: string;
};

function KpiCard({ icon, tone = "primary", label, value, helper }: KpiCardProps) {
  const iconBg =
    tone === "primary" ? "ah-kpi-icon-bg-primary" : "ah-kpi-icon-bg-success";
  const iconColor =
    tone === "primary" ? "ah-kpi-icon-primary" : "ah-kpi-icon-success";

  return (
    <article className="ah-kpi-card">
      <div className="ah-kpi-top">
        <div className={`ah-kpi-icon ${iconBg} ${iconColor}`}>{icon}</div>
        <span className="ah-kpi-label">{label}</span>
      </div>
      <div className="ah-kpi-value">{value}</div>
      {helper && <p className="ah-kpi-helper">{helper}</p>}
    </article>
  );
}

/* ========================== STYLES ========================= */

const styles = `
.ah-root{
  width:100%;
  padding:24px 24px 24px 24px;
  background:#FFFFFF;
  display:flex;
  flex-direction:column;
  gap:16px;
}

/* HEADER */
.ah-header{
  border-radius:18px;
  border:1px solid #F3D7C8;
  background:#FFFFFF;
  padding:16px 20px;
  box-shadow:0 10px 32px rgba(0,0,0,0.04);
}
.ah-title{
  margin:0;
  font-size:1.6rem;
  font-weight:900;
  color:#1E1E1E;
}
.ah-subtitle{
  margin:4px 0 0;
  font-size:.9rem;
  color:#6B6B6B;
}

/* KPI GRID */
.ah-kpi-grid{
  display:grid;
  grid-template-columns:repeat(1,minmax(0,1fr));
  gap:12px;
}
@media(min-width:768px){
  .ah-kpi-grid{
    grid-template-columns:repeat(3,minmax(0,1fr));
  }
}
.ah-kpi-card{
  border-radius:18px;
  border:1px solid #F3D7C8;
  background:#FFFFFF;
  padding:14px 16px;
  box-shadow:0 10px 28px rgba(0,0,0,0.04);
  display:flex;
  flex-direction:column;
  gap:4px;
}
.ah-kpi-top{
  display:flex;
  align-items:center;
  gap:8px;
}
.ah-kpi-icon{
  width:32px;
  height:32px;
  border-radius:12px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
}
.ah-kpi-icon-bg-primary{ background:#FFE3D3; }
.ah-kpi-icon-bg-success{ background:#DCFCE7; }
.ah-kpi-icon-primary{ color:#FF8A4C; }
.ah-kpi-icon-success{ color:#16A34A; }
.ah-kpi-label{
  font-size:.78rem;
  font-weight:600;
  color:#6B6B6B;
}
.ah-kpi-value{
  margin-top:2px;
  font-size:1.7rem;
  font-weight:800;
  color:#1E1E1E;
}
.ah-kpi-helper{
  margin:2px 0 0;
  font-size:.8rem;
  color:#9CA3AF;
}

/* ALERTA ERROR */
.ah-alert-error{
  border-radius:12px;
  border:1px solid #FECACA;
  background:#FEF2F2;
  color:#B91C1C;
  padding:10px 14px;
  font-size:.9rem;
}

/* GRID CHARTS */
.ah-charts-grid{
  display:grid;
  grid-template-columns:1fr;
  gap:14px;
}
@media(min-width:1024px){
  .ah-charts-grid{
    grid-template-columns:minmax(0,2fr) minmax(0,1.05fr);
  }
}

/* CARD GENERAL */
.ah-card{
  border-radius:18px;
  border:1px solid #F3D7C8;
  background:#FFFFFF;
  padding:14px 16px;
  box-shadow:0 10px 28px rgba(0,0,0,0.03);
  display:flex;
  flex-direction:column;
}
.ah-card-title{
  margin:0 0 8px;
  font-size:.98rem;
  font-weight:800;
  color:#1E1E1E;
}
.ah-card-empty{
  margin:4px 0 0;
  font-size:.86rem;
  color:#6B6B6B;
}

/* CHART AREAS */
.ah-chart{
  width:100%;
  height:230px;
  margin-top:4px;
}
.ah-chart-donut{
  width:100%;
  height:230px;
  margin-top:4px;
}
.ah-legend-text{
  font-size:.78rem;
  color:#4B5563;
}
` as const;
