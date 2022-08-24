/** @format */

const { User, Student } = require('./../models');
const { error, success, successLogin, successLogout, successLoginProvider, } = require('../helpers/responses');
const { hashPassword, comparePassword } = require('../helpers/password');
const { generateToken, verifyToken } = require('../helpers/token');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../libs/emailer');
const { generateFromEmail } = require('unique-username-generator');


const register = async (req, res) => {
  try {
    const { email, password, name, country, phone } = req.body;
    const validateEmail = await User.findOne({ email });
    if (validateEmail) {
      return error(res, 'El correo ya existe.', 409);
    }

    const user = await User.create({
      name,
      email,
      username:  generateFromEmail(email, 3),
      password: hashPassword(password),
      country,
      phone,
    });

    const student = await Student.create({
      user: user._id,
    });
    user.student = student._id;
    await user.save();

    sendWelcomeEmail(user);
    const token = generateToken(user);

    user.password = undefined;
    await Student.populate(user, { path: 'student' });
    
    successLogin(res, user, token);
  } catch (e) {
    error(res, e.message);
  }
}


const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('student').populate('instructor');
    if (!user) {
      return error(res, 'Credenciales inválidas.');
    }
    if (!comparePassword(password, user.password)) {
      return error(res, 'Credenciales inválidas.');
    }
    const token = generateToken(user);
    user.password = undefined;
    successLogin(res, user, token);
  } catch (e) {
    error(res, e.message);
  }
}


const loginProvider = async (req, res) => {
  try {
    const from = req.session.from || '/ingreso';
    let user = await User.findOne({ email: req.user.profile.emails[0].value });
    if (!user) {
      user = new User({
        avatar: req.user.profile.photos[0].value,
        name: `${req.user.profile.name.givenName} ${req.user.profile.name.familyName}`,
        email: req.user.profile.emails[0].value,
        username: generateFromEmail(req.user.profile.emails[0].value, 3),
        password: hashPassword(req.user.profile.id),
        provider: req.user.profile.provider,
        providerId: req.user.profile.id,  
        role: 'student',
      });
      const student = await Student.create({
        user: user._id,
      });
      user.student = student._id;
      await user.save();
      sendWelcomeEmail(user);
    }
    const token = generateToken(user);
    successLoginProvider(res, token, from);
  } catch (e) {
    error(res, e.message);
  }
}


const verify = async (req, res) => {
  try {
    if (!req.user) {
      return error(res, 'No token provided', 401);
    }

    const { id } = req.user;
    const user = await User.findById(id).populate('student').populate('student').select('-password');

    if (!user) {
      return error(res, 'Usuario no encontrado', 404);
    }
    success(res, user, 'Bienvenido', 200);
  } catch (e) {
    error(res, e.message);
  }
}


const logout = async (req, res) => {
  try {
    if (!req.user) {
      return error(res, 'No token provided', 401);
    }
    successLogout(res);
  } catch (e) {
    error(res, e.message);
  }
}


const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return error(res, 'Usuario no encontrado', 404);
    }
    const token = generateToken(user, '1h');
    const messageId = await sendPasswordResetEmail(user, token);
    if (!messageId) {
      return error(res, 'Error al enviar el correo', 500);
    }
    success(res, {}, 'Se ha enviado un correo para restablecer la contraseña', 200);
  } catch (e) {
    error(res, e.message);
  }
}


const validate = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = verifyToken(token);
    if (!decoded) {
      return error(res, 'Token inválido', 401);
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return error(res, 'Usuario no encontrado', 404);
    }
    success(res, decoded, 'Usuario encontrado', 200);
  } catch (err) {
    error(res, err.message);
  }
}

const resetPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return error(res, 'Usuario no encontrado', 404);
    }
    user.password = hashPassword(password);
    await user.save();
    success(res, {}, 'Contraseña actualizada', 200);
  } catch (e) {
    error(res, e.message);
  }
}

module.exports = {
  register,
  login,
  loginProvider,
  verify,
  logout,
  forgotPassword,
  validate,
  resetPassword
}