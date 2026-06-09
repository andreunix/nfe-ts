import { generateNumericCode, formatYearMonth } from "../fiscal-core/xml_builder/access_key.ts";
import { tag } from "../fiscal-core/xml_utils.ts";
import { buildCteAccessKey } from "./access_key.ts";
import { CTE_NAMESPACE, CTE_VERSION, CTEOS_MODEL } from "./constants.ts";
import {
  buildAutXml,
  buildCompl,
  buildDocumento,
  buildEmit,
  buildEndereco,
  buildImp,
  buildInfRespTec,
  buildVprest,
  formatDatetimeCte,
} from "./builder.ts";
import type { CteOsBuildData, IdeOs, InfCteNormOs, InfDocRef, InfModalOs, InfServico, RodoOs, Seg, TomaOs } from "./types_os.ts";

export function buildCteosXml(data: CteOsBuildData): string {
  const numericCode = data.numeric_code ?? generateNumericCode();
  const accessKey = buildCteAccessKey({
    model: CTEOS_MODEL,
    state_code: data.ide.c_uf,
    year_month: formatYearMonth(data.ide.dh_emi),
    tax_id: data.emit_cnpj,
    series: data.ide.serie,
    number: data.ide.n_ct,
    emission_type: data.ide.tp_emis,
    numeric_code: numericCode,
  });
  const children = [buildIdeOs(data.ide, accessKey.numeric_code, accessKey.key.slice(43, 44))];
  if (data.compl) children.push(buildCompl(data.compl));
  children.push(buildEmit(data.emit), buildToma(data.toma), buildVprest(data.v_prest), buildImp(data.imp), buildInfCteNormOs(data.inf_cte_norm));
  children.push(...(data.aut_xml ?? []).map(buildAutXml));
  if (data.inf_resp_tec) children.push(buildInfRespTec(data.inf_resp_tec));

  const infCte = tag("infCte", { versao: CTE_VERSION, Id: `CTe${accessKey.key}` }, children);
  return tag("CTeOS", { xmlns: CTE_NAMESPACE, versao: CTE_VERSION }, [infCte]);
}

export const build_cteos_xml = buildCteosXml;

function buildIdeOs(ide: IdeOs, cCt: string, cDv: string): string {
  const children = [
    tag("cUF", ide.c_uf),
    tag("cCT", cCt),
    tag("CFOP", ide.cfop),
    tag("natOp", ide.nat_op),
    tag("mod", CTEOS_MODEL),
    tag("serie", String(ide.serie)),
    tag("nCT", String(ide.n_ct)),
    tag("dhEmi", formatDatetimeCte(ide.dh_emi, ide.uf_env)),
    tag("tpImp", ide.tp_imp),
    tag("tpEmis", ide.tp_emis),
    tag("cDV", cDv),
    tag("tpAmb", ide.tp_amb),
    tag("tpCTe", ide.tp_cte),
    tag("procEmi", ide.proc_emi ?? "0"),
    tag("verProc", ide.ver_proc ?? "fiscal-cte 0.1.0"),
    tag("cMunEnv", ide.c_mun_env),
    tag("xMunEnv", ide.x_mun_env),
    tag("UFEnv", ide.uf_env),
    tag("modal", ide.modal),
    tag("tpServ", ide.tp_serv),
    tag("indIEToma", ide.ind_ie_toma),
    tag("cMunIni", ide.c_mun_ini),
    tag("xMunIni", ide.x_mun_ini),
    tag("UFIni", ide.uf_ini),
    tag("cMunFim", ide.c_mun_fim),
    tag("xMunFim", ide.x_mun_fim),
    tag("UFFim", ide.uf_fim),
  ];
  for (const uf of ide.inf_percurso ?? []) children.push(tag("infPercurso", {}, [tag("UFPer", uf)]));
  if (ide.dh_cont) children.push(tag("dhCont", ide.dh_cont));
  if (ide.x_just) children.push(tag("xJust", ide.x_just));
  return tag("ide", {}, children);
}

export function buildToma(toma: TomaOs): string {
  const children = [buildDocumento(toma.doc)];
  if (toma.ie) children.push(tag("IE", toma.ie));
  children.push(tag("xNome", toma.x_nome));
  if (toma.x_fant) children.push(tag("xFant", toma.x_fant));
  if (toma.fone) children.push(tag("fone", toma.fone));
  children.push(buildEndereco("enderToma", toma.ender_toma, false));
  if (toma.email) children.push(tag("email", toma.email));
  return tag("toma", {}, children);
}

export const build_toma = buildToma;

function buildInfCteNormOs(norm: InfCteNormOs): string {
  const children = [buildInfServico(norm.inf_servico)];
  for (const doc of norm.inf_doc_ref ?? []) children.push(buildInfDocRef(doc));
  for (const seg of norm.seg ?? []) children.push(buildSeg(seg));
  children.push(buildInfModalOs(norm.inf_modal));
  return tag("infCTeNorm", {}, children);
}

function buildInfServico(servico: InfServico): string {
  const children = [tag("xDescServ", servico.x_desc_serv)];
  if (servico.q_carga) children.push(tag("infQ", {}, [tag("qCarga", servico.q_carga)]));
  return tag("infServico", {}, children);
}

function buildInfDocRef(doc: InfDocRef): string {
  const children = [];
  if (doc.ch_bpe) {
    children.push(tag("chBPe", doc.ch_bpe));
  } else {
    if (doc.n_doc) children.push(tag("nDoc", doc.n_doc));
    if (doc.serie) children.push(tag("serie", doc.serie));
    if (doc.subserie) children.push(tag("subserie", doc.subserie));
    if (doc.d_emi) children.push(tag("dEmi", doc.d_emi));
    if (doc.v_doc) children.push(tag("vDoc", doc.v_doc));
  }
  return tag("infDocRef", {}, children);
}

function buildSeg(seg: Seg): string {
  const children = [tag("respSeg", seg.resp_seg)];
  if (seg.x_seg) children.push(tag("xSeg", seg.x_seg));
  if (seg.n_apol) children.push(tag("nApol", seg.n_apol));
  return tag("seg", {}, children);
}

function buildInfModalOs(modal: InfModalOs): string {
  return tag("infModal", { versaoModal: modal.versao_modal }, [buildRodoOs(modal.rodo_os)]);
}

function buildRodoOs(rodo: RodoOs): string {
  const children = [];
  if (rodo.taf) children.push(tag("TAF", rodo.taf));
  if (rodo.nro_reg_estadual) children.push(tag("NroRegEstadual", rodo.nro_reg_estadual));
  if (rodo.veic) {
    const veic = [tag("placa", rodo.veic.placa)];
    if (rodo.veic.renavam) veic.push(tag("RENAVAM", rodo.veic.renavam));
    if (rodo.veic.prop) {
      const prop = [buildDocumento(rodo.veic.prop.doc)];
      if (rodo.veic.prop.x_nome) prop.push(tag("xNome", rodo.veic.prop.x_nome));
      if (rodo.veic.prop.ie) prop.push(tag("IE", rodo.veic.prop.ie));
      if (rodo.veic.prop.uf) prop.push(tag("UF", rodo.veic.prop.uf));
      prop.push(tag("tpProp", rodo.veic.prop.tp_prop));
      veic.push(tag("prop", {}, prop));
    }
    if (rodo.veic.uf) veic.push(tag("UF", rodo.veic.uf));
    children.push(tag("veic", {}, veic));
  }
  if (rodo.inf_fretamento) {
    const fret = [tag("tpFretamento", rodo.inf_fretamento.tp_fretamento)];
    if (rodo.inf_fretamento.dh_viagem) fret.push(tag("dhViagem", rodo.inf_fretamento.dh_viagem));
    children.push(tag("infFretamento", {}, fret));
  }
  return tag("rodoOS", {}, children);
}
