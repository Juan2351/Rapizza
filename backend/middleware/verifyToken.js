const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar el JWT en el header Authorization.
 * Uso: router.get('/ruta', verifyToken, controlador)
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      data: null,
      message: 'Acceso denegado: token no proporcionado',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, rol }
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      data: null,
      message: 'Token inválido o expirado',
    });
  }
};

module.exports = verifyToken;
