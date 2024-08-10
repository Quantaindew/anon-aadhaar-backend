//@ts-nocheck
import type { Request, Response } from "express";
import { generateProofService } from '../services/proofService.js';

export async function generateProofController(req: Request, res: Response) {
  console.log('Proof generation request received');
  try {
    const { qrCode, signal } = req.body;
    console.log('Request body:', { qrCode: qrCode ? 'present' : 'missing', signal: signal ? 'present' : 'missing' });
    
    if (!qrCode || !signal) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'QR code and signal are required' });
    }
    
    console.log('Starting proof generation');
    const proofPromise = generateProofService(qrCode, signal);
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Proof generation timed out after 10 minutes')), 600000);
    });

    const proof = await Promise.race([proofPromise, timeoutPromise]);
    
    console.log('Proof generation completed');
    res.json({ proof });
  } catch (error) {
    console.error('Error generating proof:', error);
    if (error.message.includes('timed out')) {
      res.status(504).json({ error: 'Proof generation timed out', details: error.message });
    } else {
      res.status(500).json({ 
        error: 'An error occurred while generating the proof',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}