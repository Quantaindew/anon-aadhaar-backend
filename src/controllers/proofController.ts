//@ts-nocheck
import type { Request, Response } from "express";
import { generateProofService } from '../services/proofService.js';

export async function generateProofController(req: Request, res: Response) {
  console.log('Proof generation request received');
  let timeoutId;
  try {
    const { qrCode, signal } = req.body;
    console.log('Request body:', { qrCode: qrCode ? 'present' : 'missing', signal: signal ? 'present' : 'missing' });
    
    if (!qrCode || !signal) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'QR code and signal are required' });
    }
    
    console.log('Starting proof generation');
    const proofPromise = generateProofService(qrCode, signal);
    
    timeoutId = setTimeout(() => {
      console.log('Controller: timeout reached');
      res.status(504).json({ error: 'Proof generation timed out after 15 minutes' });
    }, 900000);

    const proof = await proofPromise;
    
    clearTimeout(timeoutId);
    console.log('Proof generation completed');
    res.json({ proof });
  } catch (error) {
    console.error('Error generating proof:', error);
    if (!res.headersSent) {
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
  } finally {
    clearTimeout(timeoutId);
    console.log('Proof generation request handled');
  }
}