import { describe, expect, test } from "bun:test";
import { generateKeyPairSync } from "node:crypto";
import {
  Ambiente,
  SP_LOTE_ROOT,
  assinaturaString,
  assinaturaStringV2,
  buildGerarNfse,
  buildLoteRps,
  buildLoteRpsV2,
  buildPedidoCancelamentoNfe,
  buildPedidoConsultaNfe,
  isMunicipal,
  nationalLayoutEndpoint,
  parseAbrasfRetorno,
  parseSaoPauloRetorno,
  resolve,
  rsaSha1Base64,
  signAbrasfXml,
  signSpLoteXml,
  soapAction,
  soapEnvio,
  soapGerarNfse,
  type EmitInput,
} from "../../src/fiscal/index.ts";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const publicKeyPem = publicKey.export({ type: "spki", format: "pem" }).toString();

function abrasfSample(): EmitInput {
  return {
    emitente: {
      cnpj: "18885949000181",
      im: "123456",
      razao_social: "CENTRE SOLUCOES LTDA",
      c_mun: "3552205",
      uf: "SP",
      optante_simples: true,
    },
    rps: {
      numero: 1,
      serie: "1",
      tipo: 1,
      data_emissao: "2026-06-06T10:00:00-03:00",
      tomador: { doc: "34493536837", razao_social: "FULANO DE TAL", email: "fulano@ex.com" },
      servico: {
        valor_centavos: 10000,
        aliquota_iss: "2.00",
        iss_retido: false,
        item_lista_servico: "1.01",
        cnae: "6201500",
        discriminacao: "SERVICO DE TESTE DFEHUB",
      },
      incentivador_cultural: false,
    },
  };
}

function spSample(): EmitInput {
  return {
    emitente: {
      cnpj: "18885949000181",
      im: "12345678",
      razao_social: "CENTRE LTDA",
      c_mun: "3550308",
      uf: "SP",
      optante_simples: false,
    },
    rps: {
      numero: 7,
      serie: "TST",
      tipo: 1,
      data_emissao: "2026-06-06T10:00:00-03:00",
      tomador: { doc: "11222333000181", razao_social: "TOMADOR LTDA" },
      servico: {
        valor_centavos: 10000,
        valor_deducoes_centavos: 0,
        aliquota_iss: "2.00",
        iss_retido: false,
        item_lista_servico: "1.01",
        cod_tributacao_municipio: "02916",
        discriminacao: "TESTE",
      },
      incentivador_cultural: false,
    },
  };
}

describe("fiscal-nfse-mun ABRASF", () => {
  test("gera GerarNfseEnvio e exige CodigoCnae", () => {
    const xml = buildGerarNfse(abrasfSample());

    expect(xml).toContain("<nfse:GerarNfseEnvio xmlns:nfse=\"http://www.abrasf.org.br/nfse.xsd\">");
    expect(xml).toContain("<InfDeclaracaoPrestacaoServico Id=\"rps11\">");
    expect(xml).toContain("<ValorServicos>100.00</ValorServicos>");
    expect(xml).toContain("<Cpf>34493536837</Cpf>");
    expect(xml).toContain("<OptanteSimplesNacional>1</OptanteSimplesNacional>");

    const invalid = abrasfSample();
    invalid.rps.servico.cnae = undefined;
    expect(() => buildGerarNfse(invalid)).toThrow("ABRASF exige CodigoCnae");
  });

  test("monta envelope SOAP e parseia retorno ABRASF", () => {
    const envelope = soapGerarNfse(buildGerarNfse(abrasfSample()));
    expect(envelope).toContain("<nfse:GerarNfse><GerarNfseEnvio><Rps>");

    const authorized = parseAbrasfRetorno(200, "<GerarNfseResposta><Numero>123</Numero><CodigoVerificacao>AB12</CodigoVerificacao><Url>https://nfse.example/123</Url></GerarNfseResposta>");
    const rejected = parseAbrasfRetorno(400, "<MensagemRetorno><Codigo>E101</Codigo><Mensagem>IM invalida</Mensagem></MensagemRetorno>");

    expect(authorized.numero_nfse).toBe("123");
    expect(authorized.link).toBe("https://nfse.example/123");
    expect(rejected.motivo).toBe("E101: IM invalida");
  });

  test("assina XML ABRASF com helper fiscal-crypto", () => {
    const signed = signAbrasfXml(buildGerarNfse(abrasfSample()), privateKeyPem, publicKeyPem);
    expect(signed).toContain("<Signature xmlns=\"http://www.w3.org/2000/09/xmldsig#\">");
    expect(signed).toContain("<Reference URI=\"#rps11\">");
  });
});

describe("fiscal-nfse-mun São Paulo", () => {
  test("gera string de assinatura v1 exata", () => {
    const a = assinaturaString(spSample());
    expect(a).toHaveLength(87);
    expect(a.slice(0, 8)).toBe("12345678");
    expect(a.slice(8, 13)).toBe("TST  ");
    expect(a.slice(13, 25)).toBe("000000000007");
    expect(a.slice(25, 33)).toBe("20260606");
    expect(a.slice(33, 36)).toBe("TNN");
    expect(a.slice(36, 51)).toBe("000000000010000");
    expect(a.slice(66, 71)).toBe("02916");
    expect(a.slice(86, 87)).toBe("N");
  });

  test("reproduz exemplos oficiais/reais de assinatura SP", () => {
    const invoicy = spSample();
    invoicy.emitente.im = "48712345";
    invoicy.rps.numero = 8899;
    invoicy.rps.serie = "99";
    invoicy.rps.data_emissao = "2026-05-27";
    invoicy.rps.tomador = { doc: "22175916000115" };
    invoicy.rps.servico.valor_centavos = 29000;
    invoicy.rps.servico.cod_tributacao_municipio = "07498";
    expect(assinaturaString(invoicy)).toBe("4871234599   00000000889920260527TNN00000000002900000000000000000007498222175916000115N");

    const manual = spSample();
    manual.emitente.im = "31000000";
    manual.rps.numero = 1;
    manual.rps.serie = "OL03";
    manual.rps.data_emissao = "2007-01-03";
    manual.rps.tomador = { doc: "13167474254" };
    manual.rps.servico.valor_centavos = 2050000;
    manual.rps.servico.valor_deducoes_centavos = 500000;
    manual.rps.servico.cod_tributacao_municipio = "2658";
    manual.rps.intermediario = { doc: "09999999000106", im: "99999999", iss_retido: true };
    expect(assinaturaString(manual)).toBe("31000000OL03 00000000000120070103TNN00000000205000000000000050000002658100013167474254209999999000106S");
  });

  test("gera lote v1/v2, SOAP e parseia retorno SP", () => {
    const lote = buildLoteRps(spSample(), "ASSINATURA");
    expect(lote).toContain("<PedidoEnvioLoteRPS xmlns=\"http://www.prefeitura.sp.gov.br/nfe\">");
    expect(lote).toContain("<Cabecalho Versao=\"1\" xmlns=\"\">");
    expect(lote).toContain("<ISSRetidoIntermediario>false</ISSRetidoIntermediario>");

    const v2 = buildLoteRpsV2(spSample(), "ASSINATURA");
    expect(assinaturaStringV2(spSample()).slice(0, 12)).toBe("000012345678");
    expect(v2).toContain("<Cabecalho Versao=\"2\" xmlns=\"\">");
    expect(v2).toContain("<IBSCBS><finNFSe>0</finNFSe>");

    expect(soapAction("EnvioLoteRPS")).toBe("http://www.prefeitura.sp.gov.br/nfe/ws/envioLoteRPS");
    expect(soapEnvio("EnvioLoteRPS", lote, 1)).toContain("&lt;PedidoEnvioLoteRPS");

    const retorno = parseSaoPauloRetorno(200, "&lt;RetornoEnvioLoteRPS&gt;&lt;Sucesso&gt;true&lt;/Sucesso&gt;&lt;NumeroNFe&gt;9&lt;/NumeroNFe&gt;&lt;CodigoVerificacao&gt;XYZ&lt;/CodigoVerificacao&gt;&lt;/RetornoEnvioLoteRPS&gt;");
    expect(retorno.numero_nfse).toBe("9");
    expect(retorno.codigo_verificacao).toBe("XYZ");
  });

  test("gera XML puro de consulta/cancelamento e assina lote SP", () => {
    const cancelString = "12345678".padStart(8, "0") + "9".padStart(12, "0");
    const cancel = buildPedidoCancelamentoNfe({ numero_nfse: "9", codigo_verificacao: "ABC", motivo: "erro" }, { inscricao_municipal: "12345678", cnpj: "18885949000181" }, rsaSha1Base64(cancelString, privateKeyPem));
    expect(cancel).toContain("<PedidoCancelamentoNFe xmlns=\"http://www.prefeitura.sp.gov.br/nfe\">");
    expect(cancel).toContain("<NumeroNFe>9</NumeroNFe>");

    const consulta = buildPedidoConsultaNfe("9", "ABC", { inscricao_municipal: "12345678", cnpj: "18885949000181" });
    expect(consulta).toContain("<PedidoConsultaNFe xmlns=\"http://www.prefeitura.sp.gov.br/nfe\">");

    const signed = signSpLoteXml(buildLoteRps(spSample(), rsaSha1Base64(assinaturaString(spSample()), privateKeyPem)), SP_LOTE_ROOT, privateKeyPem, publicKeyPem);
    expect(signed).toContain("<Signature xmlns=\"http://www.w3.org/2000/09/xmldsig#\">");
    expect(signed).toContain("<Reference URI=\"\">");
  });
});

describe("fiscal-nfse-mun registry", () => {
  test("resolve provedores conhecidos", () => {
    expect(resolve("3550308")?.nome).toBe("SAOPAULO");
    expect(resolve("3552205")?.nome).toBe("DSF");
    expect(resolve("3518800")?.nome).toBe("GINFES");
    expect(resolve("3513801")?.nome).toBe("SigISS");
    expect(resolve("3547304")?.nome).toBe("Simpliss");
    expect(resolve("3304557")).toBeUndefined();
    expect(isMunicipal("3550308")).toBe(true);
    expect(nationalLayoutEndpoint("3547304", false)).toContain("homologacaoabrasf");
    expect(nationalLayoutEndpoint("3547304", true)).toContain("santanadeparnaiba");
  });

  test("ambiente define metodo SOAP SP", () => {
    const { metodo } = require("../../src/fiscal-nfse-mun/saopaulo/index.ts") as typeof import("../../src/fiscal-nfse-mun/saopaulo/index.ts");
    expect(metodo(Ambiente.Producao)).toBe("EnvioLoteRPS");
    expect(metodo(Ambiente.Homologacao)).toBe("TesteEnvioLoteRPS");
  });
});
