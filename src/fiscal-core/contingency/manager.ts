import { FiscalError } from "../error.ts";
import { getStateCode } from "../state_codes.ts";
import {
  ContingencyType,
  EmissionType,
  InvoiceModel,
  contingencyTypeEmissionType,
  contingencyTypeFromTypeString,
  contingencyTypeToTypeString,
} from "../types/enums.ts";

/** Estado da emissão em contingência para NF-e/NFC-e. */
export class Contingency {
  /** Indica se a contingência está ativa. */
  active = false;
  /** Tipo de contingência ativo. */
  type?: ContingencyType;
  /** Justificativa da entrada em contingência. */
  reason?: string;
  /** Data/hora de início da contingência. */
  startedAt?: string;

  /** Ativa contingência com tipo, justificativa e data opcional. */
  activate(type: ContingencyType, reason: string, startedAt = new Date().toISOString()): this {
    this.active = true;
    this.type = type;
    this.reason = reason;
    this.startedAt = startedAt;
    return this;
  }

  /** Desativa contingência e limpa seus metadados. */
  deactivate(): this {
    this.active = false;
    this.type = undefined;
    this.reason = undefined;
    this.startedAt = undefined;
    return this;
  }

  /** Retorna se a contingência está ativa. */
  isActive(): boolean {
    return this.active;
  }

  /** Retorna o código `tpEmis` aplicável ao estado atual. */
  emissionType(): EmissionType {
    return this.active && this.type ? contingencyTypeEmissionType(this.type) : EmissionType.Normal;
  }

  /** Retorna o enum de tipo de emissão equivalente ao estado atual. */
  emissionTypeEnum(): EmissionType {
    return this.emissionType();
  }

  /** Serializa a contingência em JSON compatível com a representação do Rust/PHP. */
  toJSON(): string {
    return JSON.stringify({
      active: this.active,
      type: this.type ? contingencyTypeToTypeString(this.type) : undefined,
      reason: this.reason,
      startedAt: this.startedAt,
    });
  }

  /** Carrega uma contingência previamente serializada em JSON. */
  static load(json: string): Contingency {
    const data = JSON.parse(json) as { active?: boolean; type?: string; reason?: string; startedAt?: string };
    const contingency = new Contingency();
    if (data.active && data.type) {
      const type = contingencyTypeFromTypeString(data.type);
      if (!type) throw FiscalError.validation(`Invalid contingency type: ${data.type}`);
      contingency.activate(type, data.reason ?? "", data.startedAt);
    }
    return contingency;
  }

  /** Ponto de extensão para checar disponibilidade do web service da SEFAZ. */
  checkWebServiceAvailability(_model: InvoiceModel): void {
    if (!this.active) return;
  }
}

/** Retorna o tipo de contingência padrão para a UF informada. */
export function contingencyForState(uf: string): ContingencyType {
  const normalized = uf.toUpperCase();
  return ["AC", "AL", "AP", "BA", "CE", "DF", "ES", "MG", "PB", "PE", "PI", "RJ", "RN", "RO", "RR", "SC", "SE", "SP", "TO"].includes(normalized)
    ? ContingencyType.SvcAn
    : ContingencyType.SvcRs;
}
export const contingency_for_state = contingencyForState;

/** Valida a UF e retorna o tipo de contingência correspondente. */
export function tryContingencyForState(uf: string): ContingencyType {
  getStateCode(uf);
  return contingencyForState(uf);
}
export const try_contingency_for_state = tryContingencyForState;
