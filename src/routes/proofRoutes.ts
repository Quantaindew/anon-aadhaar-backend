import express from 'express';
import { generateProofController } from '../controllers/proofController.js';

const router = express.Router();

router.post('/generate', (req, res, next) => {
  console.log('Received request for proof generation');
  generateProofController(req, res).catch(next);
});

export default router;