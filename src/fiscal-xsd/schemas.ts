import { join } from "node:path";
import { XsdSchema, vendoredSchemaRoot } from "./schema.ts";

function schemaDir(name: string): string {
  return join(vendoredSchemaRoot, name);
}

export function mdfe(): XsdSchema {
  return XsdSchema.fromDirectory("mdfe_v300", schemaDir("mdfe_300"), "mdfe_v3.00.xsd", [
    "mdfe_v3.00.xsd",
    "mdfeTiposBasico_v3.00.xsd",
    "tiposGeralMDFe_v3.00.xsd",
    "mdfeModalRodoviario_v3.00.xsd",
    "mdfeModalAereo_v3.00.xsd",
    "mdfeModalAquaviario_v3.00.xsd",
    "mdfeModalFerroviario_v3.00.xsd",
    "xmldsig-core-schema_v1.01.xsd",
  ]);
}

export function nfeLote(): XsdSchema {
  return XsdSchema.fromDirectory("nfe_lote_v400", schemaDir("nfe_pl010"), "enviNFe_v4.00.xsd", [
    "enviNFe_v4.00.xsd",
    "leiauteNFe_v4.00.xsd",
    "tiposBasico_v4.00.xsd",
    "xmldsig-core-schema_v1.01.xsd",
    "DFeTiposBasicos_v1.00.xsd",
  ]);
}

export const nfe_lote = nfeLote;

export function cte(): XsdSchema {
  return XsdSchema.fromDirectory("cte_v400", schemaDir("cte_400"), "cte_v4.00.xsd", [
    "cte_v4.00.xsd",
    "cteTiposBasico_v4.00.xsd",
    "tiposGeralCTe_v4.00.xsd",
    "xmldsig-core-schema_v1.01.xsd",
  ]);
}

export function cteos(): XsdSchema {
  return XsdSchema.fromDirectory("cteos_v400", schemaDir("cte_400"), "cteOS_v4.00.xsd", [
    "cteOS_v4.00.xsd",
    "cteTiposBasico_v4.00.xsd",
    "tiposGeralCTe_v4.00.xsd",
    "xmldsig-core-schema_v1.01.xsd",
  ]);
}

export function gtve(): XsdSchema {
  return XsdSchema.fromDirectory("gtve_v400", schemaDir("cte_400"), "GTVe_v4.00.xsd", [
    "GTVe_v4.00.xsd",
    "cteTiposBasico_v4.00.xsd",
    "tiposGeralCTe_v4.00.xsd",
    "xmldsig-core-schema_v1.01.xsd",
  ]);
}

export function bpe(): XsdSchema {
  return XsdSchema.fromDirectory("bpe_v100", schemaDir("bpe_100"), "bpe_v1.00.xsd", [
    "bpe_v1.00.xsd",
    "bpeTiposBasico_v1.00.xsd",
    "tiposGeralBPe_v1.00.xsd",
    "xmldsig-core-schema_v1.01.xsd",
  ]);
}

export function dps(): XsdSchema {
  return XsdSchema.fromDirectory("dps_v101", schemaDir("nfse_101"), "DPS_v1.01.xsd", [
    "DPS_v1.01.xsd",
    "tiposComplexos_v1.01.xsd",
    "tiposSimples_v1.01.xsd",
    "xmldsig-core-schema.xsd",
  ]);
}

export function nfseEvento(): XsdSchema {
  return XsdSchema.fromDirectory("ped_evt_v101", schemaDir("nfse_101"), "pedRegEvento_v1.01.xsd", [
    "pedRegEvento_v1.01.xsd",
    "tiposEventos_v1.01.xsd",
    "tiposComplexos_v1.01.xsd",
    "tiposSimples_v1.01.xsd",
    "xmldsig-core-schema.xsd",
  ]);
}

export const nfse_evento = nfseEvento;

export function abrasfGerarNfse(): XsdSchema {
  return XsdSchema.fromDirectory("abrasf203_gerarnfse", schemaDir("abrasf_203"), "nfse.xsd", [
    "nfse.xsd",
    "xmldsig-core-schema.xsd",
  ]);
}

export const abrasf_gerar_nfse = abrasfGerarNfse;

export function spLoteRps(): XsdSchema {
  return XsdSchema.fromDirectory("sp_lote_rps_v01", schemaDir("saopaulo_v01"), "PedidoEnvioLoteRPS_v01.xsd", [
    "PedidoEnvioLoteRPS_v01.xsd",
    "TiposNFe_v01.xsd",
    "xmldsig-core-schema_v01.xsd",
  ]);
}

export const sp_lote_rps = spLoteRps;

export function spLoteRpsV2(): XsdSchema {
  return XsdSchema.fromDirectory("sp_lote_rps_v02", schemaDir("saopaulo_v02"), "PedidoEnvioLoteRPS_v02.xsd", [
    "PedidoEnvioLoteRPS_v02.xsd",
    "TiposNFe_v02.xsd",
    "xmldsig-core-schema_v02.xsd",
  ]);
}

export const sp_lote_rps_v2 = spLoteRpsV2;
