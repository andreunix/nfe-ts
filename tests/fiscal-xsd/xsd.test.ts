import { describe, expect, test } from "bun:test";
import { FiscalError, XsdSchema, xsdSchemas } from "../../src/fiscal/index.ts";

describe("fiscal-xsd", () => {
  test("validates inline schemas", () => {
    const schema = new XsdSchema(
      "inline-demo",
      [
        {
          name: "root.xsd",
          content: `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="root" type="xs:string"/>
</xs:schema>`,
        },
      ],
      "root.xsd",
    );

    expect(schema.validate("<root>ok</root>")).toEqual([]);
    expect(schema.validate("<other/>").length).toBeGreaterThan(0);
  });

  test("throws fiscal errors when requested", () => {
    const schema = new XsdSchema(
      "inline-throw-demo",
      [
        {
          name: "root.xsd",
          content: `<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="root" type="xs:string"/>
</xs:schema>`,
        },
      ],
      "root.xsd",
    );

    expect(() => schema.validateOrThrow("<other/>")).toThrow(FiscalError);
    expect(() => schema.validate_or_throw("<other/>")).toThrow(FiscalError);
  });

  test("loads vendored fiscal schema bundles", () => {
    const cases: Array<[string, XsdSchema, string]> = [
      ["mdfe", xsdSchemas.mdfe(), '<MDFe xmlns="http://www.portalfiscal.inf.br/mdfe"/>'],
      ["nfe_lote", xsdSchemas.nfeLote(), '<enviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00"/>'],
      ["cte", xsdSchemas.cte(), '<CTe xmlns="http://www.portalfiscal.inf.br/cte"/>'],
      ["cteos", xsdSchemas.cteos(), '<CTeOS xmlns="http://www.portalfiscal.inf.br/cte"/>'],
      ["gtve", xsdSchemas.gtve(), '<GTVe xmlns="http://www.portalfiscal.inf.br/cte"/>'],
      ["bpe", xsdSchemas.bpe(), '<BPe xmlns="http://www.portalfiscal.inf.br/bpe"/>'],
      ["dps", xsdSchemas.dps(), '<DPS xmlns="http://www.sped.fazenda.gov.br/nfse"/>'],
      ["nfse_evento", xsdSchemas.nfseEvento(), '<pedRegEvento xmlns="http://www.sped.fazenda.gov.br/nfse"/>'],
      ["abrasf_gerar_nfse", xsdSchemas.abrasfGerarNfse(), '<GerarNfseEnvio xmlns="http://www.abrasf.org.br/nfse.xsd"/>'],
      ["sp_lote_rps", xsdSchemas.spLoteRps(), '<PedidoEnvioLoteRPS xmlns="http://www.prefeitura.sp.gov.br/nfe"/>'],
      ["sp_lote_rps_v2", xsdSchemas.spLoteRpsV2(), '<PedidoEnvioLoteRPS xmlns="http://www.prefeitura.sp.gov.br/nfe"/>'],
    ];

    for (const [name, schema, xml] of cases) {
      const errors = schema.validate(xml);
      expect(errors, name).not.toContain("Failed to locate the main schema resource");
      expect(errors.length, name).toBeGreaterThan(0);
    }
  });
});
