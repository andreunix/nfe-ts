/** Tipo que sabe construir seu fragmento XML fiscal. */
export interface TaxCalculation {
  /** Constrói o XML do imposto. */
  buildXml(): string;
}

/** Alias em snake_case para interop com nomenclatura Rust. */
export interface TaxCalculationSnake {
  /** Constrói o XML do imposto. */
  build_xml(): string;
}

/** Tipo que pode ser serializado para XML NF-e. */
export interface XmlSerializable {
  /** Serializa para XML. */
  toXml(): string;
}

/** Alias em snake_case para interop com nomenclatura Rust. */
export interface XmlSerializableSnake {
  /** Serializa para XML. */
  to_xml(): string;
}
