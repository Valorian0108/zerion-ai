import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BIN = join(__dirname, "../cli/zerion-cli.js");

describe("zerion-cli", () => {
  it("prints help", async () => {
    const output = await new Promise((resolve, reject) => {
      execFile("node", [BIN, "--help"], (error, stdout) => {
        if (error) return reject(error);
        resolve(stdout);
      });
    });

    assert.match(output, /wallet analyze/);
    assert.match(output, /chains list/);
  });

  it("fails clearly when API key is missing", async () => {
    const { code, stderr } = await new Promise((resolve) => {
      execFile(
        "node",
        [BIN, "chains", "list"],
        { env: { ...process.env, ZERION_API_KEY: "" } },
        (error, _stdout, stderr) => {
          resolve({ code: error?.code ?? 0, stderr });
        }
      );
    });

    assert.equal(code, 1);
    assert.match(stderr, /missing_api_key/);
  });
});
