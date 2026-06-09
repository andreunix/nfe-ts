import * as schemaBundles from "./schemas.ts";

export type { XsdFile } from "./schema.ts";
export { XsdSchema, XsdSchemaClass, vendoredSchemaRoot } from "./schema.ts";

export const schemas = schemaBundles;
export const xsdSchemas = schemaBundles;

export {
  abrasfGerarNfse as xsdAbrasfGerarNfse,
  abrasf_gerar_nfse as xsd_abrasf_gerar_nfse,
  bpe as xsdBpe,
  cte as xsdCte,
  cteos as xsdCteos,
  dps as xsdDps,
  gtve as xsdGtve,
  mdfe as xsdMdfe,
  nfeLote as xsdNfeLote,
  nfe_lote as xsd_nfe_lote,
  nfseEvento as xsdNfseEvento,
  nfse_evento as xsd_nfse_evento,
  spLoteRps as xsdSpLoteRps,
  spLoteRpsV2 as xsdSpLoteRpsV2,
  sp_lote_rps as xsd_sp_lote_rps,
  sp_lote_rps_v2 as xsd_sp_lote_rps_v2,
} from "./schemas.ts";
