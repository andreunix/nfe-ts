/** CT-e leiaute 4.00. */
export const CTE_NAMESPACE = "http://www.portalfiscal.inf.br/cte";
export const CTE_VERSION = "4.00";

/** Metadados SOAP de um serviço CT-e. */
export interface CteServiceMeta {
  method: string;
  operation: string;
  version: string;
}

/** Serviços CT-e conhecidos. */
export enum CteService {
  StatusServico = "StatusServico",
  Consulta = "Consulta",
  RecepcaoSinc = "RecepcaoSinc",
  RecepcaoEvento = "RecepcaoEvento",
  RecepcaoGTVe = "RecepcaoGTVe",
}

/** Retorna metadados SOAP do serviço CT-e. */
export function getCteServiceMeta(service: CteService): CteServiceMeta {
  switch (service) {
    case CteService.StatusServico:
      return { method: "cteStatusServicoCT", operation: "CTeStatusServicoV4", version: CTE_VERSION };
    case CteService.Consulta:
      return { method: "cteConsultaCT", operation: "CTeConsultaV4", version: CTE_VERSION };
    case CteService.RecepcaoSinc:
      return { method: "cteRecepcao", operation: "CTeRecepcaoSincV4", version: CTE_VERSION };
    case CteService.RecepcaoEvento:
      return { method: "cteRecepcaoEvento", operation: "CTeRecepcaoEventoV4", version: CTE_VERSION };
    case CteService.RecepcaoGTVe:
      return { method: "cteRecepcaoGTVe", operation: "CTeRecepcaoGTVe", version: CTE_VERSION };
  }
}

/** Chave de URL CT-e, igual à operação WSDL. */
export function getCteServiceUrlKey(service: CteService): string {
  return getCteServiceMeta(service).operation;
}

export * from "./response_parsers.ts";
export * from "./request_builders.ts";
export * from "./events.ts";
export * from "./soap.ts";
export * from "./urls.ts";
