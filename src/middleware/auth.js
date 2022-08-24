const { verifyToken } = require('../helpers/token');
const { error } = require('../helpers/responses');

const checkAuth = async (req, res, next) => {
  try {
    if (!req.cookies.libelCourseApp) {
      return error(res, 'No token provided', 401);
    }
    const token = req.cookies.libelCourseApp;
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, err.message);
  }
};


const checkRole = async (roles, req, res, next) => {
  try {
    const { role } = req.user;
    if (!roles.includes(role)) {
      return error(res, 'No tienes permisos para realizar esta acción', 401);
    }
    next();
  } catch (err) {
    return error(res, err.message);
  }
}

module.exports = { checkAuth, checkRole };
