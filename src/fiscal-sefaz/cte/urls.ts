import { SefazEnvironment } from "../../fiscal-core/types/enums.ts";

const SVRS_PROD = "https://cte.svrs.rs.gov.br/ws";
const SVRS_HOM = "https://cte-homologacao.svrs.rs.gov.br/ws";
const SP_PROD = "https://nfe.fazenda.sp.gov.br/cteWEB/services";
const SP_HOM = "https://homologacao.nfe.fazenda.sp.gov.br/cteWEB/services";

const PATHS: Record<string, string> = {
  CTeStatusServicoV4: "CTeStatusServicoV4",
  CTeConsultaV4: "CTeConsultaV4",
  CTeRecepcaoSincV4: "CTeRecepcaoSincV4",
  CTeRecepcaoEventoV4: "CTeRecepcaoEventoV4",
  CTeRecepcaoGTVe: "CTeRecepcaoGTVe",
};

/** Resolve endpoint CT-e por UF, ambiente e serviço. */
export function getCteUrl(uf: string, environment: SefazEnvironment, service: string): string | undefined {
  const key = PATHS[service] ? service : service.replace(/^.*\//u, "");
  const path = PATHS[key];
  if (!path) return undefined;
  const upper = uf.toUpperCase();
  const base = upper === "SP" ? (environment === SefazEnvironment.Production ? SP_PROD : SP_HOM) : (environment === SefazEnvironment.Production ? SVRS_PROD : SVRS_HOM);
  return `${base}/${path}`;
}

export const get_cte_url = getCteUrl;

