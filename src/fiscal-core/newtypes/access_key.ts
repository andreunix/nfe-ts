import { FiscalError } from "../error.ts";
import { digitsOnly } from "../sanitize.ts";
import { getStateCode } from "../state_codes.ts";

/** Chave de acesso NF-e/NFC-e com 44 dígitos e acesso aos seus segmentos. */
export class AccessKey {
  /** Chave normalizada apenas com dígitos. */
  readonly value: string;

  /** Cria e valida uma chave de acesso com 44 dígitos. */
  constructor(value: string) {
    const key = digitsOnly(value);
    if (!/^\d{44}$/.test(key)) throw FiscalError.invalidAccessKey("Access key must have 44 digits.");
    this.value = key;
  }

  /** Código IBGE da UF, posições 1-2. */
  stateCode(): string { return this.value.slice(0, 2); }
  /** Ano e mês de emissão, posições 3-6. */
  yearMonth(): string { return this.value.slice(2, 6); }
  /** CNPJ do emitente, posições 7-20. */
  taxId(): string { return this.value.slice(6, 20); }
  /** Modelo do documento, posições 21-22. */
  model(): string { return this.value.slice(20, 22); }
  /** Série do documento, posições 23-25. */
  series(): string { return this.value.slice(22, 25); }
  /** Número do documento, posições 26-34. */
  number(): string { return this.value.slice(25, 34); }
  /** Tipo de emissão, posição 35. */
  emissionType(): string { return this.value.slice(34, 35); }
  /** Código numérico, posições 36-43. */
  numericCode(): string { return this.value.slice(35, 43); }
  /** Dígito verificador, posição 44. */
  checkDigit(): string { return this.value.slice(43, 44); }

  /** Valida se a UF da chave corresponde à UF esperada. */
  validateUf(expectedUf: string): void {
    const expectedCode = getStateCode(expectedUf);
    if (this.stateCode() !== expectedCode) {
      throw FiscalError.invalidAccessKey(`Access key UF ${this.stateCode()} does not match ${expectedUf}/${expectedCode}.`);
    }
  }

  /** Retorna a chave normalizada. */
  toString(): string {
    return this.value;
  }
}
