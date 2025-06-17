import * as fs from "fs";
import * as path from "path";
import modifyJson from "../../src/index";

describe("modify-json action type", () => {
  let plop: any;
  let actions: Record<string, Function>;

  beforeAll(() => {
    actions = {};
    plop = {
      setActionType: (name: string, fn: Function) => {
        actions[name] = fn;
      },
      getActionType: (name: string) => actions[name],
    };
    modifyJson(plop);
  });

  beforeEach(() => {
    // create a temp.json fixture before each test
    const filePath = path.join(__dirname, "temp.json");
    fs.writeFileSync(filePath, JSON.stringify({ version: "1.0.0" }), "utf8");
  });

  afterEach(() => {
    // clean up temp.json after each test
    const filePath = path.join(__dirname, "temp.json");
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });

  it("registers the modify-json action", () => {
    const action = plop.getActionType("modify-json");
    expect(typeof action).toBe("function");
  });

  it("throws an error when file does not exist", () => {
    const action = plop.getActionType("modify-json");
    expect(() => action({}, { path: "nonexistent.json", data: {} })).toThrow(
      /File not found/
    );
  });
  it("throws on conflicting primitive values", () => {
    const action = plop.getActionType("modify-json");
    expect(() =>
      action(
        {},
        { path: path.join(__dirname, "temp.json"), data: { version: "2.0.0" } }
      )
    ).toThrow(/Conflict modifying JSON key 'version'/);
  });
  it("throws on conflicting nested primitive values", () => {
    const action = plop.getActionType("modify-json");
    expect(() =>
      action(
        {},
        {
          path: path.join(__dirname, "temp.json"),
          data: { scripts: { hello: "say hi" } },
        }
      )
    ).toThrow(/Conflict modifying JSON key 'hello'/);
  });
  // Test for malformed JSON input
  it("throws an error on malformed JSON", () => {
    const action = plop.getActionType("modify-json");
    const filePath = path.join(__dirname, "temp.json");
    // Overwrite fixture with invalid JSON
    fs.writeFileSync(filePath, "{ invalid json }", "utf8");
    expect(() => action({}, { path: filePath, data: {} })).toThrow(
      /Error parsing JSON/
    );
  });
});
