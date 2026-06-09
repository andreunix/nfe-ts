import { SefazEnvironment } from "../../fiscal-core/types/enums.ts";

const PROD = "https://mdfe.svrs.rs.gov.br/ws";
const HOM = "https://mdfe-homologacao.svrs.rs.gov.br/ws";

const PATHS: Record<string, string> = {
  MDFeStatusServico: "MDFeStatusServico/MDFeStatusServico.asmx",
  MDFeConsulta: "MDFeConsulta/MDFeConsulta.asmx",
  MDFeRecepcaoSinc: "MDFeRecepcaoSinc/MDFeRecepcaoSinc.asmx",
  MDFeRecepcao: "MDFeRecepcao/MDFeRecepcao.asmx",
  MDFeRetRecepcao: "MDFeRetRecepcao/MDFeRetRecepcao.asmx",
  MDFeRecepcaoEvento: "MDFeRecepcaoEvento/MDFeRecepcaoEvento.asmx",
  MDFeConsNaoEnc: "MDFeConsNaoEnc/MDFeConsNaoEnc.asmx",
};

/** Resolve endpoint MDF-e. Todas as UFs autorizam MDF-e via SVRS. */
export function getMdfeUrl(_uf: string, environment: SefazEnvironment, service: string): string | undefined {
  const path = PATHS[service];
  if (!path) return undefined;
  return `${environment === SefazEnvironment.Production ? PROD : HOM}/${path}`;
}

export const get_mdfe_url = getMdfeUrl;

