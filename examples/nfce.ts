import {
  InvoiceBuilder,
  InvoiceModel,
  SefazEnvironment,
  buildNfceConsultUrl,
  buildNfceQrCodeUrl,
  putQrTag,
} from "../src/fiscal/index.ts";

const issuer = {
  tax_id: "12345678000199",
  legal_name: "MERCADO EXEMPLO LTDA",
  state_code: "RO",
  city_code: "1100205",
  street: "Av. Principal",
  street_number: "10",
  district: "Centro",
  city_name: "Porto Velho",
  zip_code: "76800000",
  state_tax_id: "000000123",
  tax_regime: 3,
};

const built = InvoiceBuilder
  .new(issuer, SefazEnvironment.Homologation, InvoiceModel.Nfce)
  .invoiceNumber(10)
  .series(1)
  .issuedAt("2026-06-08T12:00:00-04:00")
  .operationNature("VENDA AO CONSUMIDOR")
  .addItem({
    product_code: "CAFE",
    description: "Cafe 500g",
    ncm: "09012100",
    cfop: "5102",
    unit: "UN",
    quantity: "1.0000",
    unit_price: 1590,
    total_price: 1590,
    icms: { cst: "00", orig: "0", v_bc: 1590, p_icms: 0, v_icms: 0 },
    pis: { cst: "07" },
    cofins: { cst: "07" },
  })
  .payments([{ method: "01", amount: 1590 }])
  .build();

const qrCodeUrl = buildNfceQrCodeUrl({
  accessKey: built.accessKey(),
  environment: SefazEnvironment.Homologation,
  qrCodeBaseUrl: "https://www.sefaz.ro.gov.br/nfce/qrCode",
  cscId: "000001",
  cscToken: "TOKEN_CSC_DE_HOMOLOGACAO",
});

const consultUrl = buildNfceConsultUrl("https://www.sefaz.ro.gov.br/nfce/consulta", built.accessKey(), SefazEnvironment.Homologation);
const xmlWithQrCode = putQrTag({ xml: built.xml(), qrCodeUrl, consultUrl });

console.log("NFC-e chave:", built.accessKey());
console.log("QR Code:", qrCodeUrl);
console.log("NFC-e XML com infNFeSupl:", xmlWithQrCode);
