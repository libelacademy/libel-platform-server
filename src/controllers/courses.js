/** @format */

const urlSlug = require('url-slug');
const schedule = require('node-schedule');

const {
  Course,
  File,
  Category,
  Instructor,
  Student,
  Lesson,
  Feedback,
  Material,
  Review,
} = require('../models');
const { error, success } = require('../helpers/responses');
const { deleteFile } = require('../libs/storage');
const { sendStartCourseInfo } = require('../libs/emailer');

const getAll = async (req, res) => {
  try {
    const courses = await Course.find({})
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
        },
      })
      .populate('lessons')
      .populate('feedbacks')
      .populate('materials')
      .populate('reviews');
    return success(
      res,
      courses,
      'Cursos obtenidos correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
};

const getBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate('lessons')
      .populate('feedbacks')
      .populate('materials')
      .populate({
        path: 'reviews',
        populate: {
          path: 'student',
          populate: {
            path: 'user',
          },
        },
      })
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
        },
      });
    return success(res, course, 'Curso obtenido correctamente.', 200);
  } catch (e) {
    error(res, e.message);
  }
};

const create = async (req, res) => {
  try {
    console.log(new Date(req.body.publishedAt).toString());
    req.body.slug = urlSlug(req.body.name);
    if (req.body.publishedAt) {
      if (
        new Date(req.body.publishedAt).getTime() <
        new Date().getTime()
      ) {
        req.body.published = true;
      } else {
        req.body.published = false;
      }
    } else {
      req.body.publishedAt = new Date();
      req.body.published = true;
    }

    const course = await Course.create(req.body);

    course.categories.forEach(async (category) => {
      await Category.findByIdAndUpdate(category, {
        $push: { courses: course._id },
      });
    });

    await Instructor.findByIdAndUpdate(course.instructor, {
      $push: { courses: course._id },
    });

    if (!course.published) {
      schedule.scheduleJob(new Date(course.publishedAt), async () => {
        const toPublish = await Course.findById(course._id);
        toPublish.published = true;
        await toPublish.save();
        toPublish.students.forEach(async (element) => {
          const student = await Student.findById(
            element._id
          ).populate('user');
          student.enrollments.find(
            (enrollment) =>
              enrollment.course.toString() ===
              toPublish._id.toString()
          ).status = 'process';
          await student.save();
          await sendStartCourseInfo({
            email: student.user.email,
            name: student.user.name,
            course: toPublish.name,
            slug: toPublish.slug,
          });
        });
        console.log(
          'Published: ',
          course.name,
          ' at ',
          new Date(course.publishedAt).toLocaleString()
        );
      });
    } else {
      console.log(
        'Published: ',
        course.name,
        ' at ',
        new Date(course.publishedAt).toLocaleString()
      );
    }

    const newCourse = await Course.findById(course._id)
      .populate({
        path: 'instructor',
        populate: {
          path: 'user',
        },
      })
      .populate('lessons')
      .populate('feedbacks')
      .populate('materials');
    return success(
      res,
      newCourse,
      'Curso creado correctamente.',
      201
    );
  } catch (e) {
    console.log(e);
    error(res, e.message);
  }
};

const update = async (req, res) => {
  try {
    if (req.body.name) {
      req.body.slug = urlSlug(req.body.name);
    }

    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    return success(
      res,
      course,
      'Curso actualizado correctamente.',
      200
    );
  } catch (e) {
    console.log(e);
    error(res, e.message);
  }
};

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return error(res, 'Curso no encontrado.', 404);
    }

    if (course.students.length > 0) {
      return error(
        res,
        'No se puede eliminar un curso con estudiantes inscritos.',
        400
      );
    }

    course.lessons.forEach(async (lesson) => {
      await Lesson.findByIdAndDelete(lesson);
    });
    course.feedbacks.forEach(async (feedback) => {
      await Feedback.findByIdAndDelete(feedback);
    });
    course.materials.forEach(async (material) => {
      await Material.findByIdAndDelete(material);
    });

    const file = await File.findOne({ url: course.image });
    if (file) {
      const fileRemoved = await deleteFile(file.fileName);
      if (fileRemoved.success) {
        await File.findByIdAndDelete(file._id);
      }
    }

    await Course.findByIdAndDelete(req.params.id);
    return success(
      res,
      course,
      'Curso eliminado correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
};

const getLesson = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) {
      return error(res, 'Curso no encontrado.', 404);
    }
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return error(res, 'Lección no encontrada.', 404);
    }
    return success(
      res,
      lesson,
      'Lección obtenida correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
};

const addLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return error(res, 'Curso no encontrado.', 404);
    }
    let lesson = {}
    const lessons = await Lesson.find({ course: course._id });
    if (lessons.length === 0) {
      lesson = new Lesson({
        ...req.body,
        course: course._id,
        previous: null,
        next: null,
        head: true,
      });
    } else {
      const lastLesson = lessons.find((lesson) => lesson.head );
      console
      lesson = new Lesson({
        ...req.body,
        course: course._id,
        previous: lastLesson._id,
        next: null,
        head: true,
      });

      await Lesson.findByIdAndUpdate(lastLesson._id, {
        next: lesson._id,
        head: false,
      });
    }

    await lesson.save();

    course.lessons.push(lesson._id);
    course.duration += lesson.duration;
    await course.save();

    return success(
      res,
      lesson,
      'Lección agregada correctamente.',
      201
    );
  } catch (e) {
    console.log(e);
    error(res, e.message);
  }
};

const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByIdAndUpdate(
      req.params.lessonId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    return success(
      res,
      lesson,
      'Lección actualizada correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
};

const deleteLesson = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return error(res, 'Curso no encontrado.', 404);
    }
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return error(res, 'Lección no encontrada.', 404);
    }
    
    const previous = await Lesson.findById(lesson.previous);
    const next = await Lesson.findById(lesson.next);

    if (!previous && next) {
      next.previous = null;
      await next.save(); 
    } else if ( previous && next) {
      previous.next = next._id;
      await previous.save();
      next.previous = previous._id;
      await next.save();
    } else if (previous && !next) {
      previous.next = null;
      await previous.save();
    }

    await Lesson.findByIdAndDelete(lesson._id);

    course.lessons.splice(course.lessons.indexOf(lesson._id), 1);
    course.duration = course.duration - lesson.duration;
    await course.save();
    return success(
      res,
      lesson,
      'Lección eliminada correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
};

const addMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return error(res, 'Curso no encontrado.', 404);
    }
    const material = await Material.create(req.body);
    course.materials.push(material._id);
    await course.save();
    return success(
      res,
      material,
      'Material agregado correctamente.',
      201
    );
  } catch (e) {
    console.log(e);
    error(res, e.message);
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return error(res, 'Curso no encontrado.', 404);
    }
    const material = await Material.findById(req.params.materialId);
    if (!material) {
      return error(res, 'Material no encontrado.', 404);
    }
    await Material.findByIdAndDelete(material._id);
    course.materials.splice(
      course.materials.indexOf(material._id),
      1
    );
    await course.save();
    return success(
      res,
      material,
      'Material eliminado correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
};

const getFeedback = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug });
    if (!course) {
      return error(res, 'Curso no encontrado.', 404);
    }
    const feedback = await Feedback.findById(req.params.feedbackId);
    if (!feedback) {
      return error(res, 'Feedback no encontrado.', 404);
    }
    return success(
      res,
      feedback,
      'Feedback obtenido correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
}

const addFeedback = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return error(res, 'Curso no encontrado.', 404);
    }
    let feedback = {}
    const feedbacks = await Feedback.find({ course: course._id });
    if (feedbacks.length === 0) {
      feedback = new Feedback({
        ...req.body,
        course: course._id,
        previous: null,
        next: null,
        head: true,
      });
    } else {
      const lastFeedback = feedbacks.find((lesson) => lesson.head );
      feedback = new Feedback({
        ...req.body,
        course: course._id,
        previous: lastFeedback._id,
        nextLesson: null,
        head: true,
      });

      await Feedback.findByIdAndUpdate(lastFeedback._id, {
        next: feedback._id,
        head: false,
      });
    }

    await feedback.save();

    course.feedbacks.push(feedback._id);
    await course.save();

    return success(
      res,
      feedback,
      'Feedback agregado correctamente.',
      201
    );
  } catch (e) {
    error(res, e.message);
  }
};

const updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.feedbackId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    return success(
      res,
      feedback,
      'Feedback actualizado correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      return error(res, 'Curso no encontrado.', 404);
    }
    const feedback = await Feedback.findById(req.params.feedbackId);
    if (!feedback) {
      return error(res, 'Feedback no encontrado.', 404);
    }
    
    const previous = await Feedback.findById(feedback.previous);
    const next = await Feedback.findById(feedback.next);

    if (!previous && next) {
      next.previous = null;
      await next.save(); 
    } else if ( previous && next) {
      previous.next = next._id;
      await previous.save();
      next.previous = previous._id;
      await next.save();
    } else if (previous && !next) {
      previous.next = null;
      await previous.save();
    }

    await Feedback.findByIdAndDelete(feedback._id);

    course.feedbacks.splice(course.feedback.indexOf(feedback._id), 1);
    await course.save();
    return success(
      res,
      feedback,
      'Feedback eliminado correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
};

const addReview = async (req, res) => {
  try {
    const { id } = req.user;
    const { rating, comment } = req.body;
    const course = await Course.findById(req.params.courseId);
    const student = await Student.findOne({ user: id });
    if (!student) {
      return error(res, 'Estudiante no encontrado.', 404);
    }
    if (!course) {
      return error(res, 'Curso no encontrado.', 404);
    }
    const review = await Review.create({
      student: student._id,
      course: course._id,
      rating,
      comment,
    });
    course.reviews.push(review._id);
    await course.save();

    const result = await Review.findById(review._id).populate({
      path: 'student',
      populate: {
        path: 'user',
      },
    });

    return success(
      res,
      result,
      'Review agregado correctamente.',
      201
    );
  } catch (e) {
    error(res, e.message);
  }
};

const updateReview = async (req, res) => {
  try {
    const { id } = req.user;

    const course = await Course.findById(req.params.courseId);
    const student = await Student.findOne({ user: id });
    const review = await Review.findById(req.params.reviewId);

    if (!student) {
      return error(res, 'Estudiante no encontrado.', 404);
    }

    if (!course) {
      return error(res, 'Curso no encontrado.', 404);
    }
    if (!review) {
      return error(res, 'Review no encontrado.', 404);
    }

    if (review.student.toString() !== student._id.toString()) {
      return error(
        res,
        'No tienes permisos para editar este review.',
        403
      );
    }

    const upated = await Review.findByIdAndUpdate(
      review._id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return success(
      res,
      upated,
      'Review actualizado correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
};

const deleteReview = async (req, res) => {
  try {
    const { id } = req.user;
    const course = await Course.findById(req.params.courseId);
    const student = await Student.findOne({ user: id });

    if (!student) {
      return error(res, 'Estudiante no encontrado.', 404);
    }

    if (!course) {
      return error(res, 'Curso no encontrado.', 404);
    }
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return error(res, 'Review no encontrado.', 404);
    }

    if (review.student.toString() !== student._id.toString()) {
      return error(
        res,
        'No tienes permisos para eliminar este review.',
        401
      );
    }

    await Review.findByIdAndDelete(review._id);
    course.reviews.splice(course.reviews.indexOf(review._id), 1);
    await course.save();
    return success(
      res,
      review,
      'Review eliminado correctamente.',
      200
    );
  } catch (e) {
    error(res, e.message);
  }
};


const enrollCourse = async (req, res) => {
  try {
      const { userId, courseId } = req.body;
    const student = await Student.findOne({ user: userId });
    if (!student) { return error(res, 'Estudiante no encontrado.', 404); }

    const course = await Course.findById(courseId);
    if (!course) { return error(res, 'Curso no encontrado.', 404); }

    student.enrollments.push({
      course: course._id
    });
    course.students.push(student._id);

    await student.save();
    await course.save();

    const result = student.enrollments.find( enroll => enroll.course.toString() === course._id.toString());

    return success( res, {student: student.user, enrollment: result}, 'Curso agregado correctamente.', 201 );

  } catch (e) {
    console.log(e);
    error(res, e.message);
  }
}


const unenrollCourse = async (req, res) => {
  try {
    console.log(req.params);
    const { userId, courseId } = req.params;
    const student = await Student.findOne({ user: userId });
    if (!student) { return error(res, 'Estudiante no encontrado.', 404); }

    const course = await Course.findById(courseId);
    if (!course) { return error(res, 'Curso no encontrado.', 404); }

    const enrollment = student.enrollments.find( enroll => enroll.course.toString() === course._id.toString());
    if (!enrollment) { return error(res, 'No estas inscrito en este curso.', 404); }
    student.enrollments.splice(student.enrollments.indexOf(enrollment._id), 1);
    course.students.splice(course.students.indexOf(student._id), 1);
   

    await student.save();
    await course.save();

    return success( res, {student: student.user, enrollment }, 'Curso eliminado correctamente.', 200 );

  } catch (e) {
    console.log(e);
    error(res, e.message);
  }
}


module.exports = {
  getAll,
  getBySlug,
  create,
  update,
  deleteCourse,
  getLesson,
  addLesson,
  updateLesson,
  deleteLesson,
  addMaterial,
  deleteMaterial,
  getFeedback,
  addFeedback,
  updateFeedback,
  deleteFeedback,
  addReview,
  updateReview,
  deleteReview,
  enrollCourse,
  unenrollCourse
};
