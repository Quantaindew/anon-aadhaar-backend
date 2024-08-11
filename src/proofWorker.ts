import { parentPort } from 'worker_threads';
import { generateProof } from './utils/anonAadhaar.js';

parentPort.on('message', async (job) => {
  try {
    const { qrCode, signal, jobId } = job;
    const proof = await generateProof(qrCode, signal);
    parentPort.postMessage({ jobId, success: true, proof });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
});