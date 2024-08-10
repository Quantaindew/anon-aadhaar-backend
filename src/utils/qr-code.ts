//@ts-nocheck
import { config } from "dotenv";
config();

export const qrCode : string = process.env.QR_CODE || "QR_CODE";