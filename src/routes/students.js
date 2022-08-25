const { Router } = require('express');
const { StudentController } = require('../controllers');
const { checkAuth } = require('../middleware/auth');


const router = Router();


router.put('/complete-lesson', checkAuth, StudentController.completeLesson);
router.post('/wishlist', checkAuth, StudentController.addToWishlist);
router.delete('/wishlist/:courseId', checkAuth, StudentController.removeFromWishlist);

router.get('/certificates', checkAuth, StudentController.getCerificates);
router.get('/invoices', checkAuth, StudentController.getInvoices);


module.exports = router;