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
  try {
    await init(anonAadhaarInitArgs);

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
    console.log("args", args);
    const anonAadhaarCore = await prove(args);
    //
    writeFile(
      join(__dirname, "./proof.json"),
      JSON.stringify(anonAadhaarCore),
    );
    return anonAadhaarCore;
  } catch (error) {
    console.error("An error occurred:", error);
    throw error;
  }
}

//generateProof(`${process.env.QR_CODE}`, "1234532454678").then(console.log).catch(console.error);
