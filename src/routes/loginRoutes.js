import express from 'express';

const router = express.Router();
import {
    validateLogin,
} from '../controllers/loginController.js';

router.post('/login', validateLogin);

export default router;
