import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { pedidoService } from "../services/rapizzaService";
import Navbar from "../components/Navbar";
import StatCard from "../components/dashboard/StatCard";
import ModuloCard from "../components/dashboard/ModuloCard";

const MODULOS = [
  {
    roles: ["admin", "despachador", "chef", "repartidor"],
    label: "Pedidos",
    icon: "🛵",
    desc: "Gestión de flujo real",
    ruta: "/pedidos",
    bg: "hover:bg-red-50    border-red-100",
    iconBg: "bg-red-100    text-red-600",
  },
  {
    roles: ["admin", "despachador"],
    label: "Clientes",
    icon: "👥",
    desc: "Base de datos y lealtad",
    ruta: "/clientes",
    bg: "hover:bg-blue-50   border-blue-100",
    iconBg: "bg-blue-100   text-blue-600",
  },
  {
    roles: ["admin"],
    label: "Productos",
    icon: "🍕",
    desc: "Menú e ingredientes",
    ruta: "/productos",
    bg: "hover:bg-orange-50 border-orange-100",
    iconBg: "bg-orange-100 text-orange-600",
  },
  {
    roles: ["admin", "despachador"],
    label: "Cuentas",
    icon: "💸",
    desc: "Cobros y facturación",
    ruta: "/cuentas-cobro",
    bg: "hover:bg-red-50    border-red-100",
    iconBg: "bg-red-100    text-red-600",
  },
  {
    roles: ["admin"],
    label: "Empleados",
    icon: "👨‍💼",
    desc: "Personal y horarios",
    ruta: "/empleados",
    bg: "hover:bg-slate-50  border-slate-100",
    iconBg: "bg-slate-100  text-slate-600",
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (["admin", "despachador"].includes(user?.rol)) {
      pedidoService
        .estadisticas()
        .then(setStats)
        .catch(() => {});
    }
  }, [user]);

  const modulos = MODULOS.filter((m) => m.roles.includes(user?.rol));

  const statCards = stats
    ? [
        {
          label: "TOTAL PEDIDOS",
          valor: stats.total_pedidos,
          icon: "🛒",
          sub: "Registros totales",
          subColor: "text-green-600",
          borderColor: "border-l-blue-500",
        },
        {
          label: "PENDIENTES",
          valor: stats.pedidos_pendientes,
          icon: "⏱",
          sub: "En preparación activa",
          subColor: "text-slate-500",
          borderColor: "border-l-yellow-500",
        },
        {
          label: "TARDÍOS",
          valor: stats.pedidos_tardios,
          icon: "⏰",
          sub: "⚠ Crítico (>30 min)",
          subColor: "text-red-500",
          borderColor: "border-l-red-500",
        },
        {
          label: "PÉRDIDAS $",
          valor: `$${Number(stats.perdidas_estimadas).toLocaleString("es-CO")}`,
          icon: "📉",
          sub: "Cancelaciones y mermas",
          subColor: "text-slate-500",
          borderColor: "border-l-red-800",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#fff8f7]">
      <Navbar />

      <main className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Encabezado */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Panel de Control
          </h1>
          <p className="text-slate-500 mt-1">
            Resumen operativo de la jornada actual.
          </p>
        </div>

        {/* Estadísticas */}
        {statCards.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((c) => (
              <StatCard key={c.label} {...c} />
            ))}
          </div>
        )}

        {/* Módulos */}
        <h2 className="text-xl font-bold text-slate-800 mb-4">
          Módulos Administrativos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {modulos.map((m) => (
            <ModuloCard key={m.ruta} {...m} onClick={() => navigate(m.ruta)} />
          ))}
        </div>
      </main>

      <footer className="mt-16 py-6 border-t border-gray-200 text-center">
        <p className="text-xs text-slate-400">
          © 2026 RAPIZZA Ltda. • Panel Administrativo
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;
