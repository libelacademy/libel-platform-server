/** @format */

const { Router } = require('express');
const { FileController } = require('../controllers');
const upload = require('../middleware/upload');
const cors = require('cors');

const router = Router();

router.get('/url', FileController.getByUrl);
router.get('/:id', FileController.download);
router.post('/', upload.single('file'), FileController.upload);
router.delete('/:id', FileController.remove);

module.exports = router;
