/**
 * StatCard — Tarjeta de estadística del Dashboard.
 * Recibe: label, valor, sub, subColor, icon, borderColor
 */
const StatCard = ({ label, valor, sub, subColor, icon, borderColor }) => (
  <div
    className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 border-l-4 ${borderColor}`}
  >
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </p>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-3xl font-bold text-slate-900">{valor}</p>
    <p className={`text-xs mt-2 font-medium ${subColor}`}>{sub}</p>
  </div>
);

export default StatCard;
