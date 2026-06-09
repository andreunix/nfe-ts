/** Valor primitivo aceito pelos helpers de serialização XML. */
export type Primitive = string | number | boolean | bigint | null | undefined;

/** Registro flexível usado para representar dados fiscais ainda não modelados por classes específicas. */
export type FiscalRecord = Record<string, unknown>;

/**
 * Builder simples para montar objetos fiscais por encadeamento.
 *
 * É útil enquanto a porta TypeScript mantém parte dos tipos como estruturas
 * abertas, equivalentes aos structs públicos do Rust.
 */
export class FiscalDataBuilder<T extends FiscalRecord = FiscalRecord> {
  /** Objeto acumulado pelo builder. */
  readonly data: T;

  /** Cria um builder a partir de um objeto inicial opcional. */
  constructor(data: T = {} as T) {
    this.data = data;
  }

  /** Define um campo arbitrário e retorna o próprio builder para encadeamento. */
  set(key: string, value: unknown): this {
    (this.data as FiscalRecord)[key] = value;
    return this;
  }

  /** Retorna o objeto final montado. */
  build(): T {
    return this.data;
  }
}

/** Atalho para iniciar um `FiscalDataBuilder` com inferência do tipo do objeto. */
export function fiscalData<T extends FiscalRecord>(data: T): FiscalDataBuilder<T> {
  return new FiscalDataBuilder(data);
}
