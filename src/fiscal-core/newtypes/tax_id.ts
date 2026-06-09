import { FiscalError } from "../error.ts";
import { digitsOnly } from "../sanitize.ts";

/** Documento fiscal de pessoa física ou jurídica, armazenado apenas com dígitos. */
export class TaxId {
  /** CPF/CNPJ normalizado apenas com dígitos. */
  readonly value: string;

  /** Cria um documento fiscal aceitando CPF ou CNPJ. */
  constructor(value: string) {
    const digits = digitsOnly(value);
    if (digits.length !== 11 && digits.length !== 14) throw FiscalError.invalidTaxId("TaxId must be CPF or CNPJ.");
    this.value = digits;
  }

  /** Retorna os dígitos normalizados. */
  digits(): string {
    return this.value;
  }

  /** Indica se o documento tem tamanho de CPF. */
  isCpf(): boolean {
    return this.value.length === 11;
  }

  /** Indica se o documento tem tamanho de CNPJ. */
  isCnpj(): boolean {
    return this.value.length === 14;
  }

  /** Retorna os dígitos normalizados. */
  toString(): string {
    return this.value;
  }
}
