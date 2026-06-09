/**
 * Certificados digitais e assinatura XML fiscal.
 *
 * A pasta espelha a crate Rust:
 * - `pfx`: carregamento/metadados de certificados;
 * - `sign`: assinatura XML-DSig;
 * - `c14n`: canonicalização e utilitários XML.
 */
export * from "./pfx.ts";
export * from "./sign.ts";
export * from "./c14n.ts";
