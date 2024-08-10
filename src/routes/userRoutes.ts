import express from 'express';
import { userController } from '../controllers/userController.js';

const router = express.Router();


router.post('/transact', userController);

export default router;