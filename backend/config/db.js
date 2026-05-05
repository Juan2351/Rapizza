const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "parcial2_db",
  waitForConnections: true,
  connectionLimit: 10,
});

// Verificar conexión al iniciar
pool
  .getConnection()
  .then((conn) => {
    console.log("Conexión a MySQL exitosa");
    conn.release();
  })
  .catch((err) => {
    console.error("Error conectando a MySQL:", err.message);
  });

module.exports = pool;
