import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import logoImg from "../assets/logo.jpg";

const LOGO_IMG = logoImg;

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async () => {
    if (!usuario || !password) {
      Swal.fire(
        "Campos incompletos",
        "Por favor ingresa usuario y contraseña.",
        "warning",
      );
      return;
    }
    setCargando(true);
    try {
      await login(usuario, password);
      navigate("/dashboard");
    } catch (error) {
      const msg = error.response?.data?.message || "Credenciales inválidas";
      Swal.fire("Error", msg, "error");
    } finally {
      setCargando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-[#fff8f7] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header rojo */}
          <div className="bg-red-600 px-8 py-8 text-center">
            <img
              src={LOGO_IMG}
              alt="Logo RAPIZZA"
              className="w-20 h-20 object-contain mx-auto mb-4 rounded-2xl shadow-lg"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              RAPIZZA Ltda.
            </h1>
            <p className="text-red-200 text-sm mt-1">
              Sistema de gestión de pedidos
            </p>
          </div>

          {/* Formulario */}
          <div className="px-8 py-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ingresa tu usuario"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={cargando}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-3 rounded-xl transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {cargando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Ingresar"
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 RAPIZZA Ltda. • Panel Administrativo
        </p>
      </div>
    </div>
  );
};

export default Login;
