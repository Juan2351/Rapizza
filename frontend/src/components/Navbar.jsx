import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import logoImg from "../assets/logo.jpg";

const LOGO_IMG = logoImg;

const LINKS = [
  {
    label: "Pedidos",
    ruta: "/pedidos",
    roles: ["admin", "despachador", "chef", "repartidor"],
  },
  { label: "Clientes", ruta: "/clientes", roles: ["admin", "despachador"] },
  { label: "Productos", ruta: "/productos", roles: ["admin"] },
  { label: "Cuentas", ruta: "/cuentas-cobro", roles: ["admin", "despachador"] },
  { label: "Empleados", ruta: "/empleados", roles: ["admin"] },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#b70011",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
    });
    if (result.isConfirmed) {
      logout();
      navigate("/login");
    }
  };

  const links = LINKS.filter((l) => l.roles.includes(user?.rol));

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center px-6 py-3 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3"
          >
            <img
              src={LOGO_IMG}
              alt="Logo"
              className="w-9 h-9 object-contain rounded-lg"
              onError={(e) => (e.target.style.display = "none")}
            />
            <span className="text-lg font-black text-red-600 uppercase italic tracking-tighter">
              RAPIZZA Ltda.
            </span>
          </button>
          <nav className="hidden md:flex gap-6">
            {links.map((l) => (
              <button
                key={l.ruta}
                onClick={() => navigate(l.ruta)}
                className={`text-sm font-medium transition-colors pb-0.5 ${
                  location.pathname === l.ruta
                    ? "text-red-600 border-b-2 border-red-600 font-bold"
                    : "text-slate-500 hover:text-red-600"
                }`}
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 font-medium hidden sm:block">
            {user?.usuario}
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 uppercase hidden sm:block">
            {user?.rol}
          </span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-bold rounded-lg transition-all"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
