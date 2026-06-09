import { ALL_PROVIDERS, SPEEDGOV, type ProviderMetadata } from "./providers.ts";

export function resolve(ibge: string): ProviderMetadata | undefined {
  return ALL_PROVIDERS.find((provider) => provider.municipios.includes(ibge));
}

export function isMunicipal(ibge: string): boolean {
  return resolve(ibge) !== undefined;
}

export const is_municipal = isMunicipal;

export function nationalLayoutEndpoint(ibge: string, producao: boolean): string | undefined {
  if (ibge !== "3547304") return undefined;
  return producao ? SPEEDGOV.endpoints.producao : SPEEDGOV.endpoints.homologacao;
}

export const national_layout_endpoint = nationalLayoutEndpoint;
