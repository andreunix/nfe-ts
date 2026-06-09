/**
 * Tipos de parâmetros para QR Code.
 *
 * Reexporta os contratos usados por `qrcode.ts` para preservar o mesmo ponto de
 * importação do Rust (`types::qrcode_params`).
 */
export type { NfceQrCodeParams, PutQRTagParams } from "../qrcode.ts";
export type { FiscalData as QrCodeParamsData } from "./index.ts";
