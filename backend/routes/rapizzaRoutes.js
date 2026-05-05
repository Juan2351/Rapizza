const express = require('express');
const router  = express.Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole   = require('../middleware/checkRole');
const {
  getClientes, createCliente, updateCliente,
  getProductos, createProducto, updateProducto, deleteProducto,
  getEmpleados, createEmpleado, updateEmpleado,
  getCuentasCobro, marcarCuentaPagada,
} = require('../controllers/rapizzaController');

// ── CLIENTES ─────────────────────────────────────────────────
router.get('/clientes',           verifyToken,                              getClientes);
router.post('/clientes',          verifyToken, checkRole('admin','despachador'), createCliente);
router.put('/clientes/:cedula',   verifyToken, checkRole('admin','despachador'), updateCliente);

// ── PRODUCTOS ─────────────────────────────────────────────────
router.get('/productos',          verifyToken,                              getProductos);
router.post('/productos',         verifyToken, checkRole('admin'),          createProducto);
router.put('/productos/:codigo',  verifyToken, checkRole('admin'),          updateProducto);
router.delete('/productos/:codigo', verifyToken, checkRole('admin'),        deleteProducto);

// ── EMPLEADOS ─────────────────────────────────────────────────
router.get('/empleados',          verifyToken,                              getEmpleados);
router.post('/empleados',         verifyToken, checkRole('admin'),          createEmpleado);
router.put('/empleados/:id',      verifyToken, checkRole('admin'),          updateEmpleado);

// ── CUENTAS DE COBRO ──────────────────────────────────────────
router.get('/cuentas-cobro',          verifyToken, checkRole('admin','despachador'), getCuentasCobro);
router.put('/cuentas-cobro/:id/pagar', verifyToken, checkRole('admin','despachador'), marcarCuentaPagada);

module.exports = router;
