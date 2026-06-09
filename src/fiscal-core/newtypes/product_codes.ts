import { FiscalError } from "../error.ts";
import { isValidGtin } from "../gtin.ts";

/** GTIN validado para uso em produtos fiscais. */
export class Gtin {
  /** Código GTIN ou `SEM GTIN`. */
  readonly value: string;

  /** Cria e valida um GTIN; string vazia vira `SEM GTIN`. */
  constructor(value: string) {
    isValidGtin(value);
    this.value = value || "SEM GTIN";
  }

  /** Retorna o valor textual do GTIN. */
  asString(): string {
    return this.value;
  }

  /** Indica se o produto está marcado como sem GTIN. */
  isSemGtin(): boolean {
    return this.value === "SEM GTIN";
  }

  /** Retorna o valor textual do GTIN. */
  toString(): string {
    return this.value;
  }
}

/** Código NCM validado em formato de 2 ou 8 dígitos. */
export class Ncm {
  /** Valor textual do NCM. */
  readonly value: string;

  /** Cria e valida um código NCM. */
  constructor(value: string) {
    if (!/^\d{2}(\d{6})?$/.test(value)) throw FiscalError.validation(`NCM must have 2 or 8 digits: ${value}`);
    this.value = value;
  }

  /** Retorna o valor textual do NCM. */
  toString(): string {
    return this.value;
  }
}

/** Código CFOP validado em formato de 4 dígitos. */
export class Cfop {
  /** Valor textual do CFOP. */
  readonly value: string;

  /** Cria e valida um CFOP. */
  constructor(value: string) {
    if (!/^\d{4}$/.test(value)) throw FiscalError.validation(`CFOP must have 4 digits: ${value}`);
    this.value = value;
  }

  /** Indica se o CFOP representa operação de entrada. */
  isEntrada(): boolean {
    return ["1", "2", "3"].includes(this.value[0] ?? "");
  }

  /** Indica se o CFOP representa operação de saída. */
  isSaida(): boolean {
    return ["5", "6", "7"].includes(this.value[0] ?? "");
  }

  /** Retorna o valor textual do CFOP. */
  toString(): string {
    return this.value;
  }
}
