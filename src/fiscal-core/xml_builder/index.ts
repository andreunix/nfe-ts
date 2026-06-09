/**
 * Builder XML para NF-e/NFC-e.
 *
 * Espelha a pasta `xml_builder` do Rust com módulos por grupo fiscal.
 */
export * from "./access_key.ts";
export * from "./builder.ts";
export { buildFromData, build_from_data } from "./builder.ts";
export * from "./dest.ts";
export * from "./det/index.ts";
export * from "./emit.ts";
export * from "./ide.ts";
export * from "./optional.ts";
export * from "./pag.ts";
export { TaxId as XmlBuilderTaxId } from "./tax_id.ts";
export * from "./total.ts";
export * from "./transp.ts";
