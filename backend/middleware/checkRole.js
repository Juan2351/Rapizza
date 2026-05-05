/**
 * Middleware para verificar roles del usuario autenticado.
 * Uso: router.delete('/ruta', verifyToken, checkRole('admin'), controlador)
 * Uso múltiple: checkRole('admin', 'moderador')
 */
const checkRole = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Usuario no autenticado',
      });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        data: null,
        message: `Acceso denegado: se requiere rol ${rolesPermitidos.join(' o ')}`,
      });
    }

    next();
  };
};

module.exports = checkRole;
