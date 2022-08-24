const { Router } = require('express');
const { UserController } = require('../controllers');
const { checkAuth } = require('../middleware/auth');

const router = Router();


router.get('/', UserController.getAll);
router.get('/instructors', UserController.getInstructors);
router.get('/:id', UserController.getById);
router.get('/username/:username', UserController.getByUsername);
router.post('/', UserController.create);
router.put('/', checkAuth, UserController.update);
router.put('/password/change', checkAuth, UserController.changePassword);
router.put('/password/set', checkAuth, UserController.setPassword);
router.delete('/', checkAuth, UserController.remove);
router.delete('/:id', UserController.deleteById);



module.exports = router;