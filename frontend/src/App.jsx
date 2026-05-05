import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import Pedidos      from './pages/Pedidos';
import Clientes     from './pages/Clientes';
import Productos    from './pages/Productos';
import Empleados    from './pages/Empleados';
import CuentasCobro from './pages/CuentasCobro';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Pública */}
        <Route path="/login" element={<Login />} />

        {/* Todos los roles autenticados */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/pedidos"   element={<PrivateRoute><Pedidos /></PrivateRoute>} />

        {/* Despachador + Admin */}
        <Route path="/clientes"
          element={<PrivateRoute roles={['admin','despachador']}><Clientes /></PrivateRoute>} />

        {/* Solo Admin */}
        <Route path="/productos"
          element={<PrivateRoute roles={['admin']}><Productos /></PrivateRoute>} />
        <Route path="/empleados"
          element={<PrivateRoute roles={['admin']}><Empleados /></PrivateRoute>} />
        <Route path="/cuentas-cobro"
          element={<PrivateRoute roles={['admin','despachador']}><CuentasCobro /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
