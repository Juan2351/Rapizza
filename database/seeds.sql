-- ============================================================
-- RAPIZZA Ltda. — Datos de prueba (seeds)
-- Estructura según enunciado: 1 despachador, 3 chefs, 7 repartidores
-- ============================================================

USE rapizza_db;

-- ── Usuarios del sistema ──────────────────────────────────────
-- ⚠️ IMPORTANTE: Antes de usar en producción o sustentación,
-- regenera los hashes con: node database/generar_hashes.js
-- El hash de abajo corresponde a la contraseña: Rapizza2026!
INSERT INTO usuarios (usuario, password, rol) VALUES
  ('admin',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
  ('despachador1','$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'despachador'),
  ('chef1',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'chef'),
  ('chef2',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'chef'),
  ('chef3',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'chef'),
  ('rep1',        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'repartidor'),
  ('rep2',        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'repartidor'),
  ('rep3',        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'repartidor'),
  ('rep4',        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'repartidor'),
  ('rep5',        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'repartidor'),
  ('rep6',        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'repartidor'),
  ('rep7',        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'repartidor');

-- ── Empleados (1 despachador, 3 chefs, 7 repartidores) ────────
-- id_usuario referencia al orden de inserción arriba:
-- admin=1, despachador1=2, chef1=3, chef2=4, chef3=5, rep1=6...rep7=12
INSERT INTO empleados (nombre, tipo, id_usuario) VALUES
  ('Sandra Ríos',      'despachador', 2),
  ('Carlos Mendoza',   'chef',        3),
  ('María López',      'chef',        4),
  ('Luis García',      'chef',        5),
  ('Pedro Ramírez',    'repartidor',  6),
  ('Ana Torres',       'repartidor',  7),
  ('Juan Pérez',       'repartidor',  8),
  ('Sofía Vargas',     'repartidor',  9),
  ('Miguel Herrera',   'repartidor',  10),
  ('Laura Gómez',      'repartidor',  11),
  ('Diego Castro',     'repartidor',  12);

-- ── Clientes ──────────────────────────────────────────────────
INSERT INTO clientes (cedula, nombre, telefono, direccion, zona_cobertura) VALUES
  ('1001234567', 'Andrés Martínez', '3101234567', 'Calle 15 # 8-22',          'Zona Norte'),
  ('1009876543', 'Valentina Cruz',  '3209876543', 'Carrera 7 # 20-15',        'Zona Sur'),
  ('1005551234', 'Roberto Silva',   '3005551234', 'Av. Las Américas # 3-40',  'Zona Centro'),
  ('1007778888', 'Carolina Duque',  '3157778888', 'Calle 23 # 12-10',         'Zona Occidente');

-- ── Productos (pizzas por tipo/tamaño + aditivos) ─────────────
INSERT INTO productos (codigo, nombre, valor_unitario) VALUES
  ('PZZ-001', 'Pizza Margarita Personal',    18000),
  ('PZZ-002', 'Pizza Margarita Familiar',    32000),
  ('PZZ-003', 'Pizza Hawaiana Personal',     20000),
  ('PZZ-004', 'Pizza Hawaiana Familiar',     35000),
  ('PZZ-005', 'Pizza Pepperoni Personal',    22000),
  ('PZZ-006', 'Pizza Pepperoni Familiar',    38000),
  ('PZZ-007', 'Pizza Vegetariana Personal',  19000),
  ('PZZ-008', 'Pizza Vegetariana Familiar',  34000),
  ('ADT-001', 'Adición extra queso',          3000),
  ('ADT-002', 'Adición champiñones',          2500),
  ('ADT-003', 'Adición jalapeños',            2000),
  ('ADT-004', 'Gaseosa 250ml',                2500),
  ('ADT-005', 'Agua 500ml',                   1500);

-- ── Pedidos de prueba ─────────────────────────────────────────

-- Pedido 1: entregado a tiempo (25 min) → pagado
INSERT INTO pedidos (fecha, hora_salida, hora_entrega, estado_pago, valor_total,
  cedula_cliente, id_despachador, id_chef, id_repartidor)
VALUES ('2026-04-28', '18:00:00', '18:25:00', 'pagado', 40000,
  '1001234567', 1, 2, 5);

INSERT INTO detalle_pedido (numero_pedido, codigo_producto, cantidad, precio_unitario, subtotal)
VALUES (1, 'PZZ-002', 1, 32000, 32000),
       (1, 'ADT-004', 2,  2500,  5000),
       (1, 'ADT-001', 1,  3000,  3000);

-- Pedido 2: entregado tarde (40 min) → cuenta de cobro
INSERT INTO pedidos (fecha, hora_salida, hora_entrega, estado_pago, valor_total,
  cedula_cliente, id_despachador, id_chef, id_repartidor)
VALUES ('2026-04-28', '19:00:00', '19:40:00', 'cuenta_cobro', 59000,
  '1009876543', 1, 3, 6);

INSERT INTO detalle_pedido (numero_pedido, codigo_producto, cantidad, precio_unitario, subtotal)
VALUES (2, 'PZZ-006', 1, 38000, 38000),
       (2, 'PZZ-001', 1, 18000, 18000),
       (2, 'ADT-005', 2,  1500,  3000);

INSERT INTO cuentas_cobro (numero_pedido, id_repartidor, valor)
VALUES (2, 6, 59000);

-- Pedido 3: pendiente (sin hora_entrega aún)
INSERT INTO pedidos (fecha, hora_salida, estado_pago, valor_total,
  cedula_cliente, id_despachador, id_chef, id_repartidor)
VALUES ('2026-04-29', '20:00:00', 'pendiente', 37500,
  '1005551234', 1, 2, 7);

INSERT INTO detalle_pedido (numero_pedido, codigo_producto, cantidad, precio_unitario, subtotal)
VALUES (3, 'PZZ-004', 1, 35000, 35000),
       (3, 'ADT-002', 1,  2500,  2500);
