import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { productoService } from "../services/rapizzaService";
import Swal from "sweetalert2";

const FORM_VACIO = { codigo: "", nombre: "", valor_unitario: "" };

const Productos = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(false);
  const [edicion, setEdicion] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);

  const cargar = async () => {
    setCargando(true);
    try {
      setProductos(await productoService.getAll());
    } catch {
      Swal.fire("Error", "No se pudieron cargar los productos.", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const abrirCrear = () => {
    setForm(FORM_VACIO);
    setEdicion(false);
    setModal(true);
  };
  const abrirEditar = (p) => {
    setForm({
      codigo: p.codigo,
      nombre: p.nombre,
      valor_unitario: p.valor_unitario,
    });
    setEdicion(true);
    setModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!form.codigo || !form.nombre || !form.valor_unitario) {
      return Swal.fire(
        "Incompleto",
        "Todos los campos son obligatorios.",
        "warning",
      );
    }
    if (Number(form.valor_unitario) < 0) {
      return Swal.fire(
        "Valor inválido",
        "El valor unitario no puede ser negativo.",
        "warning",
      );
    }
    try {
      if (edicion) {
        await productoService.update(form.codigo, {
          nombre: form.nombre,
          valor_unitario: form.valor_unitario,
        });
        Swal.fire(
          "Actualizado",
          "Producto actualizado correctamente.",
          "success",
        );
      } else {
        await productoService.create(form);
        Swal.fire("Creado", "Producto creado correctamente.", "success");
      }
      setModal(false);
      cargar();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "No se pudo guardar.",
        "error",
      );
    }
  };

  const handleEliminar = async (codigo, nombre) => {
    const result = await Swal.fire({
      title: "¿Desactivar producto?",
      text: `"${nombre}" no estará disponible para nuevos pedidos. Esta acción preserva el historial.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await productoService.remove(codigo);
      Swal.fire(
        "Desactivado",
        "El producto fue desactivado correctamente.",
        "success",
      );
      cargar();
    } catch {
      Swal.fire("Error", "No se pudo desactivar el producto.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8f7]">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              🍕 Productos
            </h1>
            <p className="text-slate-500 mt-1">Menú de pizzas y aditivos.</p>
          </div>
          <button
            onClick={abrirCrear}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            + Nuevo producto
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-sm mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          {cargando ? (
            <p className="text-center py-10 text-gray-400">Cargando...</p>
          ) : filtrados.length === 0 ? (
            <p className="text-center py-10 text-gray-400">
              No hay productos activos.
            </p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  {["Código", "Nombre", "Valor unitario", "Acciones"].map(
                    (h) => (
                      <th key={h} className="px-4 py-3">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((p) => (
                  <tr key={p.codigo} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-orange-600 font-semibold">
                      {p.codigo}
                    </td>
                    <td className="px-4 py-3 font-medium">{p.nombre}</td>
                    <td className="px-4 py-3 font-semibold text-green-700">
                      ${Number(p.valor_unitario).toLocaleString("es-CO")}
                    </td>
                    <td className="px-4 py-3 space-x-3">
                      <button
                        onClick={() => abrirEditar(p)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(p.codigo, p.nombre)}
                        className="text-red-500 hover:underline text-xs font-medium"
                      >
                        Desactivar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {modal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                {edicion ? "Editar producto" : "Nuevo producto"}
              </h2>
              <form onSubmit={handleGuardar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    value={form.codigo}
                    disabled={edicion}
                    onChange={(e) =>
                      setForm({ ...form, codigo: e.target.value.toUpperCase() })
                    }
                    placeholder="Ej: PZZ-009"
                    className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 ${edicion ? "bg-gray-100" : ""}`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                    placeholder="Ej: Pizza Cuatro Quesos Personal"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor unitario (COP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.valor_unitario}
                    onChange={(e) =>
                      setForm({ ...form, valor_unitario: e.target.value })
                    }
                    placeholder="Ej: 22000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModal(false)}
                    className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold transition"
                  >
                    {edicion ? "Guardar cambios" : "Crear producto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Productos;
