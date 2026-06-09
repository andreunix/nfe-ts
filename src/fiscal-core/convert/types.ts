import type { FiscalRecord } from "../core.ts";

/** Mapa de campos parseados de uma entidade TXT. */
export type Fields = Record<string, string>;

/** Linha TXT parseada em referência e campos posicionais. */
export interface TxtEntity {
  /** Código da entidade, por exemplo `A`, `C`, `I`. */
  ref: string;
  /** Campos brutos sem a referência inicial. */
  fields: string[];
  /** Linha original. */
  raw: string;
}

/** Item acumulado durante conversão TXT -> XML. */
export interface ItemBuild extends FiscalRecord {
  /** Número do item. */
  item_number: number;
  /** Produto parseado. */
  prod: Fields;
  /** Impostos e grupos auxiliares parseados. */
  taxes: TxtEntity[];
}

/** Documento parseado em memória antes da geração XML. */
export interface ParsedInvoice {
  /** Versão do layout declarada na entidade A. */
  version: string;
  /** Todas as entidades do documento. */
  entities: TxtEntity[];
  /** Entidade A. */
  header?: TxtEntity;
  /** Itens encontrados. */
  items: ItemBuild[];
}
