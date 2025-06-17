// @ts-nocheck
import { describe, test, expect } from "@jest/globals";
import fs from "fs";
import path from "path";
import os from "os";

import { listTemplates } from "./helpers.js";

describe("listTemplates helper", () => {
  it("returns only directory names under templates folder", () => {
    // Create a temporary project root
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "orb-manage-"));
    const templatesDir = path.join(tmpRoot, "templates");
    fs.mkdirSync(templatesDir);

    // Create directories and a file
    fs.mkdirSync(path.join(templatesDir, "foo"));
    fs.mkdirSync(path.join(templatesDir, "bar"));
    fs.writeFileSync(path.join(templatesDir, "README.md"), "hello");

    // Call helper
    const templates = listTemplates(tmpRoot);

    // Only the two directories should be returned
    expect(templates.sort()).toEqual(["bar", "foo"]);

    // Cleanup
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });

  it("returns empty array when templates folder does not exist", () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "orb-manage-"));
    const result = listTemplates(tmpRoot);
    expect(result).toEqual([]);
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  });
});
