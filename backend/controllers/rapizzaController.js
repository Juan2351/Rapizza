const db = require('../config/db');

// ════════════════════════════════════════════════════════════
// CLIENTES
// ════════════════════════════════════════════════════════════

const getClientes = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clientes ORDER BY nombre');
    res.status(200).json({ success: true, data: rows, message: 'OK' });
  } catch (e) {
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const createCliente = async (req, res) => {
  try {
    const { cedula, nombre, telefono, direccion, zona_cobertura } = req.body;
    if (!cedula || !nombre || !telefono || !direccion || !zona_cobertura) {
      return res.status(400).json({ success: false, data: null, message: 'Todos los campos son obligatorios' });
    }
    await db.query(
      'INSERT INTO clientes (cedula, nombre, telefono, direccion, zona_cobertura) VALUES (?,?,?,?,?)',
      [cedula, nombre, telefono, direccion, zona_cobertura]
    );
    res.status(201).json({ success: true, data: { cedula }, message: 'Cliente registrado correctamente' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, data: null, message: 'Ya existe un cliente con esa cédula' });
    }
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const updateCliente = async (req, res) => {
  try {
    const { nombre, telefono, direccion, zona_cobertura } = req.body;
    const [result] = await db.query(
      'UPDATE clientes SET nombre=?, telefono=?, direccion=?, zona_cobertura=? WHERE cedula=?',
      [nombre, telefono, direccion, zona_cobertura, req.params.cedula]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Cliente no encontrado' });
    }
    res.status(200).json({ success: true, data: null, message: 'Cliente actualizado' });
  } catch (e) {
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// ════════════════════════════════════════════════════════════
// PRODUCTOS
// ════════════════════════════════════════════════════════════

const getProductos = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM productos WHERE activo = TRUE ORDER BY nombre');
    res.status(200).json({ success: true, data: rows, message: 'OK' });
  } catch (e) {
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const createProducto = async (req, res) => {
  try {
    const { codigo, nombre, valor_unitario } = req.body;
    if (!codigo || !nombre || valor_unitario === undefined) {
      return res.status(400).json({ success: false, data: null, message: 'Todos los campos son obligatorios' });
    }
    await db.query(
      'INSERT INTO productos (codigo, nombre, valor_unitario) VALUES (?,?,?)',
      [codigo, nombre, valor_unitario]
    );
    res.status(201).json({ success: true, data: { codigo }, message: 'Producto creado correctamente' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, data: null, message: 'Ya existe un producto con ese código' });
    }
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const updateProducto = async (req, res) => {
  try {
    const { nombre, valor_unitario } = req.body;
    const [result] = await db.query(
      'UPDATE productos SET nombre=?, valor_unitario=? WHERE codigo=?',
      [nombre, valor_unitario, req.params.codigo]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Producto no encontrado' });
    }
    res.status(200).json({ success: true, data: null, message: 'Producto actualizado' });
  } catch (e) {
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const deleteProducto = async (req, res) => {
  try {
    // Soft delete para no romper historial de pedidos
    await db.query('UPDATE productos SET activo = FALSE WHERE codigo = ?', [req.params.codigo]);
    res.status(200).json({ success: true, data: null, message: 'Producto desactivado' });
  } catch (e) {
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// ════════════════════════════════════════════════════════════
// EMPLEADOS
// ════════════════════════════════════════════════════════════

const getEmpleados = async (req, res) => {
  try {
    const { tipo } = req.query; // ?tipo=repartidor
    let sql = `
      SELECT e.*, u.usuario, u.rol AS rol_usuario
      FROM empleados e
      LEFT JOIN usuarios u ON u.id = e.id_usuario
      WHERE e.activo = TRUE
    `;
    const params = [];
    if (tipo) { sql += ' AND e.tipo = ?'; params.push(tipo); }
    sql += ' ORDER BY e.nombre';

    const [rows] = await db.query(sql, params);
    res.status(200).json({ success: true, data: rows, message: 'OK' });
  } catch (e) {
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const createEmpleado = async (req, res) => {
  try {
    const { nombre, tipo } = req.body;
    if (!nombre || !tipo) {
      return res.status(400).json({ success: false, data: null, message: 'nombre y tipo son obligatorios' });
    }
    const [result] = await db.query(
      'INSERT INTO empleados (nombre, tipo) VALUES (?,?)',
      [nombre, tipo]
    );
    res.status(201).json({ success: true, data: { id_empleado: result.insertId }, message: 'Empleado creado' });
  } catch (e) {
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const updateEmpleado = async (req, res) => {
  try {
    const { nombre, tipo, activo } = req.body;
    const [result] = await db.query(
      'UPDATE empleados SET nombre=?, tipo=?, activo=? WHERE id_empleado=?',
      [nombre, tipo, activo ?? true, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Empleado no encontrado' });
    }
    res.status(200).json({ success: true, data: null, message: 'Empleado actualizado' });
  } catch (e) {
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// ════════════════════════════════════════════════════════════
// CUENTAS DE COBRO
// ════════════════════════════════════════════════════════════

const getCuentasCobro = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT cc.*, e.nombre AS repartidor_nombre,
             p.fecha, p.valor_total AS valor_pedido
      FROM cuentas_cobro cc
      JOIN empleados e ON e.id_empleado = cc.id_repartidor
      JOIN pedidos   p ON p.numero      = cc.numero_pedido
      ORDER BY cc.fecha_emision DESC
    `);
    res.status(200).json({ success: true, data: rows, message: 'OK' });
  } catch (e) {
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

const marcarCuentaPagada = async (req, res) => {
  try {
    const [result] = await db.query(
      'UPDATE cuentas_cobro SET pagada = TRUE WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Cuenta de cobro no encontrada' });
    }
    res.status(200).json({ success: true, data: null, message: 'Cuenta marcada como pagada' });
  } catch (e) {
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

module.exports = {
  getClientes, createCliente, updateCliente,
  getProductos, createProducto, updateProducto, deleteProducto,
  getEmpleados, createEmpleado, updateEmpleado,
  getCuentasCobro, marcarCuentaPagada,
};
