const express = require('express');
const { register, login, adminlogin, updateProfile, changePassword, deleteAccount, getAllUsers } = require('../controllers/authController');
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/adminlogin', adminlogin);

router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.delete('/profile', protect, deleteAccount);

router.get('/users', protect, isAdmin, getAllUsers);

module.exports = router;