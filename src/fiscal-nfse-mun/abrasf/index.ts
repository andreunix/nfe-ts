import { tag } from "../../fiscal-core/xml_utils.ts";
import { MunError } from "../error.ts";
import { Status, type EmitInput, type EmitOutput, type Tomador } from "../model.ts";

export const ABRASF_NS = "http://www.abrasf.org.br/nfse.xsd";
const SOAP_NS = "http://schemas.xmlsoap.org/soap/envelope/";
const NFSE_SVC_NS = "http://nfse.abrasf.org.br";

export function centavos(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  return `${sign}${Math.trunc(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

function data(iso: string): string {
  return iso.split("T")[0] ?? iso;
}

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

export function buildGerarNfse(input: EmitInput): string {
  const emitente = input.emitente;
  const rps = input.rps;
  const servicoData = rps.servico;
  const cnae = servicoData.cnae;
  if (!cnae) throw MunError.validacao("ABRASF exige CodigoCnae");

  const cMun = servicoData.c_mun_prestacao ?? emitente.c_mun;
  const identificacaoRps = tag("IdentificacaoRps", {}, [
    tag("Numero", String(rps.numero)),
    tag("Serie", rps.serie),
    tag("Tipo", String(rps.tipo ?? 1)),
  ]);
  const rpsBlock = tag("Rps", {}, [
    identificacaoRps,
    tag("DataEmissao", data(rps.data_emissao)),
    tag("Status", "1"),
  ]);

  const valoresChildren = [tag("ValorServicos", centavos(servicoData.valor_centavos))];
  if (servicoData.aliquota_iss) valoresChildren.push(tag("Aliquota", servicoData.aliquota_iss));

  const servicoChildren = [
    tag("Valores", {}, valoresChildren),
    tag("IssRetido", servicoData.iss_retido ? "1" : "2"),
  ];
  if (servicoData.item_lista_servico.trim()) servicoChildren.push(tag("ItemListaServico", servicoData.item_lista_servico));
  servicoChildren.push(tag("CodigoCnae", cnae));
  if (servicoData.cod_tributacao_municipio) servicoChildren.push(tag("CodigoTributacaoMunicipio", servicoData.cod_tributacao_municipio));
  servicoChildren.push(
    tag("Discriminacao", servicoData.discriminacao),
    tag("CodigoMunicipio", cMun),
    tag("ExigibilidadeISS", "1"),
  );

  const prestadorChildren = [tag("CpfCnpj", {}, [tag("Cnpj", emitente.cnpj)])];
  if (emitente.im) prestadorChildren.push(tag("InscricaoMunicipal", emitente.im));

  const infChildren = [
    rpsBlock,
    tag("Competencia", data(rps.data_emissao)),
    tag("Servico", {}, servicoChildren),
    tag("Prestador", {}, prestadorChildren),
  ];
  const tomador = buildTomador(rps.tomador);
  if (tomador) infChildren.push(tomador);
  infChildren.push(
    tag("OptanteSimplesNacional", emitente.optante_simples ? "1" : "2"),
    tag("IncentivoFiscal", "2"),
  );

  const infDecl = tag("InfDeclaracaoPrestacaoServico", { Id: `rps${rps.numero}${rps.serie}` }, infChildren);
  return tag("nfse:GerarNfseEnvio", { "xmlns:nfse": ABRASF_NS }, [tag("Rps", {}, [infDecl])]);
}

export const build_gerar_nfse = buildGerarNfse;

function buildTomador(tomador: Tomador): string | undefined {
  if (!tomador.doc) return undefined;
  const doc = digits(tomador.doc);
  const cpfCnpj = doc.length === 11 ? tag("Cpf", doc) : tag("Cnpj", doc);
  const children = [tag("IdentificacaoTomador", {}, [tag("CpfCnpj", {}, [cpfCnpj])])];
  if (tomador.razao_social) children.push(tag("RazaoSocial", tomador.razao_social));
  if (tomador.email) children.push(tag("Contato", {}, [tag("Email", tomador.email)]));
  return tag("Tomador", {}, children);
}

function extractRps(signedEnvio: string): string {
  const start = signedEnvio.indexOf("<Rps>");
  const startWithAttr = signedEnvio.indexOf("<Rps ");
  const ini = start >= 0 ? start : startWithAttr;
  if (ini < 0) throw MunError.xml("<Rps> não encontrado");
  const end = signedEnvio.lastIndexOf("</Rps>");
  if (end < 0) throw MunError.xml("</Rps> não encontrado");
  return signedEnvio.slice(ini, end + "</Rps>".length);
}

export function soapGerarNfse(signedEnvio: string): string {
  const rps = extractRps(signedEnvio);
  return `<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="${SOAP_NS}" xmlns:nfse="${NFSE_SVC_NS}"><soapenv:Body><nfse:GerarNfse><GerarNfseEnvio>${rps}</GerarNfseEnvio></nfse:GerarNfse></soapenv:Body></soapenv:Envelope>`;
}

export const soap_gerar_nfse = soapGerarNfse;

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

export function parseAbrasfRetorno(httpStatus: number, body: string): EmitOutput {
  const numero = tagVal(body, "Numero");
  const autorizado = httpStatus >= 200 && httpStatus < 300 && numero !== undefined;
  const motivo = autorizado ? undefined : formatMotivo(body);
  return {
    status: autorizado ? Status.Autorizado : Status.Rejeitado,
    numero_nfse: numero,
    codigo_verificacao: tagVal(body, "CodigoVerificacao"),
    data_emissao: tagVal(body, "DataEmissao"),
    xml: autorizado ? body : undefined,
    motivo,
    link: tagVal(body, "Url")?.startsWith("http") ? tagVal(body, "Url") : undefined,
    raw: body,
  };
}

export const parse_abrasf_retorno = parseAbrasfRetorno;

function formatMotivo(body: string): string {
  const code = tagVal(body, "Codigo");
  const message = tagVal(body, "Mensagem");
  if (code && message) return `${code}: ${message}`;
  if (message) return message;
  return Array.from(body).slice(0, 500).join("");
}
