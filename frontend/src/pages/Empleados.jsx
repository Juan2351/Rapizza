import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { empleadoService } from "../services/rapizzaService";
import Swal from "sweetalert2";

const FORM_VACIO = { nombre: "", tipo: "repartidor" };
const TIPO_COLOR = {
  despachador: "bg-blue-100 text-blue-700",
  chef: "bg-yellow-100 text-yellow-700",
  repartidor: "bg-green-100 text-green-700",
};

const Empleados = () => {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [modal, setModal] = useState(false);
  const [edicion, setEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);

  const cargar = async () => {
    setCargando(true);
    try {
      setEmpleados(await empleadoService.getAll());
    } catch {
      Swal.fire("Error", "No se pudieron cargar los empleados.", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = empleados.filter(
    (e) =>
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) &&
      (filtroTipo === "" || e.tipo === filtroTipo),
  );

  const abrirCrear = () => {
    setForm(FORM_VACIO);
    setEdicion(false);
    setIdEditando(null);
    setModal(true);
  };
  const abrirEditar = (e) => {
    setForm({ nombre: e.nombre, tipo: e.tipo });
    setEdicion(true);
    setIdEditando(e.id_empleado);
    setModal(true);
  };

  const handleGuardar = async (ev) => {
    ev.preventDefault();
    if (!form.nombre || !form.tipo) {
      return Swal.fire(
        "Incompleto",
        "Nombre y tipo son obligatorios.",
        "warning",
      );
    }
    try {
      if (edicion) {
        await empleadoService.update(idEditando, { ...form, activo: true });
        Swal.fire(
          "Actualizado",
          "Empleado actualizado correctamente.",
          "success",
        );
      } else {
        await empleadoService.create(form);
        Swal.fire(
          "Registrado",
          "Empleado registrado correctamente.",
          "success",
        );
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

  const handleDesactivar = async (id, nombre) => {
    const result = await Swal.fire({
      title: "¿Desactivar empleado?",
      text: `"${nombre}" dejará de aparecer en las listas de asignación.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      const emp = empleados.find((e) => e.id_empleado === id);
      await empleadoService.update(id, {
        nombre: emp.nombre,
        tipo: emp.tipo,
        activo: false,
      });
      Swal.fire(
        "Desactivado",
        "Empleado desactivado correctamente.",
        "success",
      );
      cargar();
    } catch {
      Swal.fire("Error", "No se pudo desactivar.", "error");
    }
  };

  // Contadores por tipo
  const conteo = empleados.reduce((acc, e) => {
    acc[e.tipo] = (acc[e.tipo] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#fff8f7]">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              👨‍💼 Empleados
            </h1>
            <p className="text-slate-500 mt-1">
              Gestión del personal de la pizzería.
            </p>
          </div>
          <button
            onClick={abrirCrear}
            className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            + Nuevo empleado
          </button>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            {
              tipo: "despachador",
              label: "Despachadores",
              color: "text-blue-600",
            },
            { tipo: "chef", label: "Chefs", color: "text-yellow-600" },
            {
              tipo: "repartidor",
              label: "Repartidores",
              color: "text-green-600",
            },
          ].map((c) => (
            <div
              key={c.tipo}
              className="bg-white rounded-2xl shadow p-4 text-center"
            >
              <p className="text-xs text-gray-500 uppercase font-medium">
                {c.label}
              </p>
              <p className={`text-3xl font-bold mt-1 ${c.color}`}>
                {conteo[c.tipo] || 0}
              </p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="">Todos los tipos</option>
            <option value="despachador">Despachador</option>
            <option value="chef">Chef</option>
            <option value="repartidor">Repartidor</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          {cargando ? (
            <p className="text-center py-10 text-gray-400">Cargando...</p>
          ) : filtrados.length === 0 ? (
            <p className="text-center py-10 text-gray-400">
              No se encontraron empleados.
            </p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  {["ID", "Nombre", "Tipo", "Usuario sistema", "Acciones"].map(
                    (h) => (
                      <th key={h} className="px-4 py-3">
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((e) => (
                  <tr key={e.id_empleado} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-500">
                      {e.id_empleado}
                    </td>
                    <td className="px-4 py-3 font-medium">{e.nombre}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${TIPO_COLOR[e.tipo]}`}
                      >
                        {e.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {e.usuario ? (
                        <span className="font-mono text-sm text-gray-700">
                          {e.usuario}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">
                          Sin cuenta
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 space-x-3">
                      <button
                        onClick={() => abrirEditar(e)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() =>
                          handleDesactivar(e.id_empleado, e.nombre)
                        }
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
                {edicion ? "Editar empleado" : "Nuevo empleado"}
              </h2>
              <form onSubmit={handleGuardar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) =>
                      setForm({ ...form, nombre: e.target.value })
                    }
                    placeholder="Ej: Carlos Mendoza"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de empleado
                  </label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="repartidor">Repartidor</option>
                    <option value="chef">Chef</option>
                    <option value="despachador">Despachador</option>
                  </select>
                </div>
                <p className="text-xs text-gray-400">
                  Para asignar cuenta de sistema al empleado, usa el módulo de
                  Usuarios.
                </p>
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
                    className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-800 text-white font-semibold transition"
                  >
                    {edicion ? "Guardar cambios" : "Registrar empleado"}
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

export default Empleados;
