const { login, googleLogin, setPassword, getProfile } = require('../controllers/AuthController');
const authMiddleware = require('../middleware/auth');

const router = require('express').Router();

router.post('/login', login);
router.post('/set-password', authMiddleware, setPassword);
router.get('/user/profile', authMiddleware, getProfile);
router.get('/google', googleLogin);


module.exports = router;