# Paridade fiscal-xsd Rust -> TypeScript

Este arquivo rastreia a porta de `tmp/fiscal-rs/crates/fiscal-xsd/src` para
`src/fiscal-xsd`.

## Módulos

| Rust | TypeScript | Estado | Observações |
| --- | --- | --- | --- |
| `lib.rs` | `schema.ts` | implemented | `XsdSchema`, materialização de schemas e validação XML. |
| `schemas.rs` | `schemas.ts` | verified | Bundles oficiais MDF-e, NF-e lote, CT-e, CT-e OS, GTV-e, BP-e, DPS, evento NFS-e, ABRASF e São Paulo. |
| `schemas/*` | `schemas/*` | verified | XSDs vendorizados ficam em `schemas/` no projeto TypeScript. |
| `lib.rs` exports | `index.ts` | verified | Exporta `XsdSchema`, `schemas`, `xsdSchemas` e aliases prefixados para evitar colisões no barrel raiz. |

## Evidência

Última verificação: 2026-06-08.

- `tests/fiscal-xsd/xsd.test.ts` cobre schema inline, erros e carregamento dos
  bundles vendorizados;
- `tests/fiscal-parity/xsd-gates.test.ts` valida documentos assinados gerados
  pelos builders TypeScript contra os XSDs oficiais;
- `bunx tsc --noEmit`: passou;
- `bun test`: passou.

## Diferenças conhecidas

- Rust embute os XSDs no binário e compila/cacheia `libxml2` por thread.
- TypeScript usa o executável `xmllint` via subprocesso e lê os XSDs do diretório
  `schemas/`.
- Essa diferença mantém paridade funcional de validação, mas não paridade de
  performance, empacotamento ou independência do ambiente. Para distribuição,
  garanta que `schemas/` acompanhe o pacote e que `xmllint` esteja instalado.
