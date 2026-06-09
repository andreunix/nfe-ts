# Paridade fiscal-core Rust -> TypeScript

Este arquivo rastreia a porta de `tmp/fiscal-rs/crates/fiscal-core/src` para
`src/fiscal-core`.

Estados:

- `missing`: ainda não existe equivalente TypeScript.
- `partial`: existe, mas não cobre toda a API/comportamento Rust.
- `implemented`: API pública principal existe e comportamento central foi portado.
- `verified`: implementado e coberto por testes/smoke tests.

## Módulos raiz

| Rust | TypeScript | Estado | Observações |
| --- | --- | --- | --- |
| `config.rs` | `config.ts` | implemented | Validação JSON e proxy portados; falta teste amplo. |
| `constants.rs` | `constants.ts` | implemented | Inclui SOAP/WSDL/payment types e aliases Rust. |
| `error.rs` | `error.ts` | partial | Existe `FiscalError`, mas variantes ainda são strings. |
| `format_utils.rs` | `format_utils.ts` | implemented | Inclui aliases camelCase e snake_case. |
| `gtin.rs` | `gtin.ts` | implemented | Inclui validação e aliases snake_case. |
| `qrcode.rs` | `qrcode.ts` | partial | URL v1/v2 existe, mas precisa validar paridade exata. |
| `sanitize.rs` | `sanitize.ts` | implemented | Inclui `sanitize_xml_text` e alias `sanitize_to_ascii`. |
| `standardize.rs` | `standardize.ts` | partial | Identificação e conversão XML básica implementadas; parser é leve. |
| `state_codes.rs` | `state_codes.ts` | implemented | Inclui aliases snake_case. |
| `status_codes.rs` | `status_codes.ts` | partial | Códigos principais existem; falta validar catálogo completo contra Rust. |
| `tax_element.rs` | `tax_element.ts` | implemented | `TaxField`, `TaxElement` e helpers equivalentes adicionados. |
| `timezone.rs` | `timezone.ts` | implemented | Inclui alias snake_case. |
| `traits.rs` | `traits.ts` | implemented | Interfaces TS equivalentes adicionadas. |
| `sealed.rs` | `sealed.ts` | implemented | Símbolo/marcador interno adicionado. |
| `xml_utils.rs` | `xml_utils.ts` | implemented | Validação, limpeza e aliases Rust adicionados. |

## Submódulos

| Rust | TypeScript | Estado | Observações |
| --- | --- | --- | --- |
| `newtypes/*` | `newtypes/*` | partial | Estrutura espelhada; validação ainda não é 100% equivalente. |
| `types/*` | `types/*` | partial | Estrutura espelhada por arquivo; parte dos contratos segue aberta para compatibilidade. |
| `tax_icms/*` | `tax_icms/*` | partial | Estrutura espelhada; CST/CSOSN completos ainda não foram modelados campo a campo. |
| `tax_ibs_cbs/*` | `tax_ibs_cbs/*` | partial | Estrutura espelhada; grupos ad valorem/mono/special ainda genéricos. |
| `tax_pis_cofins_ipi.rs` | `tax_pis_cofins_ipi.ts` | partial | Builders e classes principais existem; falta paridade campo a campo. |
| `tax_issqn.rs` | `tax_issqn.ts` | partial | Builder e totais existem; falta paridade campo a campo. |
| `tax_is.rs` | `tax_is.ts` | partial | Builder e classe principal existem; falta paridade campo a campo. |
| `xml_builder/*` | `xml_builder/*` | partial | Estrutura existe; geração XML cobre fluxo central, mas ainda é simplificada. |
| `convert/*` | `convert/*` | partial | Estrutura existe; parser TXT e layouts ainda simplificados. |
| `complement/*` | `complement/*` | partial | Estrutura espelhada; helpers XML avançados ainda delegam ao módulo agregado. |
| `contingency/*` | `contingency/*` | partial | Estado existe; ajuste de chave/XML ainda simplificado. |

## Plano restante de implementação

1. Modelar `types/*` campo a campo a partir dos structs Rust, trocando registros
   abertos por interfaces explícitas onde o contrato já estiver estável.
2. Completar `tax_icms/*` com todos os CST/CSOSN, validações e geração XML por
   variante, mantendo os arquivos `cst`, `csosn`, `cst_xml`, `builders`, `data`
   e `totals`.
3. Completar `tax_ibs_cbs/*` com os grupos ad valorem, monofásico, especial e
   totais, incluindo testes de itens e totais.
4. Fortalecer `xml_builder/*` para gerar todos os blocos opcionais do Rust,
   preservando a divisão `ide`, `emit`, `dest`, `det`, `pag`, `total`,
   `transp`, `optional` e `access_key`.
5. Fortalecer `convert/*` para cobrir todos os layouts TXT esperados pelo Rust,
   com erros específicos e testes por estrutura.
6. Completar `complement/*` e `contingency/*` com manipulação XML equivalente,
   incluindo protocolo, evento, cancelamento, inutilização e ajustes de emissão.
7. Auditar `status_codes`, `qrcode`, `standardize`, `error` e `newtypes` contra
   o Rust para fechar diferenças de catálogo, validação e mensagens.

## Auditoria de compatibilidade

Última verificação: 2026-06-08.

Resultado estrutural:

- arquivos públicos Rust sem arquivo TypeScript equivalente: `0`;
- símbolos públicos de módulo Rust sem export TypeScript equivalente no mesmo
  caminho conceitual: `0` de `234`;
- `bunx tsc --noEmit`: passou;
- `bun test`: passou com `9` testes;
- `cargo test` no crate Rust de referência: passou com `619` unit tests e `24`
  doctests executados com sucesso (`2` doctests ignorados).

Resultado funcional/API fluente:

- métodos públicos em blocos `impl` Rust encontrados: `545`;
- métodos sem equivalente direto em classe TypeScript no mesmo módulo: `445`.

Conclusão: a porta TypeScript está compatível em estrutura de módulos e
exportações públicas de alto nível, mas ainda não está compatível com a API
fluente completa dos structs Rust nem com a cobertura comportamental do crate
original. As maiores diferenças estão em `types/*`, `tax_icms/*`,
`tax_ibs_cbs/*`, `xml_builder/*`, `complement/*`, `contingency/*` e nos testes
de XML.

## Critério de conclusão

O módulo só deve ser considerado completo quando:

1. todos os símbolos públicos relevantes do Rust tiverem equivalente TypeScript;
2. o comportamento principal estiver portado ou houver justificativa explícita;
3. comentários públicos estiverem em português;
4. `bunx tsc --noEmit` passar;
5. smoke tests ou testes Bun cobrirem o comportamento crítico.
