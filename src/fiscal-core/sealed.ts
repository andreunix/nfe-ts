/** Símbolo interno usado para simular o padrão sealed traits do Rust. */
export const sealed = Symbol("fiscal-core.sealed");

/** Marcador interno de tipos selados. */
export interface Sealed {
  /** Propriedade simbólica inacessível por convenção a consumidores externos. */
  readonly [sealed]?: true;
}
