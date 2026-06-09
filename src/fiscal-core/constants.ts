/** Namespace oficial dos documentos NF-e/NFC-e. */
export const NFE_NAMESPACE = "http://www.portalfiscal.inf.br/nfe";
/** Namespace XMLDSig usado em assinaturas digitais XML. */
export const XMLDSIG_NAMESPACE = "http://www.w3.org/2000/09/xmldsig#";
/** Namespace de XML Schema Instance. */
export const XML_SCHEMA_INSTANCE_NAMESPACE = "http://www.w3.org/2001/XMLSchema-instance";
/** Versão de schema NF-e emitida pelos helpers deste módulo. */
export const NFE_VERSION = "4.00";
/** Algoritmo de canonicalização XML usado pelo padrão NF-e. */
export const CANONICALIZATION_ALGORITHM = "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
/** Alias de paridade com o Rust. */
export const C14N_ALGORITHM = CANONICALIZATION_ALGORITHM;
/** Transform enveloped-signature usado em XMLDSig. */
export const ENVELOPED_SIGNATURE_TRANSFORM = "http://www.w3.org/2000/09/xmldsig#enveloped-signature";
/** Algoritmo de assinatura digital usado por compatibilidade com NF-e. */
export const SIGNATURE_ALGORITHM = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
/** Algoritmo de digest usado em assinaturas NF-e. */
export const DIGEST_ALGORITHM = "http://www.w3.org/2000/09/xmldsig#sha1";
/** Namespace SOAP 1.2 usado por serviços SEFAZ. */
export const SOAP_ENVELOPE_NS = "http://www.w3.org/2003/05/soap-envelope";
/** Namespace base dos WSDLs NF-e. */
export const NFE_WSDL_NS = "http://www.portalfiscal.inf.br/nfe/wsdl";

/** Códigos oficiais de tipos de pagamento NF-e/NFC-e. */
export const paymentTypes = {
  CASH: "01",
  CHECK: "02",
  CREDIT_CARD: "03",
  DEBIT_CARD: "04",
  STORE_CREDIT: "05",
  FOOD_VOUCHER: "10",
  MEAL_VOUCHER: "11",
  GIFT_VOUCHER: "12",
  FUEL_VOUCHER: "13",
  PIX: "17",
  BANK_SLIP: "15",
  BANK_DEPOSIT: "16",
  INSTANT_PAYMENT: "17",
  TRANSFER: "18",
  LOYALTY_PROGRAM: "19",
  NO_PAYMENT: "90",
  OTHER: "99",
} as const;

/** Alias em snake_case para paridade com `payment_types` do Rust. */
export const payment_types = paymentTypes;
