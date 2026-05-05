const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const ROUNDS = 10;

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { usuario, password, rol = 'usuario' } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Usuario y contraseña son obligatorios',
      });
    }

    // Verificar si el usuario ya existe
    const [existe] = await db.query('SELECT id FROM usuarios WHERE usuario = ?', [usuario]);
    if (existe.length > 0) {
      return res.status(409).json({
        success: false,
        data: null,
        message: 'El nombre de usuario ya está en uso',
      });
    }

    const hash = await bcrypt.hash(password, ROUNDS);
    const [result] = await db.query(
      'INSERT INTO usuarios (usuario, password, rol) VALUES (?, ?, ?)',
      [usuario, hash, rol]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, usuario, rol },
      message: 'Usuario registrado correctamente',
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Usuario y contraseña son obligatorios',
      });
    }

    const [rows] = await db.query('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Credenciales inválidas',
      });
    }

    const user = rows[0];
    const esValido = await bcrypt.compare(password, user.password);

    if (!esValido) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Credenciales inválidas',
      });
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        usuario: user.usuario,
        rol: user.rol,
        imagen: user.imagen,
        id: user.id,
      },
      message: 'Login exitoso',
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

// GET /api/auth/me — verificar sesión activa (requiere token)
const me = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, usuario, rol, imagen, creado_en FROM usuarios WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'Usuario no encontrado' });
    }
    res.status(200).json({ success: true, data: rows[0], message: 'OK' });
  } catch (error) {
    console.error('Error en me:', error);
    res.status(500).json({ success: false, data: null, message: 'Error del servidor' });
  }
};

module.exports = { register, login, me };
