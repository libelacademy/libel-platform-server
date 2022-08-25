const { frontend } = require('../config');

const success = (res, data, message, code = 200) => {
  res.status(code).json({
    success: true,
    message,
    data,
  });
};

const successLogin = async (res, data, token ) => {
  res.status(200)
  .cookie('libelCourseApp', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 3,
    sameSite:'none',
    secure: true,
  })
  .json({
    success: true,
    message: 'Inicio de sesión exitoso',
    data,
  });
}

const successLoginProvider = async (res, token, from ) => {

  res.status(200)
  .cookie('libelCourseApp', token, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 3,
    sameSite: 'none',
    secure: true,
  })
  .redirect(frontend + from);
}

const successLogout = (res) => {
  res.status(200)
  .clearCookie('libelCourseApp')
  .json({
    success: true,
    message: 'Sesión cerrada',
  });
}

const error = (res, message, code = 500) => {
  res.status(code).json({
    success: false,
    message,
  });
}


module.exports = { 
  success,
  successLogin,
  successLoginProvider,
  successLogout,
  error,
}