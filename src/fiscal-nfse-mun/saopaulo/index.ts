import { tag } from "../../fiscal-core/xml_utils.ts";
import { Ambiente, Status, type CancelInput, type EmitInput, type EmitOutput, type Servico } from "../model.ts";
import type { ProviderCtx } from "../provider.ts";

export const SP_NS = "http://www.prefeitura.sp.gov.br/nfe";
export const SP_LOTE_ROOT = "PedidoEnvioLoteRPS";

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

function dateOnly(value: string): string {
  return value.split("T")[0] ?? value;
}

function dateDigits(value: string): string {
  return digits(dateOnly(value));
}

function valor(centavos: number): string {
  const sign = centavos < 0 ? "-" : "";
  const abs = Math.abs(centavos);
  return `${sign}${Math.trunc(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

function aliquotaFracao(percent: string): string {
  const value = Number(percent.replace(",", "."));
  return (Number.isFinite(value) ? value / 100 : 0).toFixed(4);
}

export function assinaturaString(input: EmitInput): string {
  return assinaturaStringW(input, 8);
}

export const assinatura_string = assinaturaString;

export function assinaturaStringV2(input: EmitInput): string {
  return assinaturaStringW(input, 12);
}

export const assinatura_string_v2 = assinaturaStringV2;

function assinaturaStringW(input: EmitInput, imWidth: number): string {
  const emitente = input.emitente;
  const rps = input.rps;
  const servico = rps.servico;
  const im = digits(emitente.im ?? "");
  const codServico = digits(servico.cod_tributacao_municipio ?? "");
  const [indicadorTomador, docTomador] = rps.tomador.doc ? docIndicator(rps.tomador.doc) : ["3", ""];
  let out = [
    im.padStart(imWidth, "0"),
    rps.serie.padEnd(5, " "),
    String(rps.numero).padStart(12, "0"),
    dateDigits(rps.data_emissao),
    "T",
    "N",
    servico.iss_retido ? "S" : "N",
    String(servico.valor_centavos).padStart(15, "0"),
    String(servico.valor_deducoes_centavos ?? 0).padStart(15, "0"),
    codServico.padStart(5, "0"),
    indicadorTomador,
    docTomador.padStart(14, "0"),
  ].join("");

  if (rps.intermediario) {
    const [indicador, doc] = docIndicator(rps.intermediario.doc);
    out += indicador;
    out += doc.padStart(14, "0");
    out += rps.intermediario.iss_retido ? "S" : "N";
  } else {
    out += "N";
  }
  return out;
}

function docIndicator(doc: string): [string, string] {
  const value = digits(doc);
  return [value.length === 11 ? "1" : "2", value];
}

function cpfCnpjTag(wrapper: string, doc: string): string {
  const d = digits(doc);
  return tag(wrapper, {}, [d.length === 11 ? tag("CPF", d) : tag("CNPJ", d)]);
}

function discriminacao(servico: Servico): string {
  return tag("Discriminacao", servico.discriminacao);
}

export function buildLoteRps(input: EmitInput, assinaturaB64: string): string {
  const emitente = input.emitente;
  const rps = input.rps;
  const servico = rps.servico;
  const data = dateOnly(rps.data_emissao);
  const cabecalho = tag("Cabecalho", { Versao: "1", xmlns: "" }, [
    tag("CPFCNPJRemetente", {}, [tag("CNPJ", emitente.cnpj)]),
    tag("transacao", "false"),
    tag("dtInicio", data),
    tag("dtFim", data),
    tag("QtdRPS", "1"),
    tag("ValorTotalServicos", valor(servico.valor_centavos)),
    tag("ValorTotalDeducoes", "0.00"),
  ]);

  const rpsChildren = [
    tag("Assinatura", assinaturaB64),
    tag("ChaveRPS", {}, [
      tag("InscricaoPrestador", digits(emitente.im ?? "")),
      tag("SerieRPS", rps.serie),
      tag("NumeroRPS", String(rps.numero)),
    ]),
    tag("TipoRPS", "RPS"),
    tag("DataEmissao", data),
    tag("StatusRPS", "N"),
    tag("TributacaoRPS", "T"),
    tag("ValorServicos", valor(servico.valor_centavos)),
    tag("ValorDeducoes", valor(servico.valor_deducoes_centavos ?? 0)),
    tag("CodigoServico", digits(servico.cod_tributacao_municipio ?? "")),
    tag("AliquotaServicos", aliquotaFracao(servico.aliquota_iss ?? "0")),
    tag("ISSRetido", servico.iss_retido ? "true" : "false"),
  ];
  if (rps.tomador.doc) rpsChildren.push(cpfCnpjTag("CPFCNPJTomador", rps.tomador.doc));
  if (rps.tomador.razao_social) rpsChildren.push(tag("RazaoSocialTomador", rps.tomador.razao_social));
  if (rps.tomador.email) rpsChildren.push(tag("EmailTomador", rps.tomador.email));

  const issIntermediario = rps.intermediario?.iss_retido ?? false;
  if (rps.intermediario) {
    rpsChildren.push(cpfCnpjTag("CPFCNPJIntermediario", rps.intermediario.doc));
    if (rps.intermediario.im) rpsChildren.push(tag("InscricaoMunicipalIntermediario", rps.intermediario.im));
  }
  rpsChildren.push(tag("ISSRetidoIntermediario", issIntermediario ? "true" : "false"));
  rpsChildren.push(discriminacao(servico));

  return tag("PedidoEnvioLoteRPS", { xmlns: SP_NS }, [cabecalho, tag("RPS", { xmlns: "" }, rpsChildren)]);
}

export const build_lote_rps = buildLoteRps;

export function buildLoteRpsV2(input: EmitInput, assinaturaB64: string): string {
  const emitente = input.emitente;
  const rps = input.rps;
  const servico = rps.servico;
  const data = dateOnly(rps.data_emissao);
  const zero = "0.00";
  const cabecalho = tag("Cabecalho", { Versao: "2", xmlns: "" }, [
    tag("CPFCNPJRemetente", {}, [tag("CNPJ", emitente.cnpj)]),
    tag("transacao", "false"),
    tag("dtInicio", data),
    tag("dtFim", data),
    tag("QtdRPS", "1"),
  ]);
  const ibscbs = tag("IBSCBS", {}, [
    tag("finNFSe", "0"),
    tag("indFinal", "0"),
    tag("cIndOp", servico.c_ind_op ?? "100101"),
    tag("indDest", "0"),
    tag("valores", {}, [tag("trib", {}, [tag("gIBSCBS", {}, [tag("cClassTrib", servico.c_class_trib ?? "000001")])])]),
  ]);
  const rpsChildren = [
    tag("Assinatura", assinaturaB64),
    tag("ChaveRPS", {}, [
      tag("InscricaoPrestador", digits(emitente.im ?? "")),
      tag("SerieRPS", rps.serie),
      tag("NumeroRPS", String(rps.numero)),
    ]),
    tag("TipoRPS", "RPS"),
    tag("DataEmissao", data),
    tag("StatusRPS", "N"),
    tag("TributacaoRPS", "T"),
    tag("ValorDeducoes", valor(servico.valor_deducoes_centavos ?? 0)),
    tag("ValorPIS", zero),
    tag("ValorCOFINS", zero),
    tag("ValorINSS", zero),
    tag("ValorIR", zero),
    tag("ValorCSLL", zero),
    tag("CodigoServico", digits(servico.cod_tributacao_municipio ?? "")),
    tag("AliquotaServicos", aliquotaFracao(servico.aliquota_iss ?? "0")),
    tag("ISSRetido", servico.iss_retido ? "true" : "false"),
  ];
  if (rps.tomador.doc) rpsChildren.push(cpfCnpjTag("CPFCNPJTomador", rps.tomador.doc));
  if (rps.tomador.razao_social) rpsChildren.push(tag("RazaoSocialTomador", rps.tomador.razao_social));
  if (rps.tomador.email) rpsChildren.push(tag("EmailTomador", rps.tomador.email));
  rpsChildren.push(
    discriminacao(servico),
    tag("ValorInicialCobrado", valor(servico.valor_centavos)),
    tag("ValorIPI", zero),
    tag("ExigibilidadeSuspensa", "0"),
    tag("PagamentoParceladoAntecipado", "0"),
    tag("NBS", servico.nbs ?? "000000000"),
    tag("cLocPrestacao", servico.c_mun_prestacao ?? emitente.c_mun),
    ibscbs,
  );

  return tag("PedidoEnvioLoteRPS", { xmlns: SP_NS }, [cabecalho, tag("RPS", { xmlns: "" }, rpsChildren)]);
}

export const build_lote_rps_v2 = buildLoteRpsV2;

function escapeXmlText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}

function unescapeXmlText(value: string): string {
  return value
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&");
}

export function metodo(ambiente: Ambiente): string {
  return ambiente === Ambiente.Producao ? "EnvioLoteRPS" : "TesteEnvioLoteRPS";
}

export function soapAction(method: string): string {
  switch (method) {
    case "TesteEnvioLoteRPS": return "http://www.prefeitura.sp.gov.br/nfe/ws/testeenvio";
    case "EnvioLoteRPS": return "http://www.prefeitura.sp.gov.br/nfe/ws/envioLoteRPS";
    case "EnvioRPS": return "http://www.prefeitura.sp.gov.br/nfe/ws/envioRPS";
    case "CancelamentoNFe": return "http://www.prefeitura.sp.gov.br/nfe/ws/cancelamentoNFe";
    case "ConsultaNFe": return "http://www.prefeitura.sp.gov.br/nfe/ws/consultaNFe";
    default: return "";
  }
}

export const soap_action = soapAction;

export function soapEnvio(method: string, signedLote: string, versao: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfe="${SP_NS}"><soap:Body><nfe:${method}Request><nfe:VersaoSchema>${versao}</nfe:VersaoSchema><nfe:MensagemXML>${escapeXmlText(signedLote)}</nfe:MensagemXML></nfe:${method}Request></soap:Body></soap:Envelope>`;
}

