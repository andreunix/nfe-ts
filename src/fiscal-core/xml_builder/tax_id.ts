import { tag } from "../xml_utils.ts";

/** Auxiliar para detectar CPF/CNPJ e montar a tag XML adequada. */
export class TaxId {
  /** Documento normalizado apenas com dígitos. */
  readonly value: string;

  /** Cria o auxiliar a partir de CPF/CNPJ bruto. */
  constructor(value: string) {
    this.value = value.replace(/\D/g, "");
  }

  /** Um CPF possui até 11 dígitos. */
  isCpf(): boolean {
    return this.value.length <= 11;
  }

  /** Nome da tag XML correspondente: `CPF` ou `CNPJ`. */
  tagName(): "CPF" | "CNPJ" {
    return this.isCpf() ? "CPF" : "CNPJ";
  }

  /** Documento com zero à esquerda até 11 ou 14 dígitos. */
  padded(): string {
    return this.value.padStart(this.isCpf() ? 11 : 14, "0");
  }

  /** Monta `<CPF>...</CPF>` ou `<CNPJ>...</CNPJ>`. */
  toXmlTag(): string {
    return tag(this.tagName(), this.padded());
  }
}
