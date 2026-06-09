import { describe, expect, test } from "bun:test";
import {
  Cents,
  CofinsData,
  Contingency,
  ContingencyType,
  InvoiceBuilder,
  InvoiceModel,
  IpiData,
  IsData,
  IssqnData,
  IiData,
  PisData,
  Rate,
  Rate4,
  SefazEnvironment,
  buildAccessKey,
  buildIcmsXml,
  formatCents2,
  getStateCode,
  identifyXmlType,
  isValidGtin,
  putQrTag,
  txtToXml,
  validateConfig,
  validateTxt,
  xmlToMap,
} from "../../src/fiscal/index.ts";

describe("fiscal-core base", () => {
  test("formata centavos, valida GTIN e resolve UF", () => {
    expect(formatCents2(1050)).toBe("10.50");
    expect(isValidGtin("7891000315507")).toBe(true);
    expect(getStateCode("RO")).toBe("11");
  });

  test("valida configuração fiscal", () => {
    const config = validateConfig(JSON.stringify({
      tpAmb: 2,
      razaosocial: "EMPRESA LTDA",
      siglaUF: "RO",
      cnpj: "12.345.678/0001-99",
      schemes: "PL_009_V4",
      versao: "4.00",
    }));
    expect(config.tpAmb).toBe(2);
    expect(config.cnpj).toBe("12345678000199");
  });

  test("identifica e converte XML NF-e", () => {
    const xml = '<NFe xmlns="http://www.portalfiscal.inf.br/nfe"><infNFe Id="NFe1"><ide><cUF>11</cUF></ide></infNFe></NFe>';
    expect(identifyXmlType(xml)).toBe("NFe");
    expect(xmlToMap(xml).infNFe).toBeDefined();
  });
});

describe("fiscal-core impostos", () => {
  test("gera PIS, COFINS, IPI, II, ISSQN e IS", () => {
    expect(new PisData("01").vBc(new Cents(10000)).pPis(new Rate4(16500)).vPis(new Cents(165)).buildXml()).toContain("<PISAliq>");
    expect(new CofinsData("01").vBc(new Cents(10000)).pCofins(new Rate4(76000)).vCofins(new Cents(760)).buildXml()).toContain("<COFINSAliq>");
    expect(new IpiData("00", "999").vBc(new Cents(10000)).pIpi(new Rate(500)).vIpi(new Cents(500)).buildXml()).toContain("<IPITrib>");
    expect(new IiData(new Cents(10000), new Cents(200), new Cents(1000), new Cents(50)).buildXml()).toContain("<II>");
    expect(new IssqnData(10000, 500, 500, "1100205", "01.01").buildXml()).toContain("<ISSQN>");
    expect(new IsData("00", "1234", "5.00").vBcIs("100.00").pIs("5.0000").buildXml()).toContain("<IS>");
  });

  test("gera ICMS básico", () => {
    const [xml, totals] = buildIcmsXml({ cst: "00", orig: "0", v_bc: 1000, v_icms: 180 });
    expect(xml).toContain("<ICMS00>");
    expect(totals.v_bc).toBe(1000);
  });
});

describe("fiscal-core xml builder e convert", () => {
  test("monta chave de acesso", () => {
    const key = buildAccessKey({
      state_code: "11",
      year_month: "2606",
      tax_id: "12345678000199",
      model: 55,
      series: 1,
      number: 1,
      emission_type: 1,
      numeric_code: "12345678",
    });
    expect(key).toHaveLength(44);
  });

  test("gera XML por InvoiceBuilder", () => {
    const issuer = {
      tax_id: "12345678000199",
      legal_name: "Empresa",
      state_code: "RO",
      city_code: "1100205",
      street: "Rua A",
      street_number: "1",
      district: "Centro",
      city_name: "Porto Velho",
      zip_code: "76800000",
      state_tax_id: "123",
      tax_regime: 3,
    };
    const item = {
      product_code: "001",
      description: "Produto",
      ncm: "00000000",
      cfop: "5102",
      unit: "UN",
      quantity: "1.0000",
      unit_price: 1000,
      total_price: 1000,
      icms: { cst: "00", orig: "0", v_bc: 0, p_icms: 0, v_icms: 0 },
    };
    const built = InvoiceBuilder
      .new(issuer, SefazEnvironment.Homologation, InvoiceModel.Nfe)
      .addItem(item)
      .payments([{ method: "01", amount: 1000 }])
      .build();
    expect(built.accessKey()).toHaveLength(44);
    expect(built.xml()).toContain("<infNFe");
  });

  test("converte TXT simples para XML", () => {
    const txt = [
      "NOTAFISCAL|1|",
      "A|4.00|NFe12345678901234567890123456789012345678901234|",
      "B|11|12345678|VENDA|55|1|1|2026-06-08T12:00:00-04:00|1|1|1100205|1|1|0|2|1|0|1|0|fiscal-js|",
      "C|12345678000199||EMPRESA||123|3|",
      "C02|Rua A|1||Centro|1100205|Porto Velho|RO|76800000|1058|BRASIL||",
      "I|1|001|SEM GTIN|Produto|00000000|5102|UN|1.0000|10.0000000000|10.00|SEM GTIN|UN|1.0000|10.0000000000|1|",
      "W|0.00|0.00|10.00|10.00|",
      "X|9|",
      "YA|01|10.00|",
    ].join("\n");
    expect(validateTxt(txt, "local_v12")).toBe(true);
    expect(txtToXml(txt, "local_v12")).toContain("<NFe");
  });
});

describe("fiscal-core protocolo e contingência", () => {
  test("insere QR tag e calcula emissão em contingência", () => {
    expect(putQrTag({ xml: "<NFe></NFe>", qrCodeUrl: "https://x.test/?a=1&b=2", consultUrl: "https://consulta.test" })).toContain("<infNFeSupl>");
    const contingency = new Contingency().activate(ContingencyType.SvcAn, "teste");
    expect(contingency.emissionType()).toBe(6);
  });
});
