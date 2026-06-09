/**
 * Tipos de informações adicionais da NF-e.
 *
 * O Rust mantém esses contratos em um arquivo próprio para deixar claro que
 * observações, processos, locais e responsável técnico pertencem ao bloco
 * opcional/informativo do documento. Este módulo preserva a mesma fronteira.
 */
export type {
  AdditionalInfo,
  ExportData,
  FieldText,
  IntermediaryData,
  LocationData,
  ProcessRef,
  PurchaseData,
  TechResponsibleData,
} from "./index.ts";
