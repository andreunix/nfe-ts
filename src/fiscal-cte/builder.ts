import { tag } from "../fiscal-core/xml_utils.ts";
import { buildCteAccessKeyFromIde } from "./access_key.ts";
import { CTE_MODEL, CTE_NAMESPACE, CTE_VERSION } from "./constants.ts";
import type {
  AutXml,
  Compl,
  CteBuildData,
  Documento,
  Emit,
  Endereco,
  Icms,
  Imp,
  InfCarga,
  InfCteNorm,
  InfDoc,
  InfModal,
  InfRespTec,
  Modal,
  Party,
  Tomador,
  VPrest,
} from "./types.ts";

export function buildCteXml(data: CteBuildData): string {
  const accessKey = buildCteAccessKeyFromIde(data.ide, data.emit_cnpj, data.numeric_code);
  const cCt = accessKey.numeric_code;
  const cDv = accessKey.key.slice(43, 44);
  const children = [buildIde(data.ide, cCt, cDv)];

  if (data.compl) children.push(buildCompl(data.compl));
  children.push(buildEmit(data.emit));
  if (data.rem) children.push(buildParty("rem", "enderReme", data.rem, true, false));
  if (data.exped) children.push(buildParty("exped", "enderExped", data.exped, false, false));
  if (data.receb) children.push(buildParty("receb", "enderReceb", data.receb, false, false));
  if (data.dest) children.push(buildParty("dest", "enderDest", data.dest, false, true));
  children.push(buildVprest(data.v_prest));
  children.push(buildImp(data.imp));

  const comp = data.inf_cte_comp ?? [];
  if (comp.length === 0) {
    children.push(buildInfCteNorm(data.inf_cte_norm));
  } else {
    for (const ch of comp) children.push(tag("infCteComp", {}, [tag("chCTe", ch)]));
  }

  children.push(...(data.aut_xml ?? []).map(buildAutXml));
  if (data.inf_resp_tec) children.push(buildInfRespTec(data.inf_resp_tec));

  const infCte = tag("infCte", { versao: CTE_VERSION, Id: `CTe${accessKey.key}` }, children);
  return tag("CTe", { xmlns: CTE_NAMESPACE }, [infCte]);
}

export const build_cte_xml = buildCteXml;

