export class MunError extends Error {
  readonly kind: string;

  constructor(kind: string, message: string) {
    super(message);
    this.name = "MunError";
    this.kind = kind;
  }

  static municipioNaoSuportado(value: string): MunError {
    return new MunError("MunicipioNaoSuportado", `município não suportado: ${value}`);
  }

  static naoImplementado(operation: string): MunError {
    return new MunError("NaoImplementado", `não implementado: ${operation}`);
  }

  static validacao(message: string): MunError {
    return new MunError("Validacao", `validação: ${message}`);
  }

  static xml(message: string): MunError {
    return new MunError("Xml", `xml: ${message}`);
  }

  static assinatura(message: string): MunError {
    return new MunError("Assinatura", `assinatura: ${message}`);
  }

  static transporte(message: string): MunError {
    return new MunError("Transporte", `transporte: ${message}`);
  }
}

export type Result<T> = T;
