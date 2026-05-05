import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { clienteService } from "../services/rapizzaService";
import Swal from "sweetalert2";

const FORM_VACIO = {
  cedula: "",
  nombre: "",
  telefono: "",
  direccion: "",
  zona_cobertura: "",
};
const ZONAS = [
  "Zona Norte",
  "Zona Sur",
  "Zona Centro",
  "Zona Occidente",
  "Zona Oriente",
];

const Clientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(false);
  const [edicion, setEdicion] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);

  const cargar = async () => {
    setCargando(true);
    try {
      setClientes(await clienteService.getAll());
    } catch {
      Swal.fire("Error", "No se pudieron cargar los clientes.", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.cedula.includes(busqueda) ||
      c.telefono.includes(busqueda),
  );

  const abrirCrear = () => {
    setForm(FORM_VACIO);
    setEdicion(false);
    setModal(true);
  };
  const abrirEditar = (c) => {
    setForm({
      cedula: c.cedula,
      nombre: c.nombre,
      telefono: c.telefono,
      direccion: c.direccion,
      zona_cobertura: c.zona_cobertura,
    });
    setEdicion(true);
    setModal(true);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const { cedula, nombre, telefono, direccion, zona_cobertura } = form;
    if (!cedula || !nombre || !telefono || !direccion || !zona_cobertura) {
      return Swal.fire(
        "Incompleto",
        "Todos los campos son obligatorios.",
        "warning",
      );
    }
    try {
      if (edicion) {
        await clienteService.update(cedula, {
          nombre,
          telefono,
          direccion,
          zona_cobertura,
        });
        Swal.fire(
          "Actualizado",
          "Cliente actualizado correctamente.",
          "success",
        );
      } else {
        await clienteService.create(form);
        Swal.fire("Registrado", "Cliente registrado correctamente.", "success");
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

  return (
    <div className="min-h-screen bg-[#fff8f7]">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              👥 Clientes
            </h1>
            <p className="text-slate-500 mt-1">
              Base de datos de clientes RAPIZZA.
            </p>
          </div>
          <button
            onClick={abrirCrear}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            + Nuevo cliente
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre, cédula o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full max-w-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="bg-white rounded-2xl shadow overflow-x-auto">
          {cargando ? (
            <p className="text-center py-10 text-gray-400">Cargando...</p>
          ) : filtrados.length === 0 ? (
            <p className="text-center py-10 text-gray-400">No hay clientes.</p>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                <tr>
                  {[
                    "Cédula",
                    "Nombre",
                    "Teléfono",
                    "Dirección",
                    "Zona",
                    "Acciones",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.map((c) => (
                  <tr key={c.cedula} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono">{c.cedula}</td>
                    <td className="px-4 py-3 font-medium">{c.nombre}</td>
                    <td className="px-4 py-3">{c.telefono}</td>
                    <td className="px-4 py-3">{c.direccion}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {c.zona_cobertura}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => abrirEditar(c)}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Editar
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
                {edicion ? "Editar cliente" : "Nuevo cliente"}
              </h2>
              <form onSubmit={handleGuardar} className="space-y-4">
                {[
                  {
                    label: "Cédula",
                    key: "cedula",
                    type: "text",
                    disabled: edicion,
                  },
                  { label: "Nombre completo", key: "nombre", type: "text" },
                  { label: "Teléfono", key: "telefono", type: "text" },
                  { label: "Dirección", key: "direccion", type: "text" },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      disabled={f.disabled}
                      value={form[f.key]}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                      className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${f.disabled ? "bg-gray-100" : ""}`}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zona de cobertura
                  </label>
                  <select
                    value={form.zona_cobertura}
                    onChange={(e) =>
                      setForm({ ...form, zona_cobertura: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona una zona</option>
                    {ZONAS.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
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
                    className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                  >
                    {edicion ? "Guardar cambios" : "Registrar cliente"}
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

export default Clientes;
