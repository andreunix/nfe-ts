import { describe, expect, test } from "bun:test";
import { cte, mdfe } from "../../src/fiscal-sefaz/index.ts";

describe("fiscal-sefaz CT-e and MDF-e parsers", () => {
  test("parseia CT-e autorizado e rejeitado", () => {
    const authorized = cte.parseCteAuthorizationResponse(`<soap:Body><cteResultMsg><retCTe>
      <cStat>103</cStat><xMotivo>Lote recebido</xMotivo>
      <protCTe><infProt><cStat>100</cStat><xMotivo>Autorizado o uso do CT-e</xMotivo>
      <chCTe>35250612345678000190570010000000011000000017</chCTe>
      <nProt>135250000000999</nProt><dhRecbto>2026-06-05T10:00:00-03:00</dhRecbto>
      </infProt></protCTe></retCTe></cteResultMsg></soap:Body>`);
    const rejected = cte.parseCteAuthorizationResponse("<retCTe><cStat>403</cStat><xMotivo>Rejeicao</xMotivo></retCTe>");

    expect(authorized.statusCode).toBe("100");
    expect(authorized.accessKey).toBe("35250612345678000190570010000000011000000017");
    expect(authorized.protocolXml).toContain("<protCTe>");
    expect(rejected.statusCode).toBe("403");
    expect(rejected.protocolXml).toBeUndefined();
  });

  test("parseia consulta e status CT-e", () => {
    const consulta = cte.parseCteConsultaResponse(`<retConsSitCTe><cStat>100</cStat><xMotivo>Autorizado</xMotivo>
      <protCTe><infProt><chCTe>3525</chCTe><nProt>999</nProt></infProt></protCTe>
      <procEventoCTe><eventoCTe></eventoCTe></procEventoCTe></retConsSitCTe>`);
    const status = cte.parseCteStatusResponse("<retConsStatServCTe><cStat>107</cStat><xMotivo>Servico em Operacao</xMotivo><tMed>1</tMed></retConsStatServCTe>");

    expect(consulta.protocolNumber).toBe("999");
    expect(consulta.eventXmls).toHaveLength(1);
    expect(status.averageTime).toBe("1");
  });

  test("parseia MDF-e autorizado e rejeitado", () => {
    const authorized = mdfe.parseMdfeAuthorizationResponse(`<retMDFe><cStat>132</cStat><xMotivo>Lote recebido</xMotivo>
      <protMDFe><infProt><chMDFe>43250612345678000190580010000000011000000017</chMDFe>
      <nProt>143250000000123</nProt><dhRecbto>2026-06-05T10:00:00-03:00</dhRecbto>
      <cStat>100</cStat><xMotivo>Autorizado</xMotivo></infProt></protMDFe></retMDFe>`);
    const rejected = mdfe.parseMdfeAuthorizationResponse("<retMDFe><cStat>225</cStat><xMotivo>Falha Schema</xMotivo></retMDFe>");

    expect(authorized.statusCode).toBe("100");
    expect(authorized.protocolNumber).toBe("143250000000123");
    expect(rejected.statusCode).toBe("225");
    expect(rejected.protocolNumber).toBeUndefined();
  });

  test("parseia consulta, status e evento MDF-e", () => {
    const consulta = mdfe.parseMdfeConsultaResponse(`<retConsSitMDFe><cStat>100</cStat><xMotivo>Autorizado</xMotivo>
      <protMDFe><infProt><chMDFe>4325</chMDFe><nProt>143</nProt></infProt></protMDFe>
      <procEventoMDFe><eventoMDFe><infEvento><tpEvento>110112</tpEvento></infEvento></eventoMDFe></procEventoMDFe>
      </retConsSitMDFe>`);
    const status = mdfe.parseMdfeStatusResponse("<retConsStatServMDFe><cStat>107</cStat><xMotivo>Servico</xMotivo><tMed>1</tMed></retConsStatServMDFe>");
    const event = mdfe.parseMdfeEventResponse("<retEventoMDFe><infEvento><cStat>135</cStat><xMotivo>Evento registrado</xMotivo><tpEvento>110112</tpEvento><chMDFe>4325</chMDFe><nProt>789</nProt><dhRegEvento>2026-06-05T10:00:00-03:00</dhRegEvento></infEvento></retEventoMDFe>");

    expect(consulta.eventXmls).toHaveLength(1);
    expect(status.statusCode).toBe("107");
    expect(event.isRegistered()).toBe(true);
    expect(event.protocolNumber).toBe("789");
  });

  test("lança erro em CT-e/MDF-e sem cStat", () => {
    expect(() => cte.parseCteConsultaResponse("<retConsSitCTe></retConsSitCTe>")).toThrow("missing <cStat>");
    expect(() => mdfe.parseMdfeConsultaResponse("<retConsSitMDFe></retConsSitMDFe>")).toThrow("missing <cStat>");
    expect(() => mdfe.parseMdfeEventResponse("<retEventoMDFe></retEventoMDFe>")).toThrow("missing <cStat>");
  });
});
