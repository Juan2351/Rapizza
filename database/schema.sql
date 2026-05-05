-- ============================================================
-- RAPIZZA Ltda. — Schema de base de datos
-- Universidad Libre Seccional Pereira · Programación II · 2026-1
-- Estructura según enunciado:
--   1 despachador, 3 chefs, 7 repartidores
-- ============================================================

CREATE DATABASE IF NOT EXISTS rapizza_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rapizza_db;

-- ── 1. USUARIOS ──────────────────────────────────────────────
-- RF-01 obligatorio: autenticación con bcrypt + JWT
CREATE TABLE IF NOT EXISTS usuarios (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  usuario    VARCHAR(50)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,           -- hash bcrypt (mínimo 10 rounds)
  rol        ENUM('admin','despachador','chef','repartidor') NOT NULL DEFAULT 'repartidor',
  foto       VARCHAR(255) DEFAULT NULL,        -- ruta local o URL de foto de perfil
  creado_en  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ── 2. EMPLEADOS ─────────────────────────────────────────────
-- Personal según enunciado: 1 despachador, 3 chefs, 7 repartidores
CREATE TABLE IF NOT EXISTS empleados (
  id_empleado  INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL,
  tipo         ENUM('despachador','chef','repartidor') NOT NULL,
  id_usuario   INT UNIQUE DEFAULT NULL,        -- relación 1:1 con usuarios
  activo       BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- ── 3. CLIENTES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clientes (
  cedula         VARCHAR(20)  PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  telefono       VARCHAR(20)  NOT NULL,
  direccion      VARCHAR(200) NOT NULL,
  zona_cobertura VARCHAR(50)  NOT NULL
);

-- ── 4. PRODUCTOS ─────────────────────────────────────────────
-- Pizzas (tipos y tamaños) y aditivos
CREATE TABLE IF NOT EXISTS productos (
  codigo         VARCHAR(20)  PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  valor_unitario DECIMAL(10,2) NOT NULL CHECK (valor_unitario >= 0),
  activo         BOOLEAN DEFAULT TRUE
);

-- ── 5. PEDIDOS ───────────────────────────────────────────────
-- Eje central del sistema
CREATE TABLE IF NOT EXISTS pedidos (
  numero           INT AUTO_INCREMENT PRIMARY KEY,
  fecha            DATE NOT NULL,
  hora_salida      TIME NOT NULL,
  hora_entrega     TIME DEFAULT NULL,          -- NULL hasta que el repartidor entregue
  estado_pago      ENUM('pendiente','pagado','cuenta_cobro') NOT NULL DEFAULT 'pendiente',
  valor_total      DECIMAL(10,2) DEFAULT 0.00,
  cedula_cliente   VARCHAR(20) NOT NULL,
  id_despachador   INT DEFAULT NULL,
  id_chef          INT DEFAULT NULL,
  id_repartidor    INT DEFAULT NULL,
  creado_en        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cedula_cliente) REFERENCES clientes(cedula),
  FOREIGN KEY (id_despachador) REFERENCES empleados(id_empleado),
  FOREIGN KEY (id_chef)        REFERENCES empleados(id_empleado),
  FOREIGN KEY (id_repartidor)  REFERENCES empleados(id_empleado)
);

-- ── 6. DETALLE_PEDIDO ────────────────────────────────────────
-- Tabla intermedia N:M entre Pedidos y Productos
CREATE TABLE IF NOT EXISTS detalle_pedido (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  numero_pedido    INT NOT NULL,
  codigo_producto  VARCHAR(20) NOT NULL,
  cantidad         INT NOT NULL CHECK (cantidad > 0),
  observacion      VARCHAR(255) DEFAULT NULL,
  precio_unitario  DECIMAL(10,2) NOT NULL,     -- precio al momento del pedido
  subtotal         DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (numero_pedido)   REFERENCES pedidos(numero)   ON DELETE CASCADE,
  FOREIGN KEY (codigo_producto) REFERENCES productos(codigo)
);

-- ── 7. CUENTAS_COBRO ─────────────────────────────────────────
-- Generada cuando entrega > 30 min: el repartidor paga al despachador
CREATE TABLE IF NOT EXISTS cuentas_cobro (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  numero_pedido  INT NOT NULL UNIQUE,          -- una cuenta por pedido tardío
  id_repartidor  INT NOT NULL,
  valor          DECIMAL(10,2) NOT NULL,
  pagada         BOOLEAN DEFAULT FALSE,
  fecha_emision  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (numero_pedido) REFERENCES pedidos(numero),
  FOREIGN KEY (id_repartidor) REFERENCES empleados(id_empleado)
);
