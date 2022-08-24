const { Router } = require('express');
const { OrderController } = require('../controllers');

const router = Router();


router.get('/', OrderController.getAll);
router.get('/:id', OrderController.getOne);


module.exports = router;