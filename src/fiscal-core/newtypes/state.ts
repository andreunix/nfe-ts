import { FiscalError } from "../error.ts";
import { getStateCode } from "../state_codes.ts";

/** UF brasileira validada contra a tabela de códigos IBGE. */
export class StateCode {
  /** Sigla da UF em maiúsculas. */
  readonly uf: string;

  /** Cria uma UF validada. */
  constructor(uf: string) {
    getStateCode(uf);
    this.uf = uf.toUpperCase();
  }

  /** Retorna o código IBGE correspondente à UF. */
  ibgeCode(): string {
    return getStateCode(this.uf);
  }

  /** Retorna a sigla da UF. */
  toString(): string {
    return this.uf;
  }
}

/** Código IBGE numérico usado em municípios/UFs. */
export class IbgeCode {
  /** Valor textual do código IBGE. */
  readonly value: string;

  /** Cria um código IBGE validando apenas o formato numérico. */
  constructor(value: string) {
    if (!/^\d+$/.test(value)) throw FiscalError.invalidStateCode(value);
    this.value = value;
  }

  /** Retorna o valor textual do código IBGE. */
  toString(): string {
    return this.value;
  }
}