export function formatDatetimeCte(value: Date | string, uf: string): string {
  const offset = uf === "AC" ? "-05:00" : ["AM", "RO", "RR", "MT", "MS"].includes(uf) ? "-04:00" : "-03:00";
  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
    if (match?.[1]) return `${match[1]}${offset}`;
  }
  const dt = typeof value === "string" ? new Date(value) : value;
  const yyyy = dt.getFullYear().toString().padStart(4, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");
  const ss = String(dt.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}${offset}`;
}

export const format_datetime_cte = formatDatetimeCte;

export function buildDocumento(doc: Documento): string {
  const record = doc as Record<string, string>;
  if (record.CNPJ !== undefined || record.Cnpj !== undefined) return tag("CNPJ", record.CNPJ ?? record.Cnpj);
  if (record.CPF !== undefined || record.Cpf !== undefined) return tag("CPF", record.CPF ?? record.Cpf);
  if ("type" in doc) return tag(doc.type, doc.value);
  if ("kind" in doc) return tag(doc.kind === "cnpj" ? "CNPJ" : "CPF", doc.value);
  throw new Error("Documento inválido: esperado CNPJ ou CPF");
}

export const build_documento = buildDocumento;

function buildIde(ide: CteBuildData["ide"], cCt: string, cDv: string): string {
  const children = [
    tag("cUF", ide.c_uf),
    tag("cCT", cCt),
    tag("CFOP", ide.cfop),
    tag("natOp", ide.nat_op),
    tag("mod", CTE_MODEL),
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
  ];
  if (ide.ind_globalizado) children.push(tag("indGlobalizado", ide.ind_globalizado));
  children.push(
    tag("cMunEnv", ide.c_mun_env),
    tag("xMunEnv", ide.x_mun_env),
    tag("UFEnv", ide.uf_env),
    tag("modal", ide.modal),
    tag("tpServ", ide.tp_serv),
    tag("cMunIni", ide.c_mun_ini),
    tag("xMunIni", ide.x_mun_ini),
    tag("UFIni", ide.uf_ini),
    tag("cMunFim", ide.c_mun_fim),
    tag("xMunFim", ide.x_mun_fim),
    tag("UFFim", ide.uf_fim),
    tag("retira", ide.retira),
  );
  if (ide.x_det_retira) children.push(tag("xDetRetira", ide.x_det_retira));
  children.push(tag("indIEToma", ide.ind_ie_toma), buildTomador(ide.toma));
  return tag("ide", {}, children);
}

function buildTomador(tomador: Tomador): string {
  const t = "Toma3" in tomador ? { kind: "toma3" as const, ...tomador.Toma3 } : "Toma4" in tomador ? { kind: "toma4" as const, ...tomador.Toma4 } : tomador;
  if (t.kind === "toma3") return tag("toma3", {}, [tag("toma", t.toma)]);
  const children = [tag("toma", t.toma ?? "4"), buildDocumento(t.doc)];
  if (t.ie) children.push(tag("IE", t.ie));
  children.push(tag("xNome", t.x_nome));
  if (t.x_fant) children.push(tag("xFant", t.x_fant));
  if (t.fone) children.push(tag("fone", t.fone));
  children.push(buildEndereco("enderToma", t.ender_toma, false));
  if (t.email) children.push(tag("email", t.email));
  return tag("toma4", {}, children);
}

export function buildCompl(compl: Compl): string {
  const children = [];
  if (compl.x_carac_ad) children.push(tag("xCaracAd", compl.x_carac_ad));
  if (compl.x_carac_ser) children.push(tag("xCaracSer", compl.x_carac_ser));
  if (compl.x_emi) children.push(tag("xEmi", compl.x_emi));
  if (compl.x_obs) children.push(tag("xObs", compl.x_obs));
  for (const obs of compl.obs_cont ?? []) children.push(tag("ObsCont", { xCampo: obs.x_campo }, [tag("xTexto", obs.x_texto)]));
  for (const obs of compl.obs_fisco ?? []) children.push(tag("ObsFisco", { xCampo: obs.x_campo }, [tag("xTexto", obs.x_texto)]));
  return tag("compl", {}, children);
}

export const build_compl = buildCompl;

export function buildEmit(emit: Emit): string {
  const children = [buildDocumento(emit.doc)];
  if (emit.ie) children.push(tag("IE", emit.ie));
  if (emit.iest) children.push(tag("IEST", emit.iest));
  children.push(tag("xNome", emit.x_nome));
  if (emit.x_fant) children.push(tag("xFant", emit.x_fant));
  children.push(buildEndereco("enderEmit", emit.ender_emit, true), tag("CRT", emit.crt));
  return tag("emit", {}, children);
}

export const build_emit = buildEmit;

export function buildParty(tagName: string, enderTag: string, party: Party, includeXfant: boolean, includeIsuf: boolean): string {
  const children = [buildDocumento(party.doc)];
  if (party.ie) children.push(tag("IE", party.ie));
  children.push(tag("xNome", party.x_nome));
  if (includeXfant && party.x_fant) children.push(tag("xFant", party.x_fant));
  if (party.fone) children.push(tag("fone", party.fone));
  if (includeIsuf && party.isuf) children.push(tag("ISUF", party.isuf));
  children.push(buildEndereco(enderTag, party.ender, false));
  if (party.email) children.push(tag("email", party.email));
  return tag(tagName, {}, children);
}

export const build_party = buildParty;

export function buildEndereco(tagName: string, e: Endereco, isEmit: boolean): string {
  const children = [tag("xLgr", e.x_lgr), tag("nro", e.nro)];
  if (e.x_cpl) children.push(tag("xCpl", e.x_cpl));
  children.push(tag("xBairro", e.x_bairro), tag("cMun", e.c_mun), tag("xMun", e.x_mun));
  if (e.cep) children.push(tag("CEP", e.cep));
  children.push(tag("UF", e.uf));
  if (isEmit) {
    if (e.fone) children.push(tag("fone", e.fone));
  } else {
    if (e.c_pais) children.push(tag("cPais", e.c_pais));
    if (e.x_pais) children.push(tag("xPais", e.x_pais));
  }
  return tag(tagName, {}, children);
}

export const build_endereco = buildEndereco;

export function buildVprest(vPrest: VPrest): string {
  const children = [tag("vTPrest", vPrest.v_t_prest), tag("vRec", vPrest.v_rec)];
  for (const comp of vPrest.comp ?? []) {
    children.push(tag("Comp", {}, [tag("xNome", comp.x_nome), tag("vComp", comp.v_comp)]));
  }
  return tag("vPrest", {}, children);
}

export const build_vprest = buildVprest;

export function buildImp(imp: Imp): string {
  const children = [buildIcms(imp.icms)];
  if (imp.v_tot_trib) children.push(tag("vTotTrib", imp.v_tot_trib));
  if (imp.inf_ad_fisco) children.push(tag("infAdFisco", imp.inf_ad_fisco));
  return tag("imp", {}, children);
}

export const build_imp = buildImp;

export function buildIcms(icms: Icms): string {
  const data = icms as Record<string, string | undefined>;
  const kind = "kind" in icms ? icms.kind : `Icms${icms.cst === "SN" ? "Sn" : icms.cst}`;
  let inner: string;
  if (kind === "Icms00") {
    inner = tag("ICMS00", {}, [tag("CST", "00"), tag("vBC", data.v_bc), tag("pICMS", data.p_icms), tag("vICMS", data.v_icms)]);
  } else if (kind === "Icms20") {
    inner = tag("ICMS20", {}, [tag("CST", "20"), tag("pRedBC", data.p_red_bc), tag("vBC", data.v_bc), tag("pICMS", data.p_icms), tag("vICMS", data.v_icms)]);
  } else if (kind === "Icms45") {
    inner = tag("ICMS45", {}, [tag("CST", data.cst_code ?? data.CST ?? "40")]);
  } else if (kind === "Icms90") {
    const children = [tag("CST", "90")];
    if (data.p_red_bc) children.push(tag("pRedBC", data.p_red_bc));
    children.push(tag("vBC", data.v_bc), tag("pICMS", data.p_icms), tag("vICMS", data.v_icms));
    if (data.v_cred) children.push(tag("vCred", data.v_cred));
    inner = tag("ICMS90", {}, children);
  } else {
    inner = tag("ICMSSN", {}, [tag("CST", "90"), tag("indSN", data.ind_sn || "1")]);
  }
  return tag("ICMS", {}, [inner]);
}

export const build_icms = buildIcms;

function buildInfCteNorm(n: InfCteNorm): string {
  const children = [buildInfCarga(n.inf_carga)];
  if (n.inf_doc) children.push(buildInfDoc(n.inf_doc));
  children.push(buildInfModal(n.inf_modal));
  if (n.inf_cte_sub) {
    const sub = [tag("chCte", n.inf_cte_sub.ch_cte)];
    if (n.inf_cte_sub.ind_altera_toma) sub.push(tag("indAlteraToma", n.inf_cte_sub.ind_altera_toma));
    children.push(tag("infCteSub", {}, sub));
  }
  return tag("infCTeNorm", {}, children);
}

function buildInfCarga(carga: InfCarga): string {
  const children = [];
  if (carga.v_carga) children.push(tag("vCarga", carga.v_carga));
  children.push(tag("proPred", carga.pro_pred));
  if (carga.x_out_cat) children.push(tag("xOutCat", carga.x_out_cat));
  for (const q of carga.inf_q) children.push(tag("infQ", {}, [tag("cUnid", q.c_unid), tag("tpMed", q.tp_med), tag("qCarga", q.q_carga)]));
  if (carga.v_carga_averb) children.push(tag("vCargaAverb", carga.v_carga_averb));
  return tag("infCarga", {}, children);
}

function buildInfDoc(doc: InfDoc): string {
  const children = [];
  if ((doc.inf_nfe ?? []).length > 0) {
    for (const nfe of doc.inf_nfe ?? []) {
      const n = [tag("chave", nfe.chave)];
      if (nfe.d_prev) n.push(tag("dPrev", nfe.d_prev));
      children.push(tag("infNFe", {}, n));
    }
  } else {
    for (const other of doc.inf_outros ?? []) {
      const o = [tag("tpDoc", other.tp_doc)];
      if (other.desc_outros) o.push(tag("descOutros", other.desc_outros));
      if (other.n_doc) o.push(tag("nDoc", other.n_doc));
      if (other.d_emi) o.push(tag("dEmi", other.d_emi));
      if (other.v_doc_fisc) o.push(tag("vDocFisc", other.v_doc_fisc));
      children.push(tag("infOutros", {}, o));
    }
  }
  return tag("infDoc", {}, children);
}

function normalizeModal(modal: Modal): { tipo: string; data: Record<string, string | undefined> } {
  if ("tipo" in modal) return { tipo: modal.tipo, data: modal as unknown as Record<string, string | undefined> };
  const key = Object.keys(modal)[0]!;
  return { tipo: key.toLowerCase(), data: (modal as unknown as Record<string, Record<string, string | undefined>>)[key]! };
}

function buildInfModal(infModal: InfModal): string {
  const { tipo, data } = normalizeModal(infModal.modal);
  let modalXml: string;
  if (tipo === "rodo") {
    modalXml = tag("rodo", {}, [tag("RNTRC", data.rntrc)]);
  } else if (tipo === "aereo") {
    const children = [];
    if (data.n_minu) children.push(tag("nMinu", data.n_minu));
    children.push(tag("dPrevAereo", data.d_prev_aereo), tag("natCarga", {}, data.x_dime ? [tag("xDime", data.x_dime)] : []));
    children.push(tag("tarifa", {}, [tag("CL", data.tarifa_cl), tag("vTar", data.tarifa_v_tar)]));
    modalXml = tag("aereo", {}, children);
  } else if (tipo === "aquav") {
    const children = [tag("vPrest", data.v_prest), tag("vAFRMM", data.v_afrmm), tag("xNavio", data.x_navio)];
    if (data.n_viag) children.push(tag("nViag", data.n_viag));
    children.push(tag("direc", data.direc), tag("irin", data.irin));
    modalXml = tag("aquav", {}, children);
  } else if (tipo === "ferrov") {
    modalXml = tag("ferrov", {}, [tag("tpTraf", data.tp_traf), tag("fluxo", data.fluxo)]);
  } else if (tipo === "duto") {
    const children = [];
    if (data.v_tar) children.push(tag("vTar", data.v_tar));
    children.push(tag("dIni", data.d_ini), tag("dFim", data.d_fim));
    modalXml = tag("duto", {}, children);
  } else {
    modalXml = tag("multimodal", {}, [tag("COTM", data.cotm), tag("indNegociavel", data.ind_negociavel)]);
  }
  return tag("infModal", { versaoModal: infModal.versao_modal ?? CTE_VERSION }, [modalXml]);
}

export function buildAutXml(aut: AutXml): string {
  return tag("autXML", {}, [buildDocumento(aut.doc)]);
}

export const build_aut_xml = buildAutXml;

export function buildInfRespTec(rt: InfRespTec): string {
  return tag("infRespTec", {}, [tag("CNPJ", rt.cnpj), tag("xContato", rt.x_contato), tag("email", rt.email), tag("fone", rt.fone)]);
}

export const build_inf_resp_tec = buildInfRespTec;
