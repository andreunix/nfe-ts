import type { ParsedInvoice, TxtEntity } from "./types.ts";
import { parseEntities } from "./helpers.ts";

/** Parser simples de TXT SEFAZ que acumula entidades em memória. */
export class NFeParser {
  /** Versão do layout. */
  readonly version: string;
  /** Layout normalizado. */
  readonly layout: string;
  /** Entidades parseadas. */
  entities: TxtEntity[] = [];
  /** ID da infNFe quando informado na entidade A. */
  infNfeId = "";

  constructor(version = "4.00", layout = "LOCAL_V12") {
    this.version = version;
    this.layout = layout.toUpperCase();
  }

  /** Parseia linhas de uma única nota. */
  parse(lines: string[]): ParsedInvoice {
    this.entities = parseEntities(lines);
    const header = this.entities.find((entity) => entity.ref === "A");
    this.infNfeId = header?.fields[1] ?? "";
    const items = this.entities
      .filter((entity) => entity.ref === "I")
      .map((entity, index) => ({
        item_number: Number(entity.fields[0] || index + 1),
        prod: {
          cProd: entity.fields[1] ?? "",
          cEAN: entity.fields[2] ?? "SEM GTIN",
          xProd: entity.fields[3] ?? "",
          NCM: entity.fields[4] ?? "",
          CFOP: entity.fields[5] ?? "",
          uCom: entity.fields[6] ?? "UN",
          qCom: entity.fields[7] ?? "1.0000",
          vUnCom: entity.fields[8] ?? "0.0000000000",
          vProd: entity.fields[9] ?? "0.00",
          cEANTrib: entity.fields[10] ?? "SEM GTIN",
          uTrib: entity.fields[11] ?? entity.fields[6] ?? "UN",
          qTrib: entity.fields[12] ?? entity.fields[7] ?? "1.0000",
          vUnTrib: entity.fields[13] ?? entity.fields[8] ?? "0.0000000000",
          indTot: entity.fields[14] ?? "1",
        },
        taxes: [],
      }));
    return { version: this.version, entities: this.entities, header, items };
  }
}
