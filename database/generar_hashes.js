/**
 * RAPIZZA — Generador de hashes bcrypt
 * ─────────────────────────────────────────────────────────────
 * Ejecutar UNA VEZ antes de cargar los seeds:
 *   cd database
 *   npm install bcrypt
 *   node generar_hashes.js
 *
 * Copia cada hash generado en seeds.sql reemplazando el valor
 * del campo password del usuario correspondiente.
 *
 * Estructura del personal según enunciado RAPIZZA:
 *   1 despachador, 3 chefs, 7 repartidores
 */
const bcrypt = require("bcrypt");

const ROUNDS = 10;
const CONTRASENA = "password";

const usuarios = [
  { usuario: "admin", rol: "admin" },
  { usuario: "despachador1", rol: "despachador" },
  // 3 chefs
  { usuario: "chef1", rol: "chef" },
  { usuario: "chef2", rol: "chef" },
  { usuario: "chef3", rol: "chef" },
  // 7 repartidores
  { usuario: "rep1", rol: "repartidor" },
  { usuario: "rep2", rol: "repartidor" },
  { usuario: "rep3", rol: "repartidor" },
  { usuario: "rep4", rol: "repartidor" },
  { usuario: "rep5", rol: "repartidor" },
  { usuario: "rep6", rol: "repartidor" },
  { usuario: "rep7", rol: "repartidor" },
];

(async () => {
  console.log(
    `\nGenerando hashes bcrypt (${ROUNDS} rounds) para contraseña: ${CONTRASENA}\n`,
  );
  console.log("-- Copia estos INSERT en seeds.sql:\n");

  for (const u of usuarios) {
    const hash = await bcrypt.hash(CONTRASENA, ROUNDS);
    console.log(`('${u.usuario}', '${hash}', '${u.rol}'),`);
  }

  console.log(
    "\n Hecho. Reemplaza los hashes en seeds.sql y vuelve a cargar la BD.",
  );
})();
