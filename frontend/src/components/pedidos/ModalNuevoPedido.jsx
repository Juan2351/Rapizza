/**
 * ModalNuevoPedido — Formulario modal para crear un nuevo pedido.
 * Recibe: clientes, chefs, productos, onGuardar, onCerrar
 */
import { useState } from "react";
import Swal from "sweetalert2";

const DETALLE_VACIO = { codigo_producto: "", cantidad: 1, observacion: "" };

const ModalNuevoPedido = ({
  clientes,
  chefs,
  productos,
  onGuardar,
  onCerrar,
}) => {
  const [form, setForm] = useState({
    cedula_cliente: "",
    fecha: "",
    hora_salida: "",
    id_chef: "",
  });
  const [detalle, setDetalle] = useState([{ ...DETALLE_VACIO }]);

  const agregarProducto = () =>
    setDetalle((prev) => [...prev, { ...DETALLE_VACIO }]);

  const quitarProducto = (i) =>
    setDetalle((prev) => prev.filter((_, idx) => idx !== i));

  const cambiarProducto = (i, campo, valor) =>
    setDetalle((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [campo]: valor } : item)),
    );

  const handleSubmit = () => {
    if (!form.cedula_cliente || !form.fecha || !form.hora_salida) {
      Swal.fire(
        "Incompleto",
        "Cliente, fecha y hora de salida son obligatorios.",
        "warning",
      );
      return;
    }
    if (detalle.some((d) => !d.codigo_producto || d.cantidad < 1)) {
      Swal.fire(
        "Incompleto",
        "Completa todos los productos del pedido.",
        "warning",
      );
      return;
    }
    onGuardar({ ...form, detalle });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800">Nuevo Pedido</h2>
          <button
            onClick={onCerrar}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-8 py-6 space-y-5">
          {/* Cliente y Chef */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Cliente
              </label>
              <select
                value={form.cedula_cliente}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cedula_cliente: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
              >
                <option value="">Selecciona un cliente</option>
                {clientes.map((c) => (
                  <option key={c.cedula} value={c.cedula}>
                    {c.nombre} — {c.cedula}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Chef
              </label>
              <select
                value={form.id_chef}
                onChange={(e) =>
                  setForm((f) => ({ ...f, id_chef: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
              >
                <option value="">Selecciona un chef</option>
                {chefs.map((c) => (
                  <option key={c.id_empleado} value={c.id_empleado}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Fecha
              </label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) =>
                  setForm((f) => ({ ...f, fecha: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Hora de salida
              </label>
              <input
                type="time"
                value={form.hora_salida}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hora_salida: e.target.value }))
                }
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
              />
            </div>
          </div>

          {/* Detalle de productos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">
                Productos
              </label>
              <button
                type="button"
                onClick={agregarProducto}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                + Agregar producto
              </button>
            </div>

            <div className="space-y-2">
              {detalle.map((item, i) => (
                <div key={i} className="grid grid-cols-3 gap-2 items-center">
                  <select
                    value={item.codigo_producto}
                    onChange={(e) =>
                      cambiarProducto(i, "codigo_producto", e.target.value)
                    }
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
                  >
                    <option value="">Producto</option>
                    {productos.map((p) => (
                      <option key={p.codigo} value={p.codigo}>
                        {p.nombre} — $
                        {Number(p.valor_unitario).toLocaleString("es-CO")}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) =>
                      cambiarProducto(i, "cantidad", Number(e.target.value))
                    }
                    placeholder="Cant."
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
                  />

                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={item.observacion}
                      onChange={(e) =>
                        cambiarProducto(i, "observacion", e.target.value)
                      }
                      placeholder="Observación"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
                    />
                    {detalle.length > 1 && (
                      <button
                        type="button"
                        onClick={() => quitarProducto(i)}
                        className="text-red-400 hover:text-red-600 font-bold text-xl px-1"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer del modal */}
        <div className="flex justify-end gap-3 px-8 py-5 border-t border-gray-100">
          <button
            type="button"
            onClick={onCerrar}
            className="px-5 py-2.5 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 font-medium transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 text-sm rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition active:scale-95"
          >
            Crear pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalNuevoPedido;
