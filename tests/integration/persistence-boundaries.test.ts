import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

async function findTypeScriptFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return findTypeScriptFiles(fullPath);
      }
      return entry.isFile() && entry.name.endsWith(".ts") ? [fullPath] : [];
    }),
  );

  return files.flat();
}

test("HTTP controllers and application use cases do not import Knex or SQLite", async () => {
  const files = [
    ...(await findTypeScriptFiles("src/adapters/http")),
    ...(await findTypeScriptFiles("src/application")),
  ];
  const forbiddenImport = /from\s+["'][^"']*(?:knex|sqlite3|better-sqlite3|persistence|database)[^"']*["']/;
  const violations: string[] = [];

  for (const file of files) {
    const normalized = file.replace(/\\/g, "/");
    const content = await readFile(file, "utf8");
    if (forbiddenImport.test(content)) {
      violations.push(normalized);
    }
  }

  assert.deepEqual(violations, []);
});
