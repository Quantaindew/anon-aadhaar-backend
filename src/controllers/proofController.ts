import type { Request, Response } from "express";
import { generateProofService } from '../services/proofService.js';

export async function generateProofController(req: Request, res: Response) {
  console.log('Proof generation request received');
  try {
    const { qrCode, signal } = req.body;
    if (!qrCode || !signal) {
      return res.status(400).json({ error: 'QR code and signal are required' });
    }
    
    console.log('Starting proof generation');
    const proof = await generateProofService(qrCode, signal);
    console.log('Proof generation completed');
    res.json({ proof });
  } catch (error) {
    console.error('Error generating proof:', error);
    res.status(500).json({ 
      error: 'An error occurred while generating the proof',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    console.log('Proof generation request handled');
  }
}