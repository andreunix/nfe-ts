import { formatYearMonth, generateNumericCode } from "../fiscal-core/xml_builder/access_key.ts";
import { tag } from "../fiscal-core/xml_utils.ts";
import { buildCteAccessKey } from "./access_key.ts";
import { BPE_MODEL, BPE_NAMESPACE, BPE_VERSION } from "./constants.ts";
import { buildAutXml, buildDocumento, buildEndereco, buildIcms, buildInfRespTec, formatDatetimeCte } from "./builder.ts";
import type { BpeBuildData, BpeEmit, BpeImp, Comprador, IdeBpe, InfPassagem, InfValorBpe, InfViagem, Pagamento } from "./types_bpe.ts";

export function buildBpeXml(data: BpeBuildData): string {
  const numericCode = data.numeric_code ?? generateNumericCode();
  const accessKey = buildCteAccessKey({
    model: BPE_MODEL,
    state_code: data.ide.c_uf,
    year_month: formatYearMonth(data.ide.dh_emi),
    tax_id: data.emit_cnpj,
    series: data.ide.serie,
    number: data.ide.n_bp,
    emission_type: data.ide.tp_emis,
    numeric_code: numericCode,
  });
  const children = [buildIdeBpe(data.ide, accessKey.numeric_code, accessKey.key.slice(43, 44)), buildEmitBpe(data.emit)];
  if (data.comp) children.push(buildComp(data.comp));
  children.push(buildInfPassagem(data.inf_passagem));
  for (const viagem of data.inf_viagem) children.push(buildInfViagem(viagem));
  children.push(buildInfValor(data.inf_valor), buildBpeImp(data.imp));
  for (const pag of data.pag) children.push(buildPag(pag));
  children.push(...(data.aut_xml ?? []).map(buildAutXml));
  if (data.inf_resp_tec) children.push(buildInfRespTec(data.inf_resp_tec));

  const infBpe = tag("infBPe", { versao: BPE_VERSION, Id: `BPe${accessKey.key}` }, children);
  return tag("BPe", { xmlns: BPE_NAMESPACE }, [infBpe]);
}

export const build_bpe_xml = buildBpeXml;

function buildIdeBpe(ide: IdeBpe, cBp: string, cDv: string): string {
  const children = [
    tag("cUF", ide.c_uf),
    tag("tpAmb", ide.tp_amb),
    tag("mod", BPE_MODEL),
    tag("serie", String(ide.serie)),
    tag("nBP", String(ide.n_bp)),
    tag("cBP", cBp),
    tag("cDV", cDv),
    tag("modal", ide.modal),
    tag("dhEmi", formatDatetimeCte(ide.dh_emi, ide.uf_ini)),
    tag("tpEmis", ide.tp_emis),
    tag("verProc", ide.ver_proc ?? "fiscal-bpe 0.1.0"),
    tag("tpBPe", ide.tp_bpe),
    tag("indPres", ide.ind_pres),
    tag("UFIni", ide.uf_ini),
    tag("cMunIni", ide.c_mun_ini),
    tag("UFFim", ide.uf_fim),
    tag("cMunFim", ide.c_mun_fim),
  ];
  if (ide.dh_cont) children.push(tag("dhCont", ide.dh_cont));
  if (ide.x_just) children.push(tag("xJust", ide.x_just));
  return tag("ide", {}, children);
}

function buildEmitBpe(emit: BpeEmit): string {
  const children = [tag("CNPJ", emit.cnpj), tag("IE", emit.ie)];
  if (emit.iest) children.push(tag("IEST", emit.iest));
  children.push(tag("xNome", emit.x_nome));
  if (emit.x_fant) children.push(tag("xFant", emit.x_fant));
  if (emit.im) children.push(tag("IM", emit.im));
  children.push(tag("CRT", emit.crt), buildEndereco("enderEmit", emit.ender_emit, true));
  if (emit.tar) children.push(tag("TAR", emit.tar));
  return tag("emit", {}, children);
}

function buildComp(comp: Comprador): string {
  const children = [tag("xNome", comp.x_nome), buildDocumento(comp.doc)];
  if (comp.ie) children.push(tag("IE", comp.ie));
  if (comp.ender_comp) children.push(buildEndereco("enderComp", comp.ender_comp, false));
  return tag("comp", {}, children);
}

function buildInfValor(valor: InfValorBpe): string {
  const children = [tag("vBP", valor.v_bp), tag("vDesconto", valor.v_desconto), tag("vPgto", valor.v_pgto), tag("vTroco", valor.v_troco)];
  for (const comp of valor.comp) children.push(tag("Comp", {}, [tag("tpComp", comp.tp_comp), tag("vComp", comp.v_comp)]));
  return tag("infValorBPe", {}, children);
}

function buildInfViagem(viagem: InfViagem): string {
  const children = [
    tag("cPercurso", viagem.c_percurso),
    tag("xPercurso", viagem.x_percurso),
    tag("tpViagem", viagem.tp_viagem),
    tag("tpServ", viagem.tp_serv),
    tag("tpAcomodacao", viagem.tp_acomodacao),
  ];
  if (viagem.tp_trecho) children.push(tag("tpTrecho", viagem.tp_trecho));
  children.push(tag("dhViagem", viagem.dh_viagem));
  if (viagem.prefixo) children.push(tag("prefixo", viagem.prefixo));
  if (viagem.poltrona) children.push(tag("poltrona", viagem.poltrona));
  if (viagem.plataforma) children.push(tag("plataforma", viagem.plataforma));
  return tag("infViagem", {}, children);
}

function buildInfPassagem(passagem: InfPassagem): string {
  const children = [
    tag("cLocOrig", passagem.c_loc_orig),
    tag("xLocOrig", passagem.x_loc_orig),
    tag("cLocDest", passagem.c_loc_dest),
    tag("xLocDest", passagem.x_loc_dest),
    tag("dhEmb", passagem.dh_emb),
    tag("dhValidade", passagem.dh_validade),
  ];
  if (passagem.passageiro) {
    const p = [tag("xNome", passagem.passageiro.x_nome)];
    if (passagem.passageiro.cpf) p.push(tag("CPF", passagem.passageiro.cpf));
    if (passagem.passageiro.tp_doc) p.push(tag("tpDoc", passagem.passageiro.tp_doc));
    if (passagem.passageiro.n_doc) p.push(tag("nDoc", passagem.passageiro.n_doc));
    if (passagem.passageiro.fone) p.push(tag("fone", passagem.passageiro.fone));
    children.push(tag("infPassageiro", {}, p));
  }
  return tag("infPassagem", {}, children);
}

function buildBpeImp(imp: BpeImp): string {
  const children = [buildIcms(imp.icms)];
  if (imp.v_tot_trib) children.push(tag("vTotTrib", imp.v_tot_trib));
  return tag("imp", {}, children);
}

function buildPag(pag: Pagamento): string {
  const children = [tag("tPag", pag.t_pag)];
  if (pag.x_pag) children.push(tag("xPag", pag.x_pag));
  children.push(tag("vPag", pag.v_pag));
  return tag("pag", {}, children);
}
