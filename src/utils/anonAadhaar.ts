//@ts-nocheck
import { init, prove, ArtifactsOrigin, generateArgs } from "@anon-aadhaar/core";
import type { InitArgs } from "@anon-aadhaar/core";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { certificate } from "./certificate.js";
import { writeFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const artifactsDirName = join(__dirname, "../../public");

const anonAadhaarInitArgs: InitArgs = {
  wasmURL: join(artifactsDirName, "aadhaar-verifier.wasm"),
  zkeyURL: join(artifactsDirName, "circuit_final.zkey"),
  vkeyURL: join(artifactsDirName, "vkey.json"),
  artifactsOrigin: ArtifactsOrigin.local,
};

export async function generateProof(qrCode: string, signal: string) {
  console.log('generateProof started');
  try {
    await init(anonAadhaarInitArgs);
    console.log('AnonAadhaar initialized');

    const nullifierSeed = BigInt("2222129237572311751221168725011824235124166");

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
    const proofResult = await prove(args);
    console.log("Proof generated", proofResult);
    console.log('Prove function completed successfully');

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