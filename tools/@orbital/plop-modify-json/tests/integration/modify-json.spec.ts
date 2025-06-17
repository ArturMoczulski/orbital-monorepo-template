import fs from "fs";
import path from "path";
import os from "os";
import modifyJson from "../../src/index";

describe("modify-json action integration", () => {
  let action: Function;
  let tempDir: string;

  beforeAll(() => {
    const actions: Record<string, Function> = {};
    const plop = {
      setActionType: (name: string, fn: Function) => {
        actions[name] = fn;
      },
      getActionType: (name: string) => actions[name],
    };
    modifyJson(plop);
    action = plop.getActionType("modify-json");
  });

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "modify-json-test-"));
    const initial = { a: 1, nested: { b: 2 } };
    fs.writeFileSync(
      path.join(tempDir, "data.json"),
      JSON.stringify(initial, null, 2)
    );
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("deep merges provided data into existing JSON file", () => {
    const filePath = path.join(tempDir, "data.json");
    action({}, { path: filePath, data: { nested: { c: 3 }, d: 4 } });
    const result = JSON.parse(fs.readFileSync(filePath, "utf8"));
    expect(result).toEqual({ a: 1, nested: { b: 2, c: 3 }, d: 4 });
  });
});
