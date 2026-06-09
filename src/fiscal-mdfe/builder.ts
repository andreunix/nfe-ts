import { tag } from "../fiscal-core/xml_utils.ts";
import { buildMdfeAccessKeyFromIde } from "./access_key.ts";
import { MDFE_MODEL, MDFE_NAMESPACE, MDFE_VERSION } from "./constants.ts";
import type {
  Aereo,
  Aquav,
  Emit,
  EnderEmit,
  Ferrov,
  Ide,
  InfAdic,
  InfAntt,
  InfDoc,
  MdfeBuildData,
  Modal,
  Prop,
  Rodo,
  Tot,
  VeicReboque,
  VeicTracao,
} from "./types.ts";

export function buildMdfeXml(data: MdfeBuildData): string {
  const accessKey = buildMdfeAccessKeyFromIde(data.ide, data.emit.cnpj, data.numeric_code);
  const children = [
    buildIde(data.ide, accessKey.numeric_code, accessKey.key.slice(43, 44)),
    buildEmit(data.emit),
    buildInfModal(data.modal),
    buildInfDoc(data.inf_doc),
    buildTot(data.tot),
  ];
  if (data.inf_adic) children.push(buildInfAdic(data.inf_adic));

  const infMdfe = tag("infMDFe", { versao: MDFE_VERSION, Id: `MDFe${accessKey.key}` }, children);
  return tag("MDFe", { xmlns: MDFE_NAMESPACE }, [infMdfe]);
}

export const build_mdfe_xml = buildMdfeXml;

