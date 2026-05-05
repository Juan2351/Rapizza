const db = require('../config/db');

// ── GET /api/pedidos — Listar todos con detalles ──────────────
const getAll = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.numero, p.fecha, p.hora_salida, p.hora_entrega,
             p.estado_pago, p.valor_total,
             c.nombre   AS cliente_nombre,  c.cedula   AS cliente_cedula,
             c.telefono AS cliente_telefono, c.direccion,
             d.nombre   AS despachador, ch.nombre AS chef, r.nombre AS repartidor
      FROM pedidos p
      JOIN clientes  c  ON c.cedula        = p.cedula_cliente
      LEFT JOIN empleados d  ON d.id_empleado  = p.id_despachador
      LEFT JOIN empleados ch ON ch.id_empleado = p.id_chef
      LEFT JOIN empleados r  ON r.id_empleado  = p.id_repartidor
      ORDER BY p.numero DESC
    `);
    res.status(200).json({ success: true, data: rows, message: 'OK' });
  } catch (error) {
    console.error('Error en getAll pedidos:', error);
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// ── GET /api/pedidos/:id — Obtener uno con su detalle ─────────
const getById = async (req, res) => {
  try {
    const [pedido] = await db.query(`
      SELECT p.*, c.nombre AS cliente_nombre, c.telefono, c.direccion, c.zona_cobertura,
             d.nombre AS despachador, ch.nombre AS chef, r.nombre AS repartidor
      FROM pedidos p
      JOIN clientes  c  ON c.cedula        = p.cedula_cliente
      LEFT JOIN empleados d  ON d.id_empleado  = p.id_despachador
      LEFT JOIN empleados ch ON ch.id_empleado = p.id_chef
      LEFT JOIN empleados r  ON r.id_empleado  = p.id_repartidor
      WHERE p.numero = ?
    `, [req.params.id]);

    if (pedido.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Pedido no encontrado' });
    }

    const [detalle] = await db.query(`
      SELECT dp.*, pr.nombre AS producto_nombre
      FROM detalle_pedido dp
      JOIN productos pr ON pr.codigo = dp.codigo_producto
      WHERE dp.numero_pedido = ?
    `, [req.params.id]);

    res.status(200).json({
      success: true,
      data: { ...pedido[0], detalle },
      message: 'OK',
    });
  } catch (error) {
    console.error('Error en getById pedido:', error);
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// ── POST /api/pedidos — Crear pedido con detalle ──────────────
const create = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const {
      fecha, hora_salida, cedula_cliente,
      id_despachador, id_chef,
      detalle = [],  // [{ codigo_producto, cantidad, observacion }]
    } = req.body;

    if (!fecha || !hora_salida || !cedula_cliente || detalle.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        success: false, data: null,
        message: 'Faltan campos obligatorios (fecha, hora_salida, cliente, detalle)',
      });
    }

    // Calcular valor total con precios actuales
    let valor_total = 0;
    const detalleConPrecio = [];

    for (const item of detalle) {
      const [prod] = await conn.query(
        'SELECT codigo, valor_unitario FROM productos WHERE codigo = ? AND activo = TRUE',
        [item.codigo_producto]
      );
      if (prod.length === 0) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({
          success: false, data: null,
          message: `Producto ${item.codigo_producto} no existe o está inactivo`,
        });
      }
      const subtotal = prod[0].valor_unitario * item.cantidad;
      valor_total += subtotal;
      detalleConPrecio.push({
        ...item,
        precio_unitario: prod[0].valor_unitario,
        subtotal,
      });
    }

    // Insertar pedido
    const [result] = await conn.query(
      `INSERT INTO pedidos (fecha, hora_salida, estado_pago, valor_total, cedula_cliente, id_despachador, id_chef)
       VALUES (?, ?, 'pendiente', ?, ?, ?, ?)`,
      [fecha, hora_salida, valor_total, cedula_cliente, id_despachador || null, id_chef || null]
    );

    const numeroPedido = result.insertId;

    // Insertar detalle
    for (const item of detalleConPrecio) {
      await conn.query(
        `INSERT INTO detalle_pedido (numero_pedido, codigo_producto, cantidad, observacion, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [numeroPedido, item.codigo_producto, item.cantidad, item.observacion || null,
         item.precio_unitario, item.subtotal]
      );
    }

    await conn.commit();
    conn.release();

    res.status(201).json({
      success: true,
      data: { numero: numeroPedido, valor_total },
      message: `Pedido #${numeroPedido} creado correctamente`,
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.error('Error en create pedido:', error);
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// ── PUT /api/pedidos/:id/asignar-repartidor ───────────────────
// Solo despachador puede asignar repartidor
const asignarRepartidor = async (req, res) => {
  try {
    const { id_repartidor } = req.body;
    if (!id_repartidor) {
      return res.status(400).json({ success: false, data: null, message: 'id_repartidor requerido' });
    }

    const [result] = await db.query(
      'UPDATE pedidos SET id_repartidor = ? WHERE numero = ? AND estado_pago = ?',
      [id_repartidor, req.params.id, 'pendiente']
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Pedido no encontrado o ya fue despachado' });
    }

    res.status(200).json({ success: true, data: null, message: 'Repartidor asignado correctamente' });
  } catch (error) {
    console.error('Error en asignarRepartidor:', error);
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// ── PUT /api/pedidos/:id/entregar ─────────────────────────────
// El repartidor registra la hora de entrega → el sistema decide el estado
const registrarEntrega = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { hora_entrega } = req.body;
    if (!hora_entrega) {
      await conn.rollback(); conn.release();
      return res.status(400).json({ success: false, data: null, message: 'hora_entrega requerida' });
    }

    const [pedidos] = await conn.query(
      'SELECT * FROM pedidos WHERE numero = ? AND estado_pago = ?',
      [req.params.id, 'pendiente']
    );

    if (pedidos.length === 0) {
      await conn.rollback(); conn.release();
      return res.status(404).json({ success: false, data: null, message: 'Pedido no encontrado o ya entregado' });
    }

    const pedido = pedidos[0];

    // Calcular minutos transcurridos
    const salida   = new Date(`${pedido.fecha}T${pedido.hora_salida}`);
    const entrega  = new Date(`${pedido.fecha}T${hora_entrega}`);
    const minutos  = (entrega - salida) / 60000;

    const nuevoEstado = minutos > 30 ? 'cuenta_cobro' : 'pagado';

    await conn.query(
      'UPDATE pedidos SET hora_entrega = ?, estado_pago = ? WHERE numero = ?',
      [hora_entrega, nuevoEstado, pedido.numero]
    );

    // Si llegó tarde → crear cuenta de cobro automáticamente
    if (nuevoEstado === 'cuenta_cobro' && pedido.id_repartidor) {
      await conn.query(
        `INSERT INTO cuentas_cobro (numero_pedido, id_repartidor, valor)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE valor = VALUES(valor)`,
        [pedido.numero, pedido.id_repartidor, pedido.valor_total]
      );
    }

    await conn.commit();
    conn.release();

    res.status(200).json({
      success: true,
      data: { estado: nuevoEstado, minutos: Math.round(minutos) },
      message: nuevoEstado === 'pagado'
        ? `Entregado a tiempo (${Math.round(minutos)} min). Estado: pagado.`
        : `Entrega tardía (${Math.round(minutos)} min). Se generó cuenta de cobro.`,
    });
  } catch (error) {
    await conn.rollback();
    conn.release();
    console.error('Error en registrarEntrega:', error);
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// ── DELETE /api/pedidos/:id — Solo admin ──────────────────────
const remove = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM pedidos WHERE numero = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Pedido no encontrado' });
    }
    res.status(200).json({ success: true, data: null, message: 'Pedido eliminado' });
  } catch (error) {
    console.error('Error en remove pedido:', error);
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// ── GET /api/pedidos/estadisticas — Dashboard cards ───────────
const estadisticas = async (req, res) => {
  try {
    const [[total]]       = await db.query('SELECT COUNT(*) AS total FROM pedidos');
    const [[tardios]]     = await db.query("SELECT COUNT(*) AS total FROM pedidos WHERE estado_pago = 'cuenta_cobro'");
    const [[pendientes]]  = await db.query("SELECT COUNT(*) AS total FROM pedidos WHERE estado_pago = 'pendiente'");
    const [[perdidas]]    = await db.query("SELECT COALESCE(SUM(valor),0) AS total FROM cuentas_cobro WHERE pagada = FALSE");

    res.status(200).json({
      success: true,
      data: {
        total_pedidos:    total.total,
        pedidos_tardios:  tardios.total,
        pedidos_pendientes: pendientes.total,
        perdidas_estimadas: perdidas.total,
      },
      message: 'OK',
    });
  } catch (error) {
    console.error('Error en estadisticas:', error);
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

module.exports = { getAll, getById, create, asignarRepartidor, registrarEntrega, remove, estadisticas };
