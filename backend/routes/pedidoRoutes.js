const express = require('express');
const router  = express.Router();
const verifyToken = require('../middleware/verifyToken');
const checkRole   = require('../middleware/checkRole');
const {
  getAll, getById, create,
  asignarRepartidor, registrarEntrega,
  remove, estadisticas,
} = require('../controllers/pedidoController');

// Estadísticas del dashboard (admin y despachador)
router.get('/estadisticas', verifyToken, checkRole('admin', 'despachador'), estadisticas);

// CRUD general
router.get('/',    verifyToken, getAll);
router.get('/:id', verifyToken, getById);

// Crear pedido — solo despachador
router.post('/', verifyToken, checkRole('admin', 'despachador'), create);

// Asignar repartidor — solo despachador
router.put('/:id/asignar-repartidor', verifyToken, checkRole('admin', 'despachador'), asignarRepartidor);

// Registrar entrega — repartidor asignado al pedido
router.put('/:id/entregar', verifyToken, checkRole('admin', 'despachador', 'repartidor'), registrarEntrega);

// Eliminar — solo admin
router.delete('/:id', verifyToken, checkRole('admin'), remove);

module.exports = router;
