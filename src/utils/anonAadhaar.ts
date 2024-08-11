import { init, prove, ArtifactsOrigin, generateArgs } from "@anon-aadhaar/core";
import type { InitArgs } from "@anon-aadhaar/core";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { certificate } from "./certificate.js";
import { writeFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const artifactsDirName = join(__dirname, "../public");

const anonAadhaarInitArgs: InitArgs = {
  wasmURL: join(artifactsDirName, "aadhaar-verifier.wasm"),
  zkeyURL: join(artifactsDirName, "circuit_final.zkey"),
  vkeyURL: join(artifactsDirName, "vkey.json"),
  artifactsOrigin: ArtifactsOrigin.local,
};

export async function generateProof(qrCode: string, signal: string) {
  console.log('generateProof started');
  try {
    console.log('Initializing AnonAadhaar...');
    await init(anonAadhaarInitArgs);
    console.log('AnonAadhaar initialized');

    const nullifierSeed = BigInt("2222129237572311751221168725011824235124166");

    console.log('Generating args...');
    const args = await generateArgs({
      qrData: qrCode,
      certificateFile: certificate,
      signal: signal,
      nullifierSeed,
      fieldsToRevealArray: [
        "revealAgeAbove18",
        "revealGender",
        "revealPinCode",
        "revealState",
      ],
    });
    console.log('Args generated');

    console.log('Starting prove function');
    const startTime = Date.now();
    let proofResult;
    try {
      // Run garbage collection before starting the prove function
      if (global.gc) {
        global.gc();
      }
      proofResult = await prove(args);
    } catch (proveError) {
      console.error('Error in prove function:', proveError);
      throw new Error(`Prove function failed: ${proveError.message}`);
    }
    const endTime = Date.now();
    console.log(`Prove function completed in ${(endTime - startTime) / 1000} seconds`);

    // Run garbage collection after the prove function
    if (global.gc) {
      global.gc();
    }

    console.log('Writing proof to file...');
    await writeFile(
      join(__dirname, "./proof.json"),
      JSON.stringify(proofResult),
    );
    console.log('Proof written to file');
    
    return proofResult;

  } catch (error) {
    console.error("An error occurred in generateProof:", error);
    throw error;
  }
}