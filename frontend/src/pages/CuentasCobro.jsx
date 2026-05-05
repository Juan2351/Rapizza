import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cuentaCobroService } from "../services/rapizzaService";
import Swal from "sweetalert2";

const LOGO_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCoT-gBW1CCqWZmELPjgxbrAMq-6-V4ZV3k4_wmY9plagZxVACYZ5tdC6mOucMzCSN3DxFK0C01udZelyFZAIofv0Be_50tX49gw7QCLWkXID3A-oX39d4Kpl7XFu6G6hl4YsAZu7HDUzmAKXPj1e86uWIRnbPnA6I4Vt8tH3E5zBejp1ndrwKIWPx-xxXc5B5s_hl0nHGysTfM3G3LMHJDoxKOvzSZnIxh6RzvJeTGMfXRR-YR-HtybWFwxQTGUsJHy_YMpbib_o0";

const CuentasCobro = () => {
  const navigate = useNavigate();
  const [cuentas, setCuentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("pendientes");
  const [busqueda, setBusqueda] = useState("");

  const cargar = async () => {
    setCargando(true);
    try {
      setCuentas(await cuentaCobroService.getAll());
    } catch {
      Swal.fire("Error", "No se pudieron cargar las cuentas.", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const visibles = cuentas
    .filter((c) => (filtro === "todas" ? true : !c.pagada))
    .filter((c) =>
      c.repartidor_nombre?.toLowerCase().includes(busqueda.toLowerCase()),
    );

  const totalPendiente = cuentas
    .filter((c) => !c.pagada)
    .reduce((s, c) => s + Number(c.valor), 0);
  const totalRecuperado = cuentas
    .filter((c) => c.pagada)
    .reduce((s, c) => s + Number(c.valor), 0);
  const porcentaje =
    cuentas.length > 0
      ? Math.round(
          (cuentas.filter((c) => c.pagada).length / cuentas.length) * 100,
        )
      : 0;

  const iniciales = (nombre) =>
    nombre
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??";
  const coloresAvatar = [
    "bg-red-100 text-red-700",
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-yellow-100 text-yellow-700",
    "bg-purple-100 text-purple-700",
  ];
  const avatarColor = (nombre) =>
    coloresAvatar[(nombre?.charCodeAt(0) || 0) % coloresAvatar.length];

  const handlePagar = async (c) => {
    const result = await Swal.fire({
      title: "¿Marcar como pagada?",
      html: `<p><b>Repartidor:</b> ${c.repartidor_nombre}</p><p><b>Pedido #:</b> ${c.numero_pedido}</p><p><b>Valor:</b> $${Number(c.valor).toLocaleString("es-CO")}</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#b70011",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, está pagada",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await cuentaCobroService.marcarPagada(c.id);
      Swal.fire("Registrado", "Cuenta marcada como pagada.", "success");
      cargar();
    } catch {
      Swal.fire("Error", "No se pudo registrar.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f7]">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center px-6 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="Logo"
              className="w-9 h-9 object-contain rounded-lg"
              onError={(e) => (e.target.style.display = "none")}
            />
            <span className="text-lg font-black text-red-600 uppercase italic tracking-tighter">
              RAPIZZA Ltda.
            </span>
          </div>
          <nav className="hidden md:flex gap-6">
            {[
              ["Pedidos", "/pedidos"],
              ["Clientes", "/clientes"],
              ["Productos", "/productos"],
              ["Cuentas", "/cuentas-cobro"],
              ["Empleados", "/empleados"],
            ].map(([l, r]) => (
              <button
                key={r}
                onClick={() => navigate(r)}
                className={`text-sm font-medium transition-colors ${r === "/cuentas-cobro" ? "text-red-600 border-b-2 border-red-600 pb-0.5 font-bold" : "text-slate-500 hover:text-red-600"}`}
              >
                {l}
              </button>
            ))}
          </nav>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-slate-500 hover:text-red-600 font-medium transition-colors"
          >
            ← Dashboard
          </button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Cuentas de Cobro
          </h1>
          <p className="text-slate-500 mt-1">
            Pedidos entregados tarde — el repartidor debe pagar al despachador.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-red-500">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Cuentas Pendientes
            </p>
            <p className="text-3xl font-bold text-red-600">
              {cuentas.filter((c) => !c.pagada).length}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              de {cuentas.length} totales
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-yellow-500">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Monto Pendiente
            </p>
            <p className="text-3xl font-bold text-slate-900">
              ${totalPendiente.toLocaleString("es-CO")}
            </p>
            <p className="text-xs text-red-500 mt-2">⚠ Por recuperar</p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Monto a Recuperar
            </p>
            <p className="text-3xl font-bold text-slate-900">
              ${totalRecuperado.toLocaleString("es-CO")}
            </p>
            <p className="text-xs text-green-600 mt-2">
              ✓ {porcentaje}% recuperado
            </p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <h3 className="text-lg font-bold text-slate-800">
              Listado de Pendientes
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Buscar repartidor..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-56"
                />
              </div>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {["pendientes", "todas"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltro(f)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${filtro === f ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                  >
                    {f === "pendientes" ? "Pendientes" : "Todas"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {cargando ? (
            <p className="text-center py-16 text-slate-400">Cargando...</p>
          ) : visibles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-6">
                🎉
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                No hay cuentas pendientes
              </h3>
              <p className="text-slate-500 text-center max-w-md">
                ¡Buen trabajo! Todos los cargos por entregas tardías han sido
                procesados exitosamente.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {[
                        "Repartidor",
                        "Pedido #",
                        "Valor",
                        "Fecha",
                        "Estado",
                        "Acción",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {visibles.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${avatarColor(c.repartidor_nombre)}`}
                            >
                              {iniciales(c.repartidor_nombre)}
                            </div>
                            <span className="font-semibold text-slate-800 text-sm">
                              {c.repartidor_nombre}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">
                          #{c.numero_pedido}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">
                          ${Number(c.valor).toLocaleString("es-CO")}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(c.fecha_emision).toLocaleDateString(
                            "es-CO",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {c.pagada ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                              PAGADA
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                              PENDIENTE
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {!c.pagada && (
                            <button
                              onClick={() => handlePagar(c)}
                              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
                            >
                              Marcar pagada
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Mostrando {visibles.length} de {cuentas.length} registros
                </span>
              </div>
            </>
          )}
        </div>
      </main>

      <footer className="mt-12 py-6 border-t border-gray-200 text-center">
        <p className="text-xs text-slate-400">
          © 2026 RAPIZZA Ltda. • Panel Administrativo • Control de Operaciones
        </p>
      </footer>
    </div>
  );
};

export default CuentasCobro;
