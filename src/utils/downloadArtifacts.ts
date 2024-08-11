import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactsDir = path.join(__dirname, '..', 'public');
const artifactsBaseUrl = 'https://anon-aadhaar-artifacts.s3.eu-central-1.amazonaws.com/v2.0.0/';

const artifacts = [
  { filename: 'aadhaar-verifier.wasm', url: `${artifactsBaseUrl}aadhaar-verifier.wasm` },
  { filename: 'vkey.json', url: `${artifactsBaseUrl}vkey.json` },
  { filename: 'circuit_final.zkey', url: `${artifactsBaseUrl}circuit_final.zkey` },
];

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest).catch(() => {});
      reject(err);
    });
  });
}

export async function downloadArtifacts(): Promise<void> {
  try {
    await fs.mkdir(artifactsDir, { recursive: true });

    for (const artifact of artifacts) {
      const filePath = path.join(artifactsDir, artifact.filename);
      if (!(await fs.stat(filePath).catch(() => false))) {
        console.log(`Downloading ${artifact.filename}...`);
        await downloadFile(artifact.url, filePath);
        console.log(`${artifact.filename} downloaded successfully.`);
      } else {
        console.log(`${artifact.filename} already exists.`);
      }
    }

    console.log('All artifacts are ready.');
  } catch (error) {
    console.error('Error downloading artifacts:', error);
    throw error;
  }
}