//@ts-nocheck
import type { Request, Response } from "express";
import { generateProofService } from '../services/proofService.js';

export async function generateProofController(req: Request, res: Response) {
  try {
    const { qrCode, signal } = req.body;
    if (!qrCode || !signal) {
      return res.status(400).json({ error: 'QR code and signal are required' });
    }
    const proof = await generateProofService(qrCode, signal);
    res.json({ proof });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while generating the proof' });
  }
}