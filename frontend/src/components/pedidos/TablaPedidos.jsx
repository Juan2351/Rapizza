/**
 * TablaPedidos — Tabla de pedidos con acciones por rol.
 * Recibe: pedidos, esAdmin, esDespachador, esRepartidor,
 *         onAsignar, onEntregar, onEliminar
 */

const ESTADO_COLOR = {
  pendiente: "bg-yellow-100 text-yellow-700",
  pagado: "bg-green-100  text-green-700",
  cuenta_cobro: "bg-red-100    text-red-700",
  gratis: "bg-purple-100 text-purple-700",
};

const TablaPedidos = ({
  pedidos,
  esAdmin,
  esDespachador,
  esRepartidor,
  onAsignar,
  onEntregar,
  onEliminar,
}) => {
  if (pedidos.length === 0) {
    return (
      <p className="text-center py-10 text-slate-400">
        No hay pedidos para mostrar.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {[
              "#",
              "Cliente",
              "Fecha",
              "Salida",
              "Entrega",
              "Repartidor",
              "Total",
              "Estado",
              "Acciones",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {pedidos.map((p) => (
            <tr key={p.numero} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono font-bold text-slate-700">
                #{p.numero}
              </td>
              <td className="px-4 py-3 font-medium text-slate-800">
                {p.cliente_nombre}
              </td>
              <td className="px-4 py-3 text-slate-500">{p.fecha}</td>
              <td className="px-4 py-3 text-slate-500">{p.hora_salida}</td>
              <td className="px-4 py-3 text-slate-500">
                {p.hora_entrega || "—"}
              </td>
              <td className="px-4 py-3 text-slate-500">
                {p.repartidor || "—"}
              </td>
              <td className="px-4 py-3 font-semibold text-slate-800">
                ${Number(p.valor_total).toLocaleString("es-CO")}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold ${ESTADO_COLOR[p.estado_pago]}`}
                >
                  {p.estado_pago}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {esDespachador &&
                    p.estado_pago === "pendiente" &&
                    !p.repartidor && (
                      <button
                        onClick={() => onAsignar(p)}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Asignar
                      </button>
                    )}
                  {esRepartidor &&
                    p.estado_pago === "pendiente" &&
                    p.repartidor && (
                      <button
                        onClick={() => onEntregar(p)}
                        className="text-xs font-semibold text-green-600 hover:underline"
                      >
                        Entregar
                      </button>
                    )}
                  {esAdmin && (
                    <button
                      onClick={() => onEliminar(p.numero)}
                      className="text-xs font-semibold text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TablaPedidos;
