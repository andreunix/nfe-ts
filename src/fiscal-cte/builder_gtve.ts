import { generateNumericCode, formatYearMonth } from "../fiscal-core/xml_builder/access_key.ts";
import { tag } from "../fiscal-core/xml_utils.ts";
import { buildCteAccessKey } from "./access_key.ts";
import { CTE_NAMESPACE, CTE_VERSION, CTEGTVE_MODEL } from "./constants.ts";
import { buildAutXml, buildCompl, buildDocumento, buildEndereco, buildInfRespTec, buildParty, formatDatetimeCte } from "./builder.ts";
import type { Emit } from "./types.ts";
import type { TomaOs } from "./types_os.ts";
import type { DetGtv, GtveBuildData, IdeGtve } from "./types_gtve.ts";

export function buildGtveXml(data: GtveBuildData): string {
  const numericCode = data.numeric_code ?? generateNumericCode();
  const accessKey = buildCteAccessKey({
    model: CTEGTVE_MODEL,
    state_code: data.ide.c_uf,
    year_month: formatYearMonth(data.ide.dh_emi),
    tax_id: data.emit_cnpj,
    series: data.ide.serie,
    number: data.ide.n_ct,
    emission_type: data.ide.tp_emis,
    numeric_code: numericCode,
  });
  const children = [buildIdeGtve(data.ide, accessKey.numeric_code, accessKey.key.slice(43, 44))];
  if (data.compl) children.push(buildCompl(data.compl));
  children.push(buildEmitGtve(data.emit), buildParty("rem", "enderReme", data.rem, false, false), buildParty("dest", "enderDest", data.dest, false, true));
  if (data.origem) children.push(buildEndereco("origem", data.origem, true));
  if (data.destino) children.push(buildEndereco("destino", data.destino, true));
  children.push(buildDetGtv(data.det_gtv));
  children.push(...(data.aut_xml ?? []).map(buildAutXml));
  if (data.inf_resp_tec) children.push(buildInfRespTec(data.inf_resp_tec));

  const infCte = tag("infCte", { versao: CTE_VERSION, Id: `CTe${accessKey.key}` }, children);
  return tag("GTVe", { xmlns: CTE_NAMESPACE, versao: CTE_VERSION }, [infCte]);
}

export const build_gtve_xml = buildGtveXml;

function buildIdeGtve(ide: IdeGtve, cCt: string, cDv: string): string {
  const children = [
    tag("cUF", ide.c_uf),
    tag("cCT", cCt),
    tag("CFOP", ide.cfop),
    tag("natOp", ide.nat_op),
    tag("mod", CTEGTVE_MODEL),
    tag("serie", String(ide.serie)),
    tag("nCT", String(ide.n_ct)),
    tag("dhEmi", formatDatetimeCte(ide.dh_emi, ide.uf_env)),
    tag("tpImp", ide.tp_imp),
    tag("tpEmis", ide.tp_emis),
    tag("cDV", cDv),
    tag("tpAmb", ide.tp_amb),
    tag("tpCTe", ide.tp_cte),
    tag("verProc", ide.ver_proc ?? "fiscal-cte 0.1.0"),
    tag("cMunEnv", ide.c_mun_env),
    tag("xMunEnv", ide.x_mun_env),
    tag("UFEnv", ide.uf_env),
    tag("modal", ide.modal),
    tag("tpServ", ide.tp_serv),
    tag("indIEToma", ide.ind_ie_toma),
    tag("dhSaidaOrig", ide.dh_saida_orig),
    tag("dhChegadaDest", ide.dh_chegada_dest),
    buildTomaGtve(ide.toma),
  ];
  return tag("ide", {}, children);
}

function buildTomaGtve(toma: TomaOs): string {
  const children = [tag("toma", "4"), buildDocumento(toma.doc)];
  if (toma.ie) children.push(tag("IE", toma.ie));
  children.push(tag("xNome", toma.x_nome));
  if (toma.x_fant) children.push(tag("xFant", toma.x_fant));
  if (toma.fone) children.push(tag("fone", toma.fone));
  children.push(buildEndereco("enderToma", toma.ender_toma, false));
  if (toma.email) children.push(tag("email", toma.email));
  return tag("tomaTerceiro", {}, children);
}

function buildEmitGtve(emit: Emit): string {
  const children = [buildDocumento(emit.doc)];
  if (emit.ie) children.push(tag("IE", emit.ie));
  if (emit.iest) children.push(tag("IEST", emit.iest));
  children.push(tag("xNome", emit.x_nome));
  if (emit.x_fant) children.push(tag("xFant", emit.x_fant));
  children.push(buildEndereco("enderEmit", emit.ender_emit, true));
  return tag("emit", {}, children);
}

function buildDetGtv(det: DetGtv): string {
  const children = [];
  for (const especie of det.inf_especie) {
    const e = [tag("tpEspecie", especie.tp_especie), tag("vEspecie", especie.v_especie)];
    if (especie.tp_numerario) e.push(tag("tpNumerario", especie.tp_numerario));
    if (especie.x_moeda_estr) e.push(tag("xMoedaEstr", especie.x_moeda_estr));
    children.push(tag("infEspecie", {}, e));
  }
  children.push(tag("qCarga", det.q_carga));
  for (const veiculo of det.inf_veiculo) {
    const v = [tag("placa", veiculo.placa), tag("UF", veiculo.uf)];
    if (veiculo.rntrc) v.push(tag("RNTRC", veiculo.rntrc));
    children.push(tag("infVeiculo", {}, v));
  }
  return tag("detGTV", {}, children);
}
