const express = require('express');
const router = express.Router();

// --- 1. IMPORT THE FUNCTIONS ---
// IMPORTANT: We added 'deleteMyPayments' to this list!
const { 
    processPayment, 
    getMyPayments, 
    getAllPayments,
    deleteAllPayments,
    deleteMyPayments // <--- THIS WAS MISSING!
} = require('../controllers/paymentController');

const { protect } = require('../middlewares/authMiddleware');

// --- 2. USER ROUTES ---
router.post('/', protect, processPayment);
router.get('/my-payments', protect, getMyPayments);
router.delete('/my-payments', protect, deleteMyPayments); 

// --- 3. ADMIN ROUTES ---
router.get('/', protect, getAllPayments);
router.delete('/', protect, deleteAllPayments);

module.exports = router;