export const soap_envio = soapEnvio;

function tagVal(xml: string, name: string): string | undefined {
  for (const open of [`<${name}>`, `:${name}>`]) {
    const index = xml.indexOf(open);
    if (index >= 0) {
      const rest = xml.slice(index + open.length);
      const end = rest.indexOf("<");
      const value = end >= 0 ? rest.slice(0, end).trim() : "";
      if (value) return value;
    }
  }
  return undefined;
}

export function parseSaoPauloRetorno(httpStatus: number, body: string): EmitOutput {
  const inner = unescapeXmlText(body);
  const ok = httpStatus >= 200 && httpStatus < 300 && tagVal(inner, "Sucesso")?.toLowerCase() === "true";
  const motivo = ok ? undefined : formatSpMotivo(inner);
  return {
    status: ok ? Status.Autorizado : Status.Rejeitado,
    numero_nfse: tagVal(inner, "NumeroNFe") ?? tagVal(inner, "NumeroNota"),
    codigo_verificacao: tagVal(inner, "CodigoVerificacao"),
    data_emissao: tagVal(inner, "DataEmissaoNFe"),
    xml: ok ? inner : undefined,
    motivo,
    link: undefined,
    raw: body,
  };
}

export const parse_sao_paulo_retorno = parseSaoPauloRetorno;

function formatSpMotivo(inner: string): string {
  const code = tagVal(inner, "Codigo");
  const desc = tagVal(inner, "Descricao");
  if (code && desc) return `${code}: ${desc}`;
  if (desc) return desc;
  return Array.from(inner).slice(0, 600).join("");
}

export function buildPedidoCancelamentoNfe(input: CancelInput, ctx: Pick<ProviderCtx, "inscricao_municipal" | "cnpj">, assinaturaCancelamento: string): string {
  const im = digits(ctx.inscricao_municipal ?? "");
  const cnpj = digits(ctx.cnpj ?? "");
  const numero = digits(input.numero_nfse);
  const codigo = input.codigo_verificacao ?? "";
  return tag("PedidoCancelamentoNFe", { xmlns: SP_NS }, [
    tag("Cabecalho", { Versao: "1", xmlns: "" }, [
      tag("CPFCNPJRemetente", {}, [tag("CNPJ", cnpj)]),
      tag("transacao", "true"),
    ]),
    tag("Detalhe", { xmlns: "" }, [
      tag("ChaveNFe", {}, [
        tag("InscricaoPrestador", im),
        tag("NumeroNFe", numero),
        tag("CodigoVerificacao", codigo),
      ]),
      tag("AssinaturaCancelamento", assinaturaCancelamento),
    ]),
  ]);
}

export const build_pedido_cancelamento_nfe = buildPedidoCancelamentoNfe;

export function assinaturaCancelamentoString(numeroNfse: string, inscricaoMunicipal: string): string {
  return `${digits(inscricaoMunicipal).padStart(8, "0")}${digits(numeroNfse).padStart(12, "0")}`;
}

export const assinatura_cancelamento_string = assinaturaCancelamentoString;

export function buildPedidoConsultaNfe(numeroNfse: string, codigoVerificacao: string, ctx: Pick<ProviderCtx, "inscricao_municipal" | "cnpj">): string {
  const im = digits(ctx.inscricao_municipal ?? "");
  const cnpj = digits(ctx.cnpj ?? "");
  return tag("PedidoConsultaNFe", { xmlns: SP_NS }, [
    tag("Cabecalho", { Versao: "1", xmlns: "" }, [tag("CPFCNPJRemetente", {}, [tag("CNPJ", cnpj)])]),
    tag("Detalhe", { xmlns: "" }, [
      tag("ChaveNFe", {}, [
        tag("InscricaoPrestador", im),
        tag("NumeroNFe", digits(numeroNfse)),
        tag("CodigoVerificacao", codigoVerificacao),
      ]),
    ]),
  ]);
}

export const build_pedido_consulta_nfe = buildPedidoConsultaNfe;
