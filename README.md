# RAPIZZA Ltda. — Sistema de Gestión de Pedidos

**Programación II — Cliente/Servidor · Universidad Libre Seccional Pereira · Facultad de Ingeniería · 2026-1**

Sistema web Full Stack para la gestión operativa de RAPIZZA Ltda.: pedidos telefónicos, asignación de repartidores, control de entregas y cuentas de cobro por tardanza.

---

## Tecnologías

| Capa          | Tecnología                                              |
| ------------- | ------------------------------------------------------- |
| Frontend      | React 18 + Vite + TailwindCSS + Axios + React Router v6 |
| Backend       | Node.js + Express + bcrypt + JWT                        |
| Base de datos | MySQL 8 (7 tablas, normalización 3FN)                   |
| Alertas       | SweetAlert2                                             |
| Diseño UI     | Google Stitch                                           |

---

## Requisitos previos

| Herramienta | Versión mínima |
| ----------- | -------------- |
| Node.js     | v18.x LTS      |
| npm         | v9.x           |
| MySQL       | v8.x           |

---

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Parcial2_ProgramacionII
```

### 2. Crear la base de datos

Desde CMD (no PowerShell) o MySQL Workbench:

```bash
mysql -u root -p < database/schema.sql
```

### 3. Generar hashes y cargar datos de prueba

```bash
cd database
npm install bcrypt
node generar_hashes.js
```

Copia los hashes generados en `database/seeds.sql` reemplazando los valores del campo `password`. Luego carga los seeds:

```bash
mysql -u root -p rapizza_db < seeds.sql
cd ..
```

### 4. Configurar el Backend

```bash
cd backend
cp .env.example .env
```

Edita el `.env` con tus credenciales:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password_de_mysql
DB_NAME=rapizza_db
JWT_SECRET=un_secreto_largo_y_seguro_aqui
PORT=3001
```

Instala dependencias y arranca:

```bash
npm install
npm run dev
```

Debes ver:

```
Backend corriendo en http://localhost:3001
Conexión a MySQL exitosa
```

### 5. Configurar el Frontend

Abre una **segunda terminal**:

```bash
cd frontend
npm install
npm run dev
```

Debes ver:

```
VITE v5.x  ready
➜  Local: http://localhost:5173
```

Abre el navegador en **http://localhost:5173**

---

## Estructura del proyecto

```
Parcial2_ProgramacionII/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx              ← Barra de navegación reutilizable
│       │   ├── PrivateRoute.jsx        ← Protección de rutas por rol
│       │   ├── dashboard/
│       │   │   ├── StatCard.jsx        ← Tarjeta de estadística
│       │   │   └── ModuloCard.jsx      ← Botón de módulo
│       │   └── pedidos/
│       │       ├── TablaPedidos.jsx    ← Tabla de pedidos con acciones
│       │       └── ModalNuevoPedido.jsx← Formulario de creación
│       ├── context/
│       │   └── AuthContext.jsx         ← Estado global de sesión
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Pedidos.jsx
│       │   ├── Clientes.jsx
│       │   ├── Productos.jsx
│       │   ├── Empleados.jsx
│       │   └── CuentasCobro.jsx
│       └── services/
│           ├── api.js                  ← Instancia Axios con interceptor JWT
│           ├── authService.js
│           └── rapizzaService.js       ← Servicios por módulo
├── backend/
│   ├── config/db.js                    ← Pool de conexiones MySQL
│   ├── controllers/
│   │   ├── authController.js           ← Register, login, me
│   │   ├── pedidoController.js         ← Lógica de negocio central
│   │   └── rapizzaController.js        ← Clientes, productos, empleados, cuentas
│   ├── middleware/
│   │   ├── verifyToken.js              ← Validación de JWT
│   │   └── checkRole.js               ← Control de acceso por rol
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── pedidoRoutes.js
│   │   └── rapizzaRoutes.js
│   ├── .env.example
│   └── server.js
├── database/
│   ├── schema.sql                      ← Creación de las 7 tablas
│   ├── seeds.sql                       ← Datos de prueba (1 despachador, 3 chefs, 7 repartidores)
│   ├── generar_hashes.js              ← Generador de hashes bcrypt
│   └── er_diagram.png                 ← Diagrama Entidad-Relación
├── docs/
│   ├── arquitectura.pdf               ← Documentación de arquitectura
│   └── manual_usuario.pdf             ← Manual de uso
└── README.md
```

---

## Usuarios de prueba

| Usuario      | Contraseña   | Rol         |
| ------------ | ------------ | ----------- |
| admin        | Rapizza2026! | admin       |
| despachador1 | Rapizza2026! | despachador |
| chef1        | Rapizza2026! | chef        |
| chef2        | Rapizza2026! | chef        |
| chef3        | Rapizza2026! | chef        |
| rep1         | Rapizza2026! | repartidor  |
| rep2         | Rapizza2026! | repartidor  |
| rep3         | Rapizza2026! | repartidor  |
| rep4         | Rapizza2026! | repartidor  |
| rep5         | Rapizza2026! | repartidor  |
| rep6         | Rapizza2026! | repartidor  |
| rep7         | Rapizza2026! | repartidor  |

> ⚠️ Regenera los hashes antes de la sustentación con `node database/generar_hashes.js`

---

## Endpoints principales de la API

| Método | Endpoint                            | Descripción            | Rol requerido |
| ------ | ----------------------------------- | ---------------------- | ------------- |
| POST   | /api/auth/login                     | Iniciar sesión         | Público       |
| POST   | /api/auth/register                  | Registrar usuario      | Público       |
| GET    | /api/auth/me                        | Verificar sesión       | JWT           |
| GET    | /api/pedidos                        | Listar pedidos         | JWT           |
| POST   | /api/pedidos                        | Crear pedido           | despachador   |
| PUT    | /api/pedidos/:id/asignar-repartidor | Asignar repartidor     | despachador   |
| PUT    | /api/pedidos/:id/entregar           | Registrar entrega      | repartidor    |
| DELETE | /api/pedidos/:id                    | Eliminar pedido        | admin         |
| GET    | /api/pedidos/estadisticas           | Estadísticas dashboard | despachador   |
| GET    | /api/clientes                       | Listar clientes        | JWT           |
| POST   | /api/clientes                       | Crear cliente          | despachador   |
| GET    | /api/productos                      | Listar productos       | JWT           |
| POST   | /api/productos                      | Crear producto         | admin         |
| GET    | /api/empleados                      | Listar empleados       | JWT           |
| GET    | /api/cuentas-cobro                  | Ver cuentas tardías    | despachador   |

---

## Lógica de negocio clave

- Si la entrega supera los **30 minutos** desde `hora_salida`, el sistema cambia el estado a `cuenta_cobro` y genera automáticamente una cuenta de cobro al repartidor responsable
- Si llega a tiempo → estado `pagado`
- El **despachador** crea pedidos y asigna repartidores
- El **repartidor** solo registra la hora de entrega
- El **chef** tiene acceso de solo lectura
- El **admin** tiene acceso completo a todos los módulos

---
