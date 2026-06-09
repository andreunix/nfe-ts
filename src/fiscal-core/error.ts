/**
 * Erro base do fiscal-core.
 *
 * O campo `kind` reproduz as variantes de erro do Rust de forma simples para
 * facilitar tratamento programático em TypeScript.
 */
export class FiscalError extends Error {
  /** Categoria estável do erro. */
  readonly kind: string;

  /** Cria um erro fiscal com categoria e mensagem. */
  constructor(kind: string, message: string) {
    super(message);
    this.name = "FiscalError";
    this.kind = kind;
  }

  /** Erro usado quando um GTIN/EAN é inválido. */
  static invalidGtin(message: string): FiscalError {
    return new FiscalError("InvalidGtin", message);
  }

  /** Erro usado quando UF ou código IBGE não existe na tabela conhecida. */
  static invalidStateCode(value: string): FiscalError {
    return new FiscalError("InvalidStateCode", `Invalid Brazilian state code: ${value}`);
  }

  /** Erro usado quando a chave de acesso da NF-e/NFC-e é inválida. */
  static invalidAccessKey(message: string): FiscalError {
    return new FiscalError("InvalidAccessKey", message);
  }

  /** Erro usado quando CPF/CNPJ não tem formato aceito. */
  static invalidTaxId(message: string): FiscalError {
    return new FiscalError("InvalidTaxId", message);
  }

  /** Erro usado em montagem, extração ou injeção de XML. */
  static xml(message: string): FiscalError {
    return new FiscalError("Xml", message);
  }

  /** Erro usado quando uma resposta XML não contém a estrutura esperada. */
  static xmlParsing(message: string): FiscalError {
    return new FiscalError("XmlParsing", message);
  }

  /** Erro genérico de validação de dados fiscais. */
  static validation(message: string): FiscalError {
    return new FiscalError("Validation", message);
  }

  /** Erro usado quando o TXT não segue o layout esperado. */
  static invalidTxt(message: string): FiscalError {
    return new FiscalError("InvalidTxt", message);
  }

  /** Erro usado quando o documento informado não é do tipo esperado. */
  static wrongDocument(message: string): FiscalError {
    return new FiscalError("WrongDocument", message);
  }

  /** Erro usado quando a geração de XML falha por dados inconsistentes. */
  static xmlGeneration(message: string): FiscalError {
    return new FiscalError("XmlGeneration", message);
  }

  /** Erro usado em certificado digital, PFX, chave privada ou assinatura. */
  static certificate(message: string): FiscalError {
    return new FiscalError("Certificate", message);
  }
}
