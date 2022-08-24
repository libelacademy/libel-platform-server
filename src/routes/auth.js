const { Router } = require('express');
const passport = require('passport');
const { AuthController } = require('../controllers');
const { checkAuth } = require('../middleware/auth');

const router = Router();


router.post('/login', AuthController.login);
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), AuthController.loginProvider);

router.get("/facebook",passport.authenticate("facebook", { scope:["email"] }));
router.get("/facebook/callback",passport.authenticate("facebook",{session:false}), AuthController.loginProvider);
router.post('/register', AuthController.register);
router.get('/verify', checkAuth, AuthController.verify);
router.get('/logout', checkAuth, AuthController.logout);

router.get('/validate/:token', AuthController.validate);
router.post('/forgot', AuthController.forgotPassword);
router.put('/:userId/reset', AuthController.resetPassword);

router.post('/data', (req, res) => {
  const { from } = req.body;
  req.session.from = from;
  res.send('OK')
})

module.exports = router;