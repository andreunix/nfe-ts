import { tag } from "../fiscal-core/xml_utils.ts";
import { NFSE_NAMESPACE, NFSE_VERSION } from "./constants.ts";
import type { Documento } from "./types.ts";
import type { DpsBuildData, EnderNac, Ibscbs, IdeDps, Pessoa, Prestador, Servico, TribFed, Valores } from "./types_nfse.ts";

export function buildDpsXml(data: DpsBuildData): string {
  const id = buildDpsId(data.ide, data.prest.doc);
  const children = [
    tag("tpAmb", data.ide.tp_amb),
    tag("dhEmi", formatDateTimeWithOffset(data.ide.dh_emi)),
    tag("verAplic", data.ide.ver_aplic ?? "dfehub-1.0"),
    tag("serie", data.ide.serie),
    tag("nDPS", String(data.ide.n_dps)),
    tag("dCompet", data.ide.d_compet),
    tag("tpEmit", data.ide.tp_emit),
    tag("cLocEmi", data.ide.c_loc_emi),
    buildPrest(data.prest),
  ];
  if (data.toma) children.push(buildPessoa("toma", data.toma));
  children.push(buildServ(data.serv), buildValores(data.valores));
  if (data.ibscbs) children.push(buildIbscbs(data.ibscbs));
  return tag("DPS", { xmlns: NFSE_NAMESPACE, versao: NFSE_VERSION }, [tag("infDPS", { Id: id }, children)]);
}

export const build_dps_xml = buildDpsXml;

export function buildNfseCancelamento(chNfse: string, taxId: string, cMotivo: string, xDesc: string, tpAmb: string, dhEvento: string): string {
  const digits = taxId.replace(/\D/g, "");
  const autor = digits.length === 11 ? tag("CPFAutor", digits) : tag("CNPJAutor", digits);
  const evento = tag("e101101", {}, [tag("xDesc", "Cancelamento de NFS-e"), tag("cMotivo", cMotivo), tag("xMotivo", xDesc)]);
  const inf = tag("infPedReg", { Id: `PRE${chNfse}101101` }, [
    tag("tpAmb", tpAmb),
    tag("verAplic", "dfehub-1.0"),
    tag("dhEvento", dhEvento),
    autor,
    tag("chNFSe", chNfse),
    evento,
  ]);
  return tag("pedRegEvento", { xmlns: NFSE_NAMESPACE, versao: NFSE_VERSION }, [inf]);
}

export const build_nfse_cancelamento = buildNfseCancelamento;

function buildDpsId(ide: IdeDps, doc: Documento): string {
  const record = doc as Record<string, string>;
  const isCpf = record.CPF !== undefined || record.Cpf !== undefined || ("kind" in doc && doc.kind === "cpf") || ("type" in doc && doc.type === "CPF");
  const value = (record.CNPJ ?? record.Cnpj ?? record.CPF ?? record.Cpf ?? ("value" in doc ? doc.value : "")).replace(/\D/g, "");
  return `DPS${ide.c_loc_emi.padStart(7, "0")}${isCpf ? "1" : "2"}${value.padStart(14, "0")}${ide.serie.padStart(5, "0")}${String(ide.n_dps).padStart(15, "0")}`;
}

function buildDoc(doc: Documento): string {
  const record = doc as Record<string, string>;
  const value = record.CNPJ ?? record.Cnpj ?? record.CPF ?? record.Cpf ?? ("value" in doc ? doc.value : "");
  const isCpf = record.CPF !== undefined || record.Cpf !== undefined || ("kind" in doc && doc.kind === "cpf") || ("type" in doc && doc.type === "CPF");
  return tag(isCpf ? "CPF" : "CNPJ", value);
}

function formatDateTimeWithOffset(value: Date | string): string {
  if (typeof value === "string") return value.replace(/([+-]\d{2}):?(\d{2})$/, "$1:$2");
  const yyyy = value.getFullYear().toString().padStart(4, "0");
  const mm = String(value.getMonth() + 1).padStart(2, "0");
  const dd = String(value.getDate()).padStart(2, "0");
  const hh = String(value.getHours()).padStart(2, "0");
  const mi = String(value.getMinutes()).padStart(2, "0");
  const ss = String(value.getSeconds()).padStart(2, "0");
  const off = -value.getTimezoneOffset();
  const sign = off >= 0 ? "+" : "-";
  const abs = Math.abs(off);
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}${sign}${String(Math.floor(abs / 60)).padStart(2, "0")}:${String(abs % 60).padStart(2, "0")}`;
}

function buildEnder(end: EnderNac): string {
  const children = [tag("endNac", {}, [tag("cMun", end.c_mun), tag("CEP", end.cep)]), tag("xLgr", end.x_lgr), tag("nro", end.nro)];
  if (end.x_cpl) children.push(tag("xCpl", end.x_cpl));
  children.push(tag("xBairro", end.x_bairro));
  return tag("end", {}, children);
}

function buildPrest(prest: Prestador): string {
  const children = [buildDoc(prest.doc)];
  if (prest.im) children.push(tag("IM", prest.im));
  children.push(tag("xNome", prest.x_nome));
  if (prest.end) children.push(buildEnder(prest.end));
  if (prest.fone) children.push(tag("fone", prest.fone));
  if (prest.email) children.push(tag("email", prest.email));
  children.push(tag("regTrib", {}, [tag("opSimpNac", prest.reg_trib.op_simp_nac), tag("regEspTrib", prest.reg_trib.reg_esp_trib)]));
  return tag("prest", {}, children);
}

function buildPessoa(tagName: string, pessoa: Pessoa): string {
  const children = [buildDoc(pessoa.doc)];
  if (pessoa.im) children.push(tag("IM", pessoa.im));
  children.push(tag("xNome", pessoa.x_nome));
  if (pessoa.end) children.push(buildEnder(pessoa.end));
  if (pessoa.fone) children.push(tag("fone", pessoa.fone));
  if (pessoa.email) children.push(tag("email", pessoa.email));
  return tag(tagName, {}, children);
}

function buildServ(serv: Servico): string {
  const cServ = [tag("cTribNac", serv.c_trib_nac)];
  if (serv.c_trib_mun) cServ.push(tag("cTribMun", serv.c_trib_mun));
  cServ.push(tag("xDescServ", serv.x_desc_serv));
  return tag("serv", {}, [tag("locPrest", {}, [tag("cLocPrestacao", serv.c_loc_prestacao)]), tag("cServ", {}, cServ)]);
}

function buildValores(valores: Valores): string {
  const tribMun = [tag("tribISSQN", valores.trib.trib_mun.trib_issqn), tag("tpRetISSQN", valores.trib.trib_mun.tp_ret_issqn)];
  if (valores.trib.trib_mun.p_aliq) tribMun.push(tag("pAliq", valores.trib.trib_mun.p_aliq));
  const tribChildren = [tag("tribMun", {}, tribMun)];
  if (valores.trib.trib_fed) tribChildren.push(buildTribFed(valores.trib.trib_fed));
  tribChildren.push(tag("totTrib", {}, [tag("indTotTrib", "0")]));
  return tag("valores", {}, [tag("vServPrest", {}, [tag("vServ", valores.v_serv)]), tag("trib", {}, tribChildren)]);
}

function buildTribFed(tribFed: TribFed): string {
  const children = [];
  if (tribFed.piscofins) {
    const pc = [tag("CST", tribFed.piscofins.cst)];
    if (tribFed.piscofins.v_bc) pc.push(tag("vBCPisCofins", tribFed.piscofins.v_bc));
    if (tribFed.piscofins.p_aliq_pis) pc.push(tag("pAliqPis", tribFed.piscofins.p_aliq_pis));
    if (tribFed.piscofins.p_aliq_cofins) pc.push(tag("pAliqCofins", tribFed.piscofins.p_aliq_cofins));
    if (tribFed.piscofins.v_pis) pc.push(tag("vPis", tribFed.piscofins.v_pis));
    if (tribFed.piscofins.v_cofins) pc.push(tag("vCofins", tribFed.piscofins.v_cofins));
    if (tribFed.piscofins.tp_ret) pc.push(tag("tpRetPisCofins", tribFed.piscofins.tp_ret));
    children.push(tag("piscofins", {}, pc));
  }
  if (tribFed.v_ret_cp) children.push(tag("vRetCP", tribFed.v_ret_cp));
  if (tribFed.v_ret_irrf) children.push(tag("vRetIRRF", tribFed.v_ret_irrf));
  if (tribFed.v_ret_csll) children.push(tag("vRetCSLL", tribFed.v_ret_csll));
  return tag("tribFed", {}, children);
}

function buildIbscbs(ib: Ibscbs): string {
  const children = [tag("finNFSe", ib.fin_nfse)];
  if (ib.ind_final) children.push(tag("indFinal", ib.ind_final));
  children.push(tag("cIndOp", ib.c_ind_op), tag("indDest", ib.ind_dest));
  const sit = [tag("CST", ib.cst), tag("cClassTrib", ib.c_class_trib)];
  if (ib.c_cred_pres) sit.push(tag("cCredPres", ib.c_cred_pres));
  children.push(tag("valores", {}, [tag("trib", {}, [tag("gIBSCBS", {}, sit)])]));
  return tag("IBSCBS", {}, children);
}
