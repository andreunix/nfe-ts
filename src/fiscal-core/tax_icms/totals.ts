/** Totais acumulados de ICMS e grupos relacionados. */
export interface TaxTotals {
  /** Campos numéricos acumulados e flags booleanas por nome fiscal. */
  [key: string]: number | boolean | undefined;
}

/** Cria a estrutura zerada de totais ICMS. */
export function createIcmsTotals(): TaxTotals {
  return {
    v_bc: 0,
    v_icms: 0,
    v_icms_deson: 0,
    v_bc_st: 0,
    v_st: 0,
    v_fcp: 0,
    v_fcp_st: 0,
    v_fcp_st_ret: 0,
    v_fcp_uf_dest: 0,
    v_icms_uf_dest: 0,
    v_icms_uf_remet: 0,
    v_icms_mono: 0,
    v_icms_mono_reten: 0,
    v_icms_mono_ret: 0,
    ind_deduz_deson: false,
  };
}

/** Alias de compatibilidade para criar totais ICMS. */
export const IcmsTotals = createIcmsTotals;

/** Mescla totais ICMS de origem em um acumulador de destino. */
export function mergeIcmsTotals(target: TaxTotals, source: TaxTotals): TaxTotals {
  for (const [key, value] of Object.entries(source)) {
    if (typeof value === "number") target[key] = Number(target[key] ?? 0) + value;
    if (typeof value === "boolean") target[key] = Boolean(target[key]) || value;
  }
  return target;
}
