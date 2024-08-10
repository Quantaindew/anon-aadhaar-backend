import { generateProof } from '../utils/anonAadhaar.js';

export async function generateProofService(qrCode: string, signal: string) {
  console.log('generateProofService started');
  try {
    const result = await generateProof(qrCode, signal);
    console.log('generateProofService completed successfully');
    return result;
  } catch (error) {
    console.error('Error in generateProofService:', error);
    throw error;
  }
}