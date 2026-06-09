# Paridade fiscal-crypto Rust -> TypeScript

Este arquivo rastreia a porta de `tmp/fiscal-rs/crates/fiscal-crypto/src` para
`src/fiscal-crypto`.

Estados:

- `missing`: ainda não existe equivalente TypeScript.
- `partial`: existe, mas não cobre toda a API/comportamento Rust.
- `implemented`: API pública principal existe e comportamento central foi portado.
- `verified`: implementado e coberto por testes/smoke tests.

## Módulos

| Rust | TypeScript | Estado | Observações |
| --- | --- | --- | --- |
| `lib.rs` | `index.ts` | implemented | Reexporta a API de certificado. |
| `certificate/mod.rs` | `certificate/index.ts` | implemented | Reexporta PFX, assinatura e C14N. |
| `certificate/c14n.rs` | `certificate/c14n.ts` | verified | Canonicalização simplificada, extração de Id, namespace herdado e remoção de assinatura. |
| `certificate/sign.rs` | `certificate/sign.ts` | verified | Assinatura XML-DSig com RSA-SHA1/RSA-SHA256 e helpers públicos principais. |
| `certificate/pfx.rs` | `certificate/pfx.ts` | verified | `node-forge` lê PKCS#12/PFX, extrai chave/certificado PEM e metadados X509; reexportação OpenSSL de PFX legado segue limitada. |

## Auditoria de compatibilidade

Última verificação: 2026-06-08.

- arquivos públicos Rust sem arquivo TypeScript equivalente: `0`;
- funções/enums públicos Rust sem export TypeScript equivalente no mesmo caminho
  conceitual: `0` de `31`;
- `bunx tsc --noEmit`: passou;
- `bun test`: passou com `14` testes totais no projeto, incluindo `5` testes de
  `fiscal-crypto`;
- `cargo test` no crate Rust de referência: passou com `46` testes.

## Limitação conhecida

O TypeScript usa `node-forge` para ler PKCS#12/PFX e extrair chave privada e
certificado em PEM. A diferença restante em relação ao Rust é a função
`ensureModernPfx`: no Rust ela reexporta PFX legado com OpenSSL/AES; no TS ela
valida o PFX e retorna os bytes originais, porque essa reexportação não existe
como API nativa no Node/Bun.