export function formatDatetimeMdfe(value: Date | string, uf: string): string {
  const offset = uf === "AC" ? "-05:00" : ["AM", "RO", "RR", "MT", "MS"].includes(uf) ? "-04:00" : "-03:00";
  if (typeof value === "string") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
    if (match?.[1]) return `${match[1]}${offset}`;
  }
  const dt = typeof value === "string" ? new Date(value) : value;
  const yyyy = String(dt.getFullYear()).padStart(4, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  const hh = String(dt.getHours()).padStart(2, "0");
  const mi = String(dt.getMinutes()).padStart(2, "0");
  const ss = String(dt.getSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}${offset}`;
}

export const format_datetime_mdfe = formatDatetimeMdfe;

function taxIdTag(taxId: string): "CNPJ" | "CPF" {
  return taxId.replace(/\D/g, "").length === 14 ? "CNPJ" : "CPF";
}

function buildIde(ide: Ide, cMdf: string, cDv: string): string {
  const children = [
    tag("cUF", ide.c_uf),
    tag("tpAmb", ide.tp_amb),
    tag("tpEmit", ide.tp_emit),
    tag("mod", MDFE_MODEL),
    tag("serie", String(ide.serie)),
    tag("nMDF", String(ide.n_mdf)),
    tag("cMDF", cMdf),
    tag("cDV", cDv),
    tag("modal", ide.modal),
    tag("dhEmi", formatDatetimeMdfe(ide.dh_emi, ide.uf_ini)),
    tag("tpEmis", ide.tp_emis),
    tag("procEmi", ide.proc_emi ?? "0"),
    tag("verProc", ide.ver_proc ?? "fiscal-mdfe 0.1.0"),
    tag("UFIni", ide.uf_ini),
    tag("UFFim", ide.uf_fim),
  ];

  for (const mun of ide.inf_mun_carrega) {
    children.push(tag("infMunCarrega", {}, [tag("cMunCarrega", mun.c_mun), tag("xMunCarrega", mun.x_mun)]));
  }
  for (const uf of ide.inf_percurso ?? []) {
    children.push(tag("infPercurso", {}, [tag("UFPer", uf)]));
  }
  if (ide.dh_ini_viagem) children.push(tag("dhIniViagem", formatDatetimeMdfe(ide.dh_ini_viagem, ide.uf_ini)));

  return tag("ide", {}, children);
}

function buildEmit(emit: Emit): string {
  const children = [tag("CNPJ", emit.cnpj)];
  if (emit.ie) children.push(tag("IE", emit.ie));
  children.push(tag("xNome", emit.x_nome));
  if (emit.x_fant) children.push(tag("xFant", emit.x_fant));
  children.push(buildEnderEmit(emit.ender_emit));
  return tag("emit", {}, children);
}

function buildEnderEmit(e: EnderEmit): string {
  const children = [tag("xLgr", e.x_lgr), tag("nro", e.nro)];
  if (e.x_cpl) children.push(tag("xCpl", e.x_cpl));
  children.push(tag("xBairro", e.x_bairro), tag("cMun", e.c_mun), tag("xMun", e.x_mun), tag("CEP", e.cep), tag("UF", e.uf));
  if (e.fone) children.push(tag("fone", e.fone));
  if (e.email) children.push(tag("email", e.email));
  return tag("enderEmit", {}, children);
}

function normalizeModal(modal: Modal): { type: string; data: Rodo | Aereo | Aquav | Ferrov } {
  if ("type" in modal) {
    const { type, ...rest } = modal;
    return { type, data: rest as Rodo | Aereo | Aquav | Ferrov };
  }
  if ("Rodo" in modal) return { type: "rodo", data: modal.Rodo };
  if ("Aereo" in modal) return { type: "aereo", data: modal.Aereo };
  if ("Aquav" in modal) return { type: "aquav", data: modal.Aquav };
  return { type: "ferrov", data: modal.Ferrov };
}

function buildInfModal(modal: Modal): string {
  const normalized = normalizeModal(modal);
  const modalXml =
    normalized.type === "rodo" ? buildRodo(normalized.data as Rodo)
    : normalized.type === "aereo" ? buildAereo(normalized.data as Aereo)
    : normalized.type === "aquav" ? buildAquav(normalized.data as Aquav)
    : buildFerrov(normalized.data as Ferrov);

  return tag("infModal", { versaoModal: MDFE_VERSION }, [modalXml]);
}

function buildAereo(aereo: Aereo): string {
  return tag("aereo", {}, [
    tag("nac", aereo.nac),
    tag("matr", aereo.matr),
    tag("nVoo", aereo.n_voo),
    tag("cAerEmb", aereo.c_aer_emb),
    tag("cAerDes", aereo.c_aer_des),
    tag("dVoo", aereo.d_voo),
  ]);
}

function buildAquav(aquav: Aquav): string {
  const children = [
    tag("irin", aquav.irin),
    tag("tpEmb", aquav.tp_emb),
    tag("cEmbar", aquav.c_embar),
    tag("xEmbar", aquav.x_embar),
    tag("nViag", aquav.n_viag),
    tag("cPrtEmb", aquav.c_prt_emb),
    tag("cPrtDest", aquav.c_prt_dest),
  ];
  if (aquav.prt_trans) children.push(tag("prtTrans", aquav.prt_trans));
  if (aquav.tp_nav) children.push(tag("tpNav", aquav.tp_nav));
  for (const term of aquav.inf_term_carreg ?? []) {
    children.push(tag("infTermCarreg", {}, [tag("cTermCarreg", term.c_term_carreg), tag("xTermCarreg", term.x_term_carreg)]));
  }
  for (const term of aquav.inf_term_descarreg ?? []) {
    children.push(tag("infTermDescarreg", {}, [tag("cTermDescarreg", term.c_term_descarreg), tag("xTermDescarreg", term.x_term_descarreg)]));
  }
  for (const emb of aquav.inf_emb_comb ?? []) {
    children.push(tag("infEmbComb", {}, [tag("cEmbComb", emb.c_emb_comb), tag("xBalsa", emb.x_balsa)]));
  }
  for (const unid of aquav.inf_unid_carga_vazia ?? []) {
    children.push(tag("infUnidCargaVazia", {}, [tag("idUnidCargaVazia", unid.id_unid_carga_vazia), tag("tpUnidCargaVazia", unid.tp_unid_carga_vazia)]));
  }
  for (const unid of aquav.inf_unid_transp_vazia ?? []) {
    children.push(tag("infUnidTranspVazia", {}, [tag("idUnidTranspVazia", unid.id_unid_transp_vazia), tag("tpUnidTranspVazia", unid.tp_unid_transp_vazia)]));
  }
  if (aquav.mmsi) children.push(tag("MMSI", aquav.mmsi));
  return tag("aquav", {}, children);
}

function buildFerrov(ferrov: Ferrov): string {
  const trem = [tag("xPref", ferrov.trem.x_pref)];
  if (ferrov.trem.dh_trem) trem.push(tag("dhTrem", ferrov.trem.dh_trem));
  trem.push(tag("xOri", ferrov.trem.x_ori), tag("xDest", ferrov.trem.x_dest), tag("qVag", ferrov.trem.q_vag));
  const children = [tag("trem", {}, trem)];

  for (const vag of ferrov.vag) {
    const v = [tag("pesoBC", vag.peso_bc), tag("pesoR", vag.peso_r)];
    if (vag.tp_vag) v.push(tag("tpVag", vag.tp_vag));
    v.push(tag("serie", vag.serie), tag("nVag", vag.n_vag));
    if (vag.n_seq) v.push(tag("nSeq", vag.n_seq));
    v.push(tag("TU", vag.tu));
    children.push(tag("vag", {}, v));
  }
  return tag("ferrov", {}, children);
}

function buildRodo(rodo: Rodo): string {
  const children = [];
  if (rodo.inf_antt) children.push(buildInfAntt(rodo.inf_antt));
  children.push(buildVeicTracao(rodo.veic_tracao));
  for (const reboque of rodo.veic_reboque ?? []) children.push(buildVeicReboque(reboque));
  return tag("rodo", {}, children);
}

function buildInfAntt(antt: InfAntt): string {
  const children = [];
  if (antt.rntrc) children.push(tag("RNTRC", antt.rntrc));
  for (const ciot of antt.inf_ciot ?? []) {
    children.push(tag("infCIOT", {}, [tag("CIOT", ciot.ciot), tag(taxIdTag(ciot.tax_id), ciot.tax_id)]));
  }
  return tag("infANTT", {}, children);
}

function buildProp(prop: Prop): string {
  const children = [tag(taxIdTag(prop.tax_id), prop.tax_id)];
  if (prop.rntrc) children.push(tag("RNTRC", prop.rntrc));
  children.push(tag("xNome", prop.x_nome));
  if (prop.ie) children.push(tag("IE", prop.ie));
  children.push(tag("UF", prop.uf), tag("tpProp", prop.tp_prop));
  return tag("prop", {}, children);
}

function buildVeicTracao(veic: VeicTracao): string {
  const children = [];
  if (veic.c_int) children.push(tag("cInt", veic.c_int));
  children.push(tag("placa", veic.placa));
  if (veic.renavam) children.push(tag("RENAVAM", veic.renavam));
  children.push(tag("tara", String(veic.tara)));
  if (veic.cap_kg !== undefined) children.push(tag("capKG", String(veic.cap_kg)));
  if (veic.cap_m3 !== undefined) children.push(tag("capM3", String(veic.cap_m3)));
  if (veic.prop) children.push(buildProp(veic.prop));
  for (const condutor of veic.condutor ?? []) {
    children.push(tag("condutor", {}, [tag("xNome", condutor.x_nome), tag("CPF", condutor.cpf)]));
  }
  children.push(tag("tpRod", veic.tp_rod), tag("tpCar", veic.tp_car));
  if (veic.uf) children.push(tag("UF", veic.uf));
  return tag("veicTracao", {}, children);
}

function buildVeicReboque(veic: VeicReboque): string {
  const children = [];
  if (veic.c_int) children.push(tag("cInt", veic.c_int));
  children.push(tag("placa", veic.placa));
  if (veic.renavam) children.push(tag("RENAVAM", veic.renavam));
  children.push(tag("tara", String(veic.tara)));
  if (veic.cap_kg !== undefined) children.push(tag("capKG", String(veic.cap_kg)));
  if (veic.cap_m3 !== undefined) children.push(tag("capM3", String(veic.cap_m3)));
  children.push(tag("tpCar", veic.tp_car));
  if (veic.prop) children.push(buildProp(veic.prop));
  if (veic.uf) children.push(tag("UF", veic.uf));
  return tag("veicReboque", {}, children);
}

function buildInfDoc(doc: InfDoc): string {
  const children = doc.inf_mun_descarga.map((mun) => {
    const kids = [tag("cMunDescarga", mun.c_mun), tag("xMunDescarga", mun.x_mun)];
    for (const ch of mun.inf_nfe ?? []) kids.push(tag("infNFe", {}, [tag("chNFe", ch)]));
    for (const ch of mun.inf_cte ?? []) kids.push(tag("infCTe", {}, [tag("chCTe", ch)]));
    for (const ch of mun.inf_mdfe ?? []) kids.push(tag("infMDFeTransp", {}, [tag("chMDFe", ch)]));
    return tag("infMunDescarga", {}, kids);
  });
  return tag("infDoc", {}, children);
}

function buildTot(tot: Tot): string {
  const children = [];
  if (tot.q_cte !== undefined) children.push(tag("qCTe", String(tot.q_cte)));
  if (tot.q_nfe !== undefined) children.push(tag("qNFe", String(tot.q_nfe)));
  if (tot.q_mdfe !== undefined) children.push(tag("qMDFe", String(tot.q_mdfe)));
  children.push(tag("vCarga", tot.v_carga.toFixed(2)), tag("cUnid", tot.c_unid), tag("qCarga", tot.q_carga.toFixed(4)));
  return tag("tot", {}, children);
}

function buildInfAdic(adic: InfAdic): string {
  const children = [];
  if (adic.inf_ad_fisco) children.push(tag("infAdFisco", adic.inf_ad_fisco));
  if (adic.inf_cpl) children.push(tag("infCpl", adic.inf_cpl));
  return tag("infAdic", {}, children);
}
