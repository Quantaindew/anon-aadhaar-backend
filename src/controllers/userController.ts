//@ts-nocheck
import type { Request, Response } from "express";
import { generateProofService } from '../services/proofService.js';
import { ABI } from "../utils/contractABI.js";
import { ethers } from 'ethers';
import { data } from '../../sampledata.js'
import { writeFile } from 'fs/promises';
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { config } from "dotenv";
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export async function userController(req: Request, res: Response) {
    let { address, nullifierSeed, nullifier, timestamp, signal, revealArray, groth16Proof, nonce, signature, messageHash } = req.body;
    
    writeFile(
        join(__dirname, "./data.json"),
        JSON.stringify(req.body),
    );
    signal = BigInt(signal)
    nonce = BigInt(nonce)
    try {
        const provider = new ethers.JsonRpcProvider(`${process.env.RPC_URL}`);
        
        const relayerPrivateKey = `${process.env.RELAYER_PRIVATE_KEY}`;
        if (!relayerPrivateKey) {
            throw new Error("Private keys not found in .env file");
        }
        console.log("A")
        const relayerWallet = new ethers.Wallet(relayerPrivateKey, provider);
        console.log("Relayer wallet address:", relayerWallet.address);

        const contractAddress = '0x1e0F5B806D70F7BEf0e1bB9338347746b3a875e4';
        const contract = new ethers.Contract(contractAddress, ABI, relayerWallet);

        console.log('Adding user gasless...');
        console.log({
            address,
          nullifierSeed,
          nullifier,
          timestamp,
          signal,
          revealArray,
          groth16Proof,
          nonce,
          signature,
          messageHash
        })
        const tx = await contract.addUserGasless(
          address,
          nullifierSeed,
          nullifier,
          timestamp,
          signal,
          revealArray,
          groth16Proof,
          nonce,
          signature
        );
        console.log('Transaction sent:', tx.hash);
        const receipt = await tx.wait();
        console.log('Transaction confirmed in block:', receipt.blockNumber);
  
        // Fetch and log user data
        const userData = await contract.getUserByAddress(address);
        res.json({user})
    } catch (error) {
        res.json({error})
    }
}