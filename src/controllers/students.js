/** @format */

const { error, success } = require('../helpers/responses');
const {
  Lesson,
  Student,
  Course,
  Certificate,
  Order,
} = require('../models');

const completeLesson = async (req, res) => {
  try {
    const { lessonId, slug } = req.body;
    const { id } = req.user;
    const student = await Student.findOne({ user: id });
    if (!student) {
      return error(res, 'El estudiante no registra.', 404);
    }

    const course = await Course.findOne({ slug });
    if (!course) {
      return error(res, 'El curso no existe.', 404);
    }
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return error(res, 'La clase no existe.', 404);
    }

    student.enrollments
      .find(
        (enrollment) =>
          enrollment.course.toString() === course._id.toString()
      )
      .completedLessons.push(lessonId);

    let completed = false;
    if (
      student.enrollments.find(
        (enrollment) =>
          enrollment.course.toString() === course._id.toString()
      ).completedLessons.length === course.lessons.length
    ) {
      student.enrollments.find(
        (enrollment) =>
          enrollment.course.toString() === course._id.toString()
      ).status = 'completed';
      completed = true;
    }

    await student.save();

    success(
      res,
      { lesson, completed },
      'La clase ha sido completada.'
    );
  } catch (e) {
    error(res, e.message);
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { id } = req.user;
    const student = await Student.findOne({ user: id });
    if (!student) {
      return error(res, 'El estudiante no registra.', 404);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return error(res, 'El curso no existe.', 404);
    }

    student.wishlist.push(courseId);
    await student.save();

    success(
      res,
      { course: course._id },
      'Curso agregado a la lista de deseos.'
    );
  } catch (e) {
    error(res, e.message);
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { id } = req.user;
    const student = await Student.findOne({ user: id });
    if (!student) {
      return error(res, 'El estudiante no registra.', 404);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return error(res, 'El curso no existe.', 404);
    }
    student.wishlist = student.wishlist.filter(
      (wish) => wish.toString() !== course._id.toString()
    );
    await student.save();

    success(
      res,
      { course: course._id },
      'Curso eliminado de la lista de deseos.'
    );
  } catch (e) {
    error(res, e.message);
  }
};

const leaveCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { id } = req.user;
    const student = await Student.findOne({ user: id });
    if (!student) {
      return error(res, 'El estudiante no registra.', 404);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return error(res, 'El curso no existe.', 404);
    }

    student.enrollments.filter(
      (enrollment) =>
        enrollment.course.toString() !== course._id.toString()
    );
    await student.save();

    success(res, course, 'Has avanzado al curso.');
  } catch (e) {
    error(res, e.message);
  }
};

const getCerificates = async (req, res) => {
  try {
    const { id } = req.user;
    const student = await Student.findOne({ user: id });
    if (!student) {
      return error(res, 'El estudiante no registra.', 404);
    }

    const certificates = await Certificate.find({
      student: student._id,
    }).populate('course');

    success(res, certificates, 'Certificados obtenidos.');
  } catch (e) {
    error(res, e.message);
  }
};

const getInvoices = async (req, res) => {
  try {
    const { id } = req.user;
    const student = await Student.findOne({ user: id });
    if (!student) {
      return error(res, 'El estudiante no registra.', 404);
    }

    const invoices = await Order.find({ student: student._id })
      .populate('student')
      .populate('course')
      .populate({
        path: 'payer',
        model: 'User',
      });

    success(res, invoices, 'Facturas obtenidas.');
  } catch (e) {
    error(res, e.message);
  }
};

module.exports = {
  completeLesson,
  addToWishlist,
  removeFromWishlist,
  leaveCourse,
  getCerificates,
  getInvoices,
};
