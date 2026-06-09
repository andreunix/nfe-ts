import type { Ambiente, CancelInput, EmitInput, EmitOutput } from "./model.ts";
import { MunError } from "./error.ts";

export interface ProviderCtx {
  ambiente: Ambiente;
  pfx_der?: Uint8Array;
  senha?: string;
  versao?: number;
  inscricao_municipal?: string;
  cnpj?: string;
}

export interface MunicipalProvider {
  nome(): string;
  municipios(): readonly string[];
  emitir(input: EmitInput, ctx: ProviderCtx): Promise<EmitOutput>;
  consultar?(numeroNfse: string, ctx: ProviderCtx): Promise<EmitOutput>;
  cancelar?(input: CancelInput, ctx: ProviderCtx): Promise<EmitOutput>;
}

export function naoImplementado(operation: string): never {
  throw MunError.naoImplementado(operation);
}
