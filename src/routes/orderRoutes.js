import express from 'express';
import auth from '../middlewares/auth.js'

const router = express.Router();
import {
    getAllOrders,
    getOrderById,
    getOrderByTableNumber,
    createOrder,
    updateOrder,
    deleteOrder,
    addItem,
    deleteItem,
    updateItem
} from '../controllers/OrderController.js';


router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders', createOrder);
router.put('/orders/:id', updateOrder);
router.delete('/orders/:id', deleteOrder);

router.get('/orders/table/:tableNumber', getOrderByTableNumber);
router.post('/orders/items/:id', addItem);
router.delete('/orders/items/:orderItemId', deleteItem);
router.put('/orders/items/:orderItemId', updateItem);


export default router;
