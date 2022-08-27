const { Router } = require('express');
const { CertificateController } = require('../controllers');

const router = Router();


router.get('/', CertificateController.getAll);
router.post('/', CertificateController.create);


module.exports = router;