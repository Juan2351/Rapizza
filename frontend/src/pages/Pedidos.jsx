import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  pedidoService,
  clienteService,
  empleadoService,
  productoService,
} from "../services/rapizzaService";
import Navbar from "../components/Navbar";
import TablaPedidos from "../components/pedidos/TablaPedidos";
import ModalNuevoPedido from "../components/pedidos/ModalNuevoPedido";
import Swal from "sweetalert2";

const Pedidos = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [chefs, setChefs] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);

  const esAdmin = user?.rol === "admin";
  const esDespachador = ["admin", "despachador"].includes(user?.rol);
  const esRepartidor = ["admin", "repartidor"].includes(user?.rol);

  // ── Carga inicial ──────────────────────────────────────────
  const cargar = async () => {
    setCargando(true);
    try {
      const [p, c, ch, r, pr] = await Promise.all([
        pedidoService.getAll(),
        clienteService.getAll(),
        empleadoService.getChefs(),
        empleadoService.getRepartidores(),
        productoService.getAll(),
      ]);
      setPedidos(p);
      setClientes(c);
      setChefs(ch);
      setRepartidores(r);
      setProductos(pr);
    } catch {
      Swal.fire("Error", "No se pudieron cargar los datos.", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const pedidosFiltrados = pedidos.filter(
    (p) =>
      p.cliente_nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(p.numero).includes(busqueda),
  );

  // ── Crear pedido ───────────────────────────────────────────
  const handleCrear = async (datos) => {
    try {
      const res = await pedidoService.create(datos);
      Swal.fire(
        "¡Pedido creado!",
        `Pedido #${res.data.numero} por $${Number(res.data.valor_total).toLocaleString("es-CO")}`,
        "success",
      );
      setModalAbierto(false);
      cargar();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "No se pudo crear el pedido.",
        "error",
      );
    }
  };

  // ── Asignar repartidor ─────────────────────────────────────
  const handleAsignar = async (pedido) => {
    const opts = repartidores.reduce(
      (acc, r) => ({ ...acc, [r.id_empleado]: r.nombre }),
      {},
    );
    const { value: id_repartidor } = await Swal.fire({
      title: `Asignar repartidor — Pedido #${pedido.numero}`,
      input: "select",
      inputOptions: opts,
      inputPlaceholder: "Selecciona un repartidor",
      showCancelButton: true,
      confirmButtonText: "Asignar",
      confirmButtonColor: "#b70011",
    });
    if (!id_repartidor) return;
    try {
      await pedidoService.asignarRepartidor(pedido.numero, { id_repartidor });
      Swal.fire("Asignado", "Repartidor asignado correctamente.", "success");
      cargar();
    } catch {
      Swal.fire("Error", "No se pudo asignar.", "error");
    }
  };

  // ── Registrar entrega ──────────────────────────────────────
  const handleEntregar = async (pedido) => {
    const { value: hora_entrega } = await Swal.fire({
      title: `Registrar entrega — Pedido #${pedido.numero}`,
      input: "time",
      showCancelButton: true,
      confirmButtonText: "Registrar",
      confirmButtonColor: "#b70011",
    });
    if (!hora_entrega) return;
    try {
      const res = await pedidoService.registrarEntrega(pedido.numero, {
        hora_entrega,
      });
      Swal.fire(
        res.data.estado === "pagado" ? "✅ A tiempo" : "⚠️ Tardío",
        res.data.message,
        res.data.estado === "pagado" ? "success" : "warning",
      );
      cargar();
    } catch {
      Swal.fire("Error", "No se pudo registrar la entrega.", "error");
    }
  };

  // ── Eliminar ───────────────────────────────────────────────
  const handleEliminar = async (numero) => {
    const result = await Swal.fire({
      title: "¿Eliminar pedido?",
      text: `¿Eliminar pedido #${numero}? Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b70011",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await pedidoService.remove(numero);
      Swal.fire("Eliminado", "El pedido fue eliminado.", "success");
      cargar();
    } catch {
      Swal.fire("Error", "No se pudo eliminar.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f7]">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              📋 Pedidos
            </h1>
            <p className="text-slate-500 mt-1">
              Gestión del flujo de pedidos RAPIZZA.
            </p>
          </div>
          {esDespachador && (
            <button
              onClick={() => setModalAbierto(true)}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-all active:scale-95 shadow-sm"
            >
              + Nuevo pedido
            </button>
          )}
        </div>

        {/* Búsqueda */}
        <div className="relative mb-4 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Buscar por # o cliente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          />
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {cargando ? (
            <p className="text-center py-16 text-slate-400">
              Cargando pedidos...
            </p>
          ) : (
            <TablaPedidos
              pedidos={pedidosFiltrados}
              esAdmin={esAdmin}
              esDespachador={esDespachador}
              esRepartidor={esRepartidor}
              onAsignar={handleAsignar}
              onEntregar={handleEntregar}
              onEliminar={handleEliminar}
            />
          )}
        </div>
      </div>

      {/* Modal */}
      {modalAbierto && (
        <ModalNuevoPedido
          clientes={clientes}
          chefs={chefs}
          productos={productos}
          onGuardar={handleCrear}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
};

export default Pedidos;
