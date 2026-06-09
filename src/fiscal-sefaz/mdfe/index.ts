/** MDF-e leiaute 3.00. */
export const MDFE_NAMESPACE = "http://www.portalfiscal.inf.br/mdfe";
export const MDFE_VERSION = "3.00";

/** Metadados SOAP de um serviço MDF-e. */
export interface MdfeServiceMeta {
  method: string;
  operation: string;
  version: string;
}

/** Serviços MDF-e conhecidos. */
export enum MdfeService {
  StatusServico = "StatusServico",
  Consulta = "Consulta",
  RecepcaoSinc = "RecepcaoSinc",
  Recepcao = "Recepcao",
  RetRecepcao = "RetRecepcao",
  RecepcaoEvento = "RecepcaoEvento",
  ConsNaoEnc = "ConsNaoEnc",
}

/** Retorna metadados SOAP do serviço MDF-e. */
export function getMdfeServiceMeta(service: MdfeService): MdfeServiceMeta {
  switch (service) {
    case MdfeService.StatusServico:
      return { method: "mdfeStatusServicoMDF", operation: "MDFeStatusServico", version: MDFE_VERSION };
    case MdfeService.Consulta:
      return { method: "mdfeConsultaMDF", operation: "MDFeConsulta", version: MDFE_VERSION };
    case MdfeService.RecepcaoSinc:
      return { method: "mdfeRecepcao", operation: "MDFeRecepcaoSinc", version: MDFE_VERSION };
    case MdfeService.Recepcao:
      return { method: "mdfeRecepcaoLote", operation: "MDFeRecepcao", version: MDFE_VERSION };
    case MdfeService.RetRecepcao:
      return { method: "mdfeRetRecepcao", operation: "MDFeRetRecepcao", version: MDFE_VERSION };
    case MdfeService.RecepcaoEvento:
      return { method: "mdfeRecepcaoEvento", operation: "MDFeRecepcaoEvento", version: MDFE_VERSION };
    case MdfeService.ConsNaoEnc:
      return { method: "mdfeConsNaoEnc", operation: "MDFeConsNaoEnc", version: MDFE_VERSION };
  }
}

/** Chave de URL MDF-e, igual à operação WSDL. */
export function getMdfeServiceUrlKey(service: MdfeService): string {
  return getMdfeServiceMeta(service).operation;
}

export * from "./response_parsers.ts";
export * from "./events.ts";
export * from "./request_builders.ts";
export * from "./soap.ts";
export * from "./urls.ts";
