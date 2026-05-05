/**
 * ModuloCard — Botón de acceso a un módulo del Dashboard.
 * Recibe: label, icon, desc, ruta, bg, iconBg, onClick
 */
const ModuloCard = ({ label, icon, desc, bg, iconBg, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-3 p-6 bg-white
      rounded-xl border shadow-sm hover:shadow-md transition-all text-center ${bg}`}
  >
    <div
      className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${iconBg}`}
    >
      {icon}
    </div>
    <div>
      <p className="font-bold text-slate-800 text-sm">{label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
    </div>
  </button>
);

export default ModuloCard;
