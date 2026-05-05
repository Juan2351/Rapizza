import api from './api';

// ── PEDIDOS ───────────────────────────────────────────────────
export const pedidoService = {
  getAll:             ()         => api.get('/pedidos').then(r => r.data.data),
  getById:            (id)       => api.get(`/pedidos/${id}`).then(r => r.data.data),
  create:             (data)     => api.post('/pedidos', data).then(r => r.data),
  asignarRepartidor:  (id, data) => api.put(`/pedidos/${id}/asignar-repartidor`, data).then(r => r.data),
  registrarEntrega:   (id, data) => api.put(`/pedidos/${id}/entregar`, data).then(r => r.data),
  remove:             (id)       => api.delete(`/pedidos/${id}`).then(r => r.data),
  estadisticas:       ()         => api.get('/pedidos/estadisticas').then(r => r.data.data),
};

// ── CLIENTES ──────────────────────────────────────────────────
export const clienteService = {
  getAll:  ()             => api.get('/clientes').then(r => r.data.data),
  create:  (data)         => api.post('/clientes', data).then(r => r.data),
  update:  (cedula, data) => api.put(`/clientes/${cedula}`, data).then(r => r.data),
};

// ── PRODUCTOS ─────────────────────────────────────────────────
export const productoService = {
  getAll:  ()              => api.get('/productos').then(r => r.data.data),
  create:  (data)          => api.post('/productos', data).then(r => r.data),
  update:  (codigo, data)  => api.put(`/productos/${codigo}`, data).then(r => r.data),
  remove:  (codigo)        => api.delete(`/productos/${codigo}`).then(r => r.data),
};

// ── EMPLEADOS ─────────────────────────────────────────────────
export const empleadoService = {
  getAll:       (tipo)   => api.get('/empleados', { params: { tipo } }).then(r => r.data.data),
  getRepartidores: ()    => api.get('/empleados', { params: { tipo: 'repartidor' } }).then(r => r.data.data),
  getChefs:        ()    => api.get('/empleados', { params: { tipo: 'chef' } }).then(r => r.data.data),
  create:       (data)   => api.post('/empleados', data).then(r => r.data),
  update:       (id, data) => api.put(`/empleados/${id}`, data).then(r => r.data),
};

// ── CUENTAS DE COBRO ──────────────────────────────────────────
export const cuentaCobroService = {
  getAll:   ()   => api.get('/cuentas-cobro').then(r => r.data.data),
  marcarPagada: (id) => api.put(`/cuentas-cobro/${id}/pagar`).then(r => r.data),
};
