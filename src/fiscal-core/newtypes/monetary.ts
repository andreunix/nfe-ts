import { formatCents2, formatRate, formatRate4 } from "../format_utils.ts";

/** Valor monetário armazenado em centavos. */
export class Cents {
  /** Quantidade inteira de centavos. */
  readonly value: number;

  /** Cria um valor monetário a partir de inteiro em centavos. */
  constructor(value: number | bigint) {
    this.value = Number(value);
  }

  /** Soma outro valor em centavos e retorna nova instância. */
  add(other: Cents | number | bigint): Cents {
    return new Cents(this.value + unwrapNumber(other));
  }

  /** Formata o valor com duas casas decimais. */
  toString(): string {
    return formatCents2(this.value);
  }

  /** Permite usar `Cents` em operações numéricas quando necessário. */
  valueOf(): number {
    return this.value;
  }
}

/** Alíquota armazenada em centésimos de percentual. */
export class Rate {
  /** Valor inteiro da alíquota escalada. */
  readonly value: number;

  /** Cria uma alíquota a partir de inteiro escalado em 100. */
  constructor(value: number | bigint) {
    this.value = Number(value);
  }

  /** Formata a alíquota com quatro casas decimais. */
  toString(): string {
    return formatRate(this.value, 4);
  }

  /** Permite usar `Rate` em operações numéricas quando necessário. */
  valueOf(): number {
    return this.value;
  }
}

/** Alíquota armazenada como valor multiplicado por 10.000. */
export class Rate4 {
  /** Valor inteiro da alíquota escalada. */
  readonly value: number;

  /** Cria uma alíquota a partir de inteiro escalado em 10.000. */
  constructor(value: number | bigint) {
    this.value = Number(value);
  }

  /** Formata a alíquota com quatro casas decimais. */
  toString(): string {
    return formatRate4(this.value);
  }

  /** Permite usar `Rate4` em operações numéricas quando necessário. */
  valueOf(): number {
    return this.value;
  }
}

/** Extrai o número interno de newtypes monetários ou retorna zero para nulos. */
export function unwrapNumber(value: Cents | Rate | Rate4 | number | bigint | undefined | null): number {
  if (value instanceof Cents || value instanceof Rate || value instanceof Rate4) return value.value;
  return Number(value ?? 0);
}
