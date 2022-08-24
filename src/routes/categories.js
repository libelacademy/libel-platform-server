const { Router } = require('express');
const { CategoryController } = require('../controllers');

const router = Router();


router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', CategoryController.create);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.remove);


module.exports = router;