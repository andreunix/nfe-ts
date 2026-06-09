import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { FiscalError } from "../fiscal-core/error.ts";

export interface XsdFile {
  name: string;
  content: string | Uint8Array;
}

const moduleDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolvePath(moduleDir, "../..");
export const vendoredSchemaRoot = join(projectRoot, "schemas");

const materialized = new Map<string, string>();

export class XsdSchema {
  readonly id: string;
  readonly root: string;
  readonly files: readonly XsdFile[];
  readonly baseDir?: string;

  constructor(id: string, files: readonly XsdFile[], root: string, baseDir?: string) {
    this.id = id;
    this.files = files;
    this.root = root;
    this.baseDir = baseDir;
  }

  static fromDirectory(id: string, directory: string, root: string, files: readonly string[]): XsdSchema {
    return new XsdSchema(id, files.map((name) => ({ name, content: new Uint8Array() })), root, directory);
  }

  validate(xml: string): string[] {
    const schemaPath = this.rootPath();
    const xmlDir = mkdtempSync(join(tmpdir(), `fiscal-xsd-xml-${this.id}-`));
    const xmlPath = join(xmlDir, "input.xml");
    writeFileSync(xmlPath, xml);

    try {
      execFileSync("xmllint", ["--noout", "--schema", schemaPath, xmlPath], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
      return [];
    } catch (error) {
      if (isMissingXmllint(error)) {
        throw FiscalError.xml("XSD validation requires xmllint, but it was not found in PATH.");
      }
      return parseXmllintErrors(error);
    } finally {
      rmSync(xmlDir, { recursive: true, force: true });
    }
  }

  validateOrThrow(xml: string): void {
    const errors = this.validate(xml);
    if (errors.length > 0) throw FiscalError.xml(`XSD validation failed: ${errors.join("; ")}`);
  }

  validate_or_throw(xml: string): void {
    this.validateOrThrow(xml);
  }

  private rootPath(): string {
    if (this.baseDir) {
      const root = join(this.baseDir, this.root);
      if (!existsSync(root)) throw FiscalError.xml(`XSD root file not found: ${root}`);
      return root;
    }

    let dir = materialized.get(this.id);
    if (!dir) {
      dir = mkdtempSync(join(tmpdir(), `fiscal-xsd-${this.id}-`));
      for (const file of this.files) {
        const path = join(dir, file.name);
        mkdirSync(dirname(path), { recursive: true });
        writeFileSync(path, file.content);
      }
      materialized.set(this.id, dir);
    }
    return join(dir, this.root);
  }
}

export const XsdSchemaClass = XsdSchema;

function isMissingXmllint(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "ENOENT";
}

function parseXmllintErrors(error: unknown): string[] {
  if (typeof error === "object" && error !== null) {
    const stderr = (error as { stderr?: Buffer | string }).stderr;
    const text = Buffer.isBuffer(stderr) ? stderr.toString("utf8") : String(stderr ?? "");
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.endsWith("fails to validate"));
    return lines.length > 0 ? lines : ["documento nao satisfaz o schema XSD"];
  }
  return [String(error)];
}
