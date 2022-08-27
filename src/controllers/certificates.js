
const { error, success } = require('../helpers/responses');
const { Certificate, Student, Course } = require('../models')

const getAll = async (req, res) => {
  try {
    const certificates = await Certificate.find({}).populate('student').populate('course');
    return success(res, certificates, 'Certificates retrieved successfully');
  } catch (error) {
    return error(res, error);
  }
}


const create = async (req, res) => {
  try {
    const {user, course: courseId, url} = req.body;
    const student = await Student.findOne({ user });
    if (!student) {
      return error(res, 'Estudiante no encontrado', 404);
    }
    const course = await Course.findById(courseId);
    if (!course) { return error(res, 'Curso no encontrado', 404); }

    const certificate = await Certificate.create({
      student: student.id,
      course: course,
      url
    });

    student.enrollments.find( enroll => enroll.course.toString() === courseId).certificate = certificate._id;
    await student.save();

    const result = await Certificate.findById(certificate.id).populate('student').populate('course');

    return success(res, {user, certificate: result}, 'Certificate created successfully');
  } catch (error) {
    return error(res, error);
  }
}


module.exports = {
  getAll,
  create
}