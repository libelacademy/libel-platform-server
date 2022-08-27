const { Router } = require('express');
const { CourseController } = require('../controllers');
const { checkAuth } = require('../middleware/auth');

const router = Router();


router.get('/', CourseController.getAll);
router.get('/slug/:slug', CourseController.getBySlug);
router.post('/', CourseController.create);
router.put('/:id', CourseController.update);
router.delete('/:id', CourseController.deleteCourse);

router.get('/:slug/lessons/:lessonId', CourseController.getLesson);
router.post('/:courseId/lessons', CourseController.addLesson);
router.put('/:courseId/lessons/:lessonId', CourseController.updateLesson);
router.delete('/:courseId/lessons/:lessonId', CourseController.deleteLesson);

router.post('/:courseId/materials', CourseController.addMaterial);
router.delete('/:courseId/materials/:materialId', CourseController.deleteMaterial);

// router.get('/:courseId/feedbacks', CourseController.getFeedbacks);
router.get('/:slug/feedbacks/:feedbackId', CourseController.getFeedback);
router.post('/:courseId/feedbacks', CourseController.addFeedback);
router.put('/:courseId/feedbacks/:feedbackId', CourseController.updateFeedback);
router.delete('/:courseId/feedbacks/:feedbackId', CourseController.deleteFeedback);

// router.get('/:courseId/reviews', CourseController.getReviews);
router.post('/:courseId/reviews', checkAuth, CourseController.addReview);
router.put('/:courseId/reviews/:reviewId', checkAuth, CourseController.updateReview);
router.delete('/:courseId/reviews/:reviewId', checkAuth, CourseController.deleteReview);

router.post('/enrollments', CourseController.enrollCourse);
router.delete('/enrollments/:courseId/:userId', CourseController.unenrollCourse);

module.exports = router;