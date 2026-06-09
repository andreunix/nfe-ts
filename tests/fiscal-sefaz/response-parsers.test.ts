import { describe, expect, test } from "bun:test";
import {
  parseAutorizacaoResponse,
  parseCadastroResponse,
  parseCancellationResponse,
  parseConsultaReciboResponse,
  parseConsultaSituacaoResponse,
  parseCscResponse,
  parseDistDfeResponse,
  parseInutilizacaoResponse,
  parseStatusResponse,
} from "../../src/fiscal-sefaz/index.ts";

describe("fiscal-sefaz NF-e response parsers", () => {
  test("parseia autorização com protocolo e lote assíncrono", () => {
    const xml = `<retEnviNFe><cStat>104</cStat><nRec>351000000012345</nRec>
      <protNFe versao="4.00"><infProt><cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo><nProt>135220000009921</nProt>
      <dhRecbto>2024-05-31T12:00:00-03:00</dhRecbto></infProt></protNFe></retEnviNFe>`;

    const response = parseAutorizacaoResponse(xml);

    expect(response.statusCode).toBe("100");
    expect(response.protocolNumber).toBe("135220000009921");
    expect(response.receiptNumber).toBe("351000000012345");
    expect(response.protocolXml).toContain("<protNFe");
  });

  test("parseia autorização SOAP em nível de lote", () => {
    const xml = `<soap:Envelope><soap:Body><nfeResultMsg:nfeAutorizacaoLoteResult>
      <nfe:retEnviNFe><nfe:cStat>105</nfe:cStat><nfe:xMotivo>Lote em processamento</nfe:xMotivo>
      </nfe:retEnviNFe></nfeResultMsg:nfeAutorizacaoLoteResult></soap:Body></soap:Envelope>`;

    const response = parseAutorizacaoResponse(xml);

    expect(response.statusCode).toBe("105");
    expect(response.statusMessage).toBe("Lote em processamento");
    expect(response.protocolNumber).toBeUndefined();
  });

  test("parseia status com e sem tempo médio", () => {
    expect(parseStatusResponse("<retConsStatServ><cStat>107</cStat><xMotivo>Servico em Operacao</xMotivo><tMed>1</tMed></retConsStatServ>")).toEqual({
      statusCode: "107",
      statusMessage: "Servico em Operacao",
      averageTime: "1",
    });
    expect(parseStatusResponse("<retConsStatServ><cStat>107</cStat><xMotivo>Servico em Operacao</xMotivo></retConsStatServ>").averageTime).toBeUndefined();
  });

  test("parseia cancelamento e inutilização", () => {
    const cancellation = parseCancellationResponse("<retEvento><infEvento><cStat>135</cStat><xMotivo>Evento registrado</xMotivo><nProt>141240000099999</nProt></infEvento></retEvento>");
    const inutilizacao = parseInutilizacaoResponse("<retInutNFe><infInut><tpAmb>2</tpAmb><verAplic>SP</verAplic><cStat>102</cStat><xMotivo>Inutilizacao homologada</xMotivo><cUF>35</cUF><ano>24</ano><CPF>12345678901</CPF><mod>55</mod><serie>1</serie><nNFIni>100</nNFIni><nNFFin>110</nNFFin><nProt>135</nProt></infInut></retInutNFe>");

    expect(cancellation.statusCode).toBe("135");
    expect(cancellation.protocolNumber).toBe("141240000099999");
    expect(inutilizacao.cStat).toBe("102");
    expect(inutilizacao.cpf).toBe("12345678901");
    expect(inutilizacao.nProt).toBe("135");
  });

  test("parseia consulta recibo com múltiplos protocolos", () => {
    const xml = `<retConsReciNFe><tpAmb>2</tpAmb><verAplic>SP</verAplic><nRec>351</nRec>
      <cStat>104</cStat><xMotivo>Lote processado</xMotivo><cUF>35</cUF>
      <protNFe><infProt><chNFe>111</chNFe><cStat>100</cStat><xMotivo>OK</xMotivo></infProt></protNFe>
      <protNFe><infProt><chNFe>222</chNFe><cStat>100</cStat><xMotivo>OK</xMotivo><nProt>999</nProt></infProt></protNFe>
      </retConsReciNFe>`;

    const response = parseConsultaReciboResponse(xml);

    expect(response.cStat).toBe("104");
    expect(response.protocols).toHaveLength(2);
    expect(response.protocols[0]?.chNfe).toBe("111");
    expect(response.protocols[1]?.nProt).toBe("999");
  });

  test("parseia consulta situação com protocolo e eventos", () => {
    const xml = `<retConsSitNFe><tpAmb>2</tpAmb><verAplic>SP</verAplic><cStat>100</cStat>
      <xMotivo>Autorizado</xMotivo><cUF>35</cUF><chNFe>3526</chNFe>
      <protNFe><infProt><cStat>100</cStat></infProt></protNFe>
      <retEvento versao="1.00"><infEvento><cStat>135</cStat></infEvento></retEvento>
      </retConsSitNFe>`;

    const response = parseConsultaSituacaoResponse(xml);

    expect(response.chNfe).toBe("3526");
    expect(response.protocolXml).toContain("<protNFe>");
    expect(response.eventXmls).toHaveLength(1);
  });

  test("parseia DistDFe, cadastro e CSC", () => {
    const dist = parseDistDfeResponse("<retDistDFeInt><cStat>137</cStat><xMotivo>Nenhum documento localizado</xMotivo><ultNSU>0</ultNSU><maxNSU>123</maxNSU></retDistDFeInt>");
    const cadastro = parseCadastroResponse("<retConsCad><infCons><cStat>111</cStat><xMotivo>uma ocorrencia</xMotivo><infCad><IE>111</IE><cSit>1</cSit><xNome>CENTRE</xNome></infCad></infCons></retConsCad>");
    const csc = parseCscResponse("<retAdmCscNFCe><retInfCsc><tpAmb>2</tpAmb><indOp>1</indOp><cStat>150</cStat><xMotivo>Consulta CSC efetivada</xMotivo><idCsc>000001</idCsc><CSC>TOKEN</CSC></retInfCsc></retAdmCscNFCe>");

    expect(dist.maxNsu).toBe("123");
    expect(cadastro.ie).toBe("111");
    expect(cadastro.nome).toBe("CENTRE");
    expect(csc.tokens).toEqual([{ idCsc: "000001", csc: "TOKEN" }]);
  });

  test("lança XmlParsing quando cStat obrigatório está ausente", () => {
    expect(() => parseStatusResponse("<retConsStatServ><xMotivo>ok</xMotivo></retConsStatServ>")).toThrow("missing <cStat>");
    expect(() => parseAutorizacaoResponse("<garbage>no cstat</garbage>")).toThrow("missing <cStat>");
  });
});
