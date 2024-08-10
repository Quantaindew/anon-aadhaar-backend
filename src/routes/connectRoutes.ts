import express from 'express';
import { connectController, disconnectController } from '../controllers/connectController.js';

const router = express.Router();


router.post('/connect/', connectController);
router.post('/disconnect/', disconnectController);

export default router;