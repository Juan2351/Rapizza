import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, usuario, rol, imagen }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Mientras verifica sesión al iniciar

  // Al montar: recuperar token guardado y verificar sesión
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (usuario, password) => {
    console.log("Intentando login con:", { usuario, password });
    const data = await authService.login(usuario, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.id,
        usuario: data.usuario,
        rol: data.rol,
        imagen: data.imagen,
      }),
    );
    setToken(data.token);
    setUser({
      id: data.id,
      usuario: data.usuario,
      rol: data.rol,
      imagen: data.imagen,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};
