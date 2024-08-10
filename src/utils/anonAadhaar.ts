//@ts-nocheck
import { init, prove, ArtifactsOrigin, generateArgs } from "@anon-aadhaar/core";
import type { InitArgs } from "@anon-aadhaar/core";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { certificate } from "./certificate.js";
import { writeFile } from "fs/promises";
import { config } from "dotenv";
config();

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
    console.time('init');
    await init(anonAadhaarInitArgs);
    console.timeEnd('init');
    console.log('AnonAadhaar initialized');

    const nullifierSeed = BigInt("2222129237572311751221168725011824235124166");

    console.time('generateArgs');
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
    console.timeEnd('generateArgs');
    console.log('Args generated');

    console.time('prove');
    console.log('Starting prove function');
    let proofResult;
    try {
      const provePromise = prove(args);
      proofResult = await Promise.race([
        provePromise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Prove function timed out after 5 minutes')), 300000))
      ]);
      console.log('Prove function completed successfully');
    } catch (proveError) {
      console.error('Error or timeout in prove function:', proveError);
      throw proveError;
    }
    console.timeEnd('prove');

    console.time('writeFile');
    await writeFile(
      join(__dirname, "./proof.json"),
      JSON.stringify(proofResult),
    );
    console.timeEnd('writeFile');
    console.log('Proof written to file');
    return proofResult;

  } catch (error) {
    console.error("An error occurred in generateProof:", error);
    throw error;
  }
}
//generateProof(`${process.env.QR_CODE}`, "1234532454678").then(console.log).catch(console.error);
