const { User, Student, Instructor, File } = require('./../models');
const { error, success } = require('../helpers/responses');
const { hashPassword, comparePassword } = require('../helpers/password');
const { deleteFile } = require('../libs/storage');
const { generateFromEmail } = require('unique-username-generator');
const { sendCreatedUserEmail, sendChangePassword } = require('../libs/emailer');


const getAll = async (req, res) => {
  try {
    const users = await User.find({}).populate('student').populate('instructor').select('-password');
    success(res, users);
  } catch (e) {
    error(res, e.message);
  }
}

const getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('student').populate('instructor').select('-password');
    success(res, user);
  } catch (e) {
    error(res, e.message);
  }
}

const getByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    success(res, user);
  } catch (e) {
    error(res, e.message);
  }
}

const getInstructors = async (req, res) => {
  try {
    const users = await User.find({ role: 'instructor' }).populate('instructor').select('-password');
    success(res, users);
  } catch (e) {
    error(res, e.message);
  }
}

const create = async (req, res) => {
  try {
    const { role, email, password, name, country, phone, title } = req.body;
    const validateEmail = await User.findOne({ email });
    if (validateEmail) {
      return error(res, 'El correo ya existe.', 409);
    }

    const user = new User({
      name,
      email,
      username: generateFromEmail(email, 3),
      password: hashPassword(password),
      role,
      country,
      phone,
    });

    if (user.role === 'student') {
      const student = await Student.create({
        user: user._id,
      });
      user.student = student._id;
    } else if (user.role === 'instructor') {
      const instructor = await Instructor.create({
        user: user._id,
        title,
      });
      user.instructor = instructor._id;
    }
    await user.save();
    sendCreatedUserEmail({
      name,
      email,
      password,
      username: user.username,
    });
    user.password = undefined;
    await Student.populate(user, { path: 'student' });
    success(res, user);
  } catch (e) {
    error(res, e.message);
  }
}

const update = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findByIdAndUpdate(id,  req.body, { new: true }).populate('student').populate('instructor').select('-password');
    success(res, user, 'Usuario actualizado correctamente.');
  } catch (e) {
    error(res, e.message);
  }
}

const deleteById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const file = await File.findOne({ url: user.avatar });
    if (file) {
      const fileRemoved = await deleteFile(file.fileName);
      if (fileRemoved.success) {
        await file.remove();
      }
    }
    if (user.role === 'student') {
      await Student.findByIdAndDelete(user.student);
    }
    if (user.role === 'instructor') {
      await Instructor.findByIdAndDelete(user.instructor);
    }
    await user.remove();
    success(res, user, 'Usuario eliminado correctamente.');
  } catch (e) {
    error(res, e.message);
  }
}

const remove = async (req, res) => {
  try {
    const { id } = req.user;
    const { email } = req.body;
    const user = await User.findById(id);
    if (user.email !== email) {
      return error(res, 'El correo no coincide con el usuario.');
    }
    const file = await File.findOne({ url: user.avatar });
    if (file) {
      const fileRemoved = await deleteFile(file.fileName);
      if (fileRemoved.success) {
        await file.remove();
      }
    }
    if (user.role === 'student') {
      await Student.findByIdAndDelete(user.student);
    }
    if (user.role === 'instructor') {
      await Instructor.findByIdAndDelete(user.instructor);
    }
    await user.remove();
    success(res, user, 'Usuario eliminado correctamente.');
  } catch (e) {
    error(res, e.message);
  }
}

const changePassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { newPassword, oldPassword } = req.body;
    const user = await User.findById(id);
    if (!comparePassword(oldPassword, user.password)) {
      return error(res, 'La contraseña actual es incorrecta.');
    }
    user.password = hashPassword(newPassword);
    await user.save();
    await sendChangePassword({email: user.email, name: user.name});
    success(res, user, 'Contraseña actualizada correctamente.');
  } catch (e) {
    error(res, e.message);
  }
}


const setPassword = async (req, res) => {
  try {
    const { id } = req.user;
    const { newPassword } = req.body;
    const user = await User.findById(id);
    if (user.provider === 'local') {
      return error(res, 'No puedes cambiar la contraseña de un usuario local.');
    }
    user.password = hashPassword(newPassword);
    user.provider = 'local';
    await user.save();
    await sendChangePassword({email: user.email, name: user.name});
    success(res, user, 'Contraseña actualizada correctamente.');
  } catch (e) {
    error(res, e.message);
  }
}

module.exports = {
  getAll,
  getById,
  getByUsername,
  getInstructors,
  create,
  update,
  deleteById,
  remove,
  changePassword,
  setPassword
}