import express from 'express';
import upload from '../config/multerConfig.js';

const router = express.Router();
import {
    getAllItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem
} from '../controllers/itemController.js';

router.get('/items', getAllItems);
router.get('/items/:id', getItemById);
router.post('/items', upload.single('image'), createItem);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

export default router;
