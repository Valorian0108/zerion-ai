import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const toolsDir = join(__dirname, "../mcp/tools");

describe("tool catalog", () => {
  it("documents concrete wallet capabilities", () => {
    const files = readdirSync(toolsDir).filter((file) => file.endsWith(".json"));
    assert.ok(files.length >= 5);

    for (const file of files) {
      const data = JSON.parse(readFileSync(join(toolsDir, file), "utf8"));
      assert.equal(typeof data.name, "string");
      assert.equal(typeof data.method, "string");
      assert.equal(typeof data.path, "string");
      assert.equal(typeof data.source, "string");
    }
  });
});
