const controllers = {
  AuthController: require('./auth'),
  CategoryController: require('./categories'),
  CourseController: require('./courses'),
  FileController: require('./files'),
  OrderController: require('./orders'),
  PaymentController: require('./payments'),
  StudentController: require('./students'),
  UserController: require('./users'),
};


module.exports = controllers;