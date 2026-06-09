/**
 * Tipos de cobrança da NF-e.
 *
 * Agrupa fatura e duplicatas para espelhar o módulo `billing` do Rust e evitar
 * que dados financeiros de cobrança fiquem misturados com totais tributários.
 */
export type { BillingData, BillingInvoice, Installment } from "./index.ts";
