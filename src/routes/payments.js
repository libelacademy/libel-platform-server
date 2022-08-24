
const { Router } = require('express');
const { PaymentController } = require('../controllers');
const { checkAuth } = require('../middleware/auth');


const router = Router();


router.post('/paypal/create-payment', checkAuth, PaymentController.createPaypalPayment);
router.get('/paypal/:courseId/execute-payment/:userId', PaymentController.executePaypalPayment);

router.post('/epayco/create-payment', checkAuth, PaymentController.createEpaycoPayment);
router.get('/epayco/:courseId/execute-payment/:userId?', PaymentController.executeEpaycoPayment);

router.get('/cancel-payment/:courseId', PaymentController.cancelPayment);

module.exports = router;
