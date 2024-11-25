import express from 'express';
import auth from '../middlewares/auth.js';

const router = express.Router();
import {
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
} from '../controllers/paymentController.js';

router.get('/payments', getAllPayments);
router.get('/payments/:id', getPaymentById);
router.post('/payments', createPayment);
router.put('/payments/:id', updatePayment);
router.delete('/payments/:id', deletePayment);

export default router;
