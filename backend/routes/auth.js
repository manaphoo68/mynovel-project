// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'uploads/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

router.post('/register', upload.single('profileImage'), authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.getCurrentUser);
router.post('/verify-email', authController.verifyEmail);
router.get('/referrer-info/:affCode', authController.getReferrerInfo);

// Google OAuth
router.get('/google', (req, res, next) => {
    const { ref } = req.query;
    if (ref) { req.session.referralCode = ref; }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});
router.get('/google/callback', 
    passport.authenticate('google', { 
        successRedirect: 'http://localhost:5173/dashboard', 
        failureRedirect: 'http://localhost:5173/login' 
    })
);

module.exports = router;