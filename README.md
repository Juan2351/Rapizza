# RAPIZZA Ltda. — Sistema de Gestión de Pedidos

**Programación II — Cliente/Servidor · Universidad Libre Seccional Pereira · 2026-1**

---

## Requisitos previos

Antes de empezar, asegúrate de tener instalado:

- [Node.js v18 LTS](https://nodejs.org) — al instalar, marca la opción “Add to PATH”
- [MySQL 8](https://dev.mysql.com/downloads/installer/) — guarda la contraseña que pongas durante la instalación
- [Git](https://git-scm.com)

Para verificar que todo está instalado, abre **CMD** y ejecuta:

```
node -v
npm -v
mysql --version
git --version
```

Cada uno debe mostrar un número de versión. Si alguno da error, reinstálalo.

---

## Instalación paso a paso

> **Usa CMD (símbolo del sistema), NO PowerShell.**
> Para abrir CMD: tecla Windows → escribe `cmd` → Enter.

---

### Paso 1 — Clonar el repositorio

```
git clone https://github.com/Juan2351/Rapizza
```

Esto crea una carpeta llamada `Parcial2_ProgramacionII` en el lugar donde estés parado. Para saber dónde estás, ejecuta `cd` solo y Enter — te mostrará la ruta actual.

Entra a la carpeta del proyecto:

```
cd Parcial2_ProgramacionII
```

> A partir de aquí, **todos los comandos se ejecutan desde esta carpeta raíz** a menos que se indique lo contrario.

---

### Paso 2 — Crear la base de datos

Abre MySQL desde CMD (te pedirá tu contraseña de MySQL):

```
mysql -u root -p
```

Una vez dentro, ejecuta estas líneas **una por una** (selecciona, copia y pega cada una):

```sql
CREATE DATABASE IF NOT EXISTS rapizza_db;
exit
```

Ahora carga las tablas:

```
mysql -u root -p rapizza_db < database/schema.sql
```

---

### Paso 3 — Generar contraseñas y cargar datos de prueba

Instala bcrypt temporalmente para generar los hashes:

```
cd database
npm install bcrypt
node generar_hashes.js
cd ..
```

Verás una lista de líneas como esta:

```
('admin', '$2b$10$...hash...', 'admin'),
('despachador1', '$2b$10$...hash...', 'despachador'),
...
```

Abre el archivo `database/seeds.sql` con cualquier editor de texto (Bloc de notas, VS Code, etc.), reemplaza **todos** los valores del campo `password` con los hashes que se generaron, guarda el archivo y luego ejecuta:

```
mysql -u root -p rapizza_db < database/seeds.sql
```

---

### Paso 4 — Configurar el Backend

```
cd backend
copy .env.example .env
```

Abre el archivo `backend/.env` con el Bloc de notas y edita estas dos líneas con tus datos reales:

```
DB_PASSWORD=la_contraseña_que_pusiste_al_instalar_mysql
JWT_SECRET=rapizza2026secreto
```

Guarda el archivo. Luego instala las dependencias y arranca el servidor:

```
npm install
npm run dev
```

Debes ver esto en la pantalla:

```
Backend corriendo en http://localhost:3001
Conexión a MySQL exitosa
```

> **Deja esta ventana de CMD abierta.** Si la cierras, el backend se apaga.

---

### Paso 5 — Configurar el Frontend

Abre una **segunda ventana de CMD** (Windows → `cmd` → Enter) y navega al proyecto:

```
cd Parcial2_ProgramacionII
cd frontend
npm install
npm run dev
```

Debes ver esto:

```
VITE v5.x  ready
➜  Local: http://localhost:5173
```

> **Deja esta ventana abierta también.**

---

### Paso 6 — Abrir la aplicación

Abre tu navegador (Chrome recomendado) y ve a:

```
http://localhost:5173
```

Debes ver la pantalla de login de RAPIZZA.

---

## Usuarios de prueba

Todos tienen la misma contraseña que usaste en `generar_hashes.js`.

| Usuario      | Rol                          |
| ------------ | ---------------------------- |
| admin        | Administrador (acceso total) |
| despachador1 | Despachador                  |
| chef1        | Chef                         |
| chef2        | Chef                         |
| chef3        | Chef                         |
| rep1 al rep7 | Repartidor                   |

---

## Cómo volver a ejecutar el proyecto (días siguientes)

No necesitas repetir todos los pasos. Solo:

**Terminal 1 — Backend:**

```
cd Parcial2_ProgramacionII
cd backend
npm run dev
```

**Terminal 2 — Frontend:**

```
cd Parcial2_ProgramacionII
cd frontend
npm run dev
```

Luego abre `http://localhost:5173` en el navegador.

---

## Solución a problemas comunes

**“mysql no se reconoce como comando”**
→ MySQL no está en el PATH. Reinstala MySQL y marca la opción “Add to PATH”, o usa MySQL Workbench para ejecutar los scripts SQL.

**“Cannot find module bcrypt”**
→ Ejecuta `npm install bcrypt` dentro de la carpeta `database/`.

**“Error: connect ECONNREFUSED”**
→ El backend no puede conectar con MySQL. Verifica que MySQL esté corriendo y que la contraseña en `.env` sea correcta.

**“Port 3001 is already in use”**
→ Ya hay un servidor corriendo. Cierra la otra ventana de CMD o reinicia el computador.

**La página carga pero no puedo hacer login**
→ Verifica que el backend esté corriendo (Terminal 1) y que hayas cargado los seeds correctamente.

---

## Estructura del proyecto

```
Parcial2_ProgramacionII/
├── frontend/          ← React + Vite + TailwindCSS
├── backend/           ← Node.js + Express + JWT
├── database/
│   ├── schema.sql     ← Crear las tablas (ejecutar primero)
│   ├── seeds.sql      ← Datos de prueba (ejecutar segundo)
│   └── generar_hashes.js ← Generador de contraseñas
├── docs/
│   ├── arquitectura.pdf / .md
│   └── manual_usuario.pdf / .md
└── README.md
```

---

_Universidad Libre Seccional Pereira · Facultad de Ingeniería · Programación II 2026-1_
