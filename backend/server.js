require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares globales ─────────────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ────────────────────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/pedidos", require("./routes/pedidoRoutes"));
app.use("/api", require("./routes/rapizzaRoutes")); // /clientes, /productos, /empleados, /cuentas-cobro

// ── Ruta de salud ────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Servidor corriendo",
    timestamp: new Date(),
  });
});

// ── Manejo de rutas no encontradas ───────────────────────────────────────────
app.use((_req, res) => {
  res
    .status(404)
    .json({ success: false, data: null, message: "Ruta no encontrada" });
});

app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});
