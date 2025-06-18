const fs = require("fs");
const path = require("path");
const os = require("os");

// Import the functions we want to test
const modifyEnv = require("../../index.cjs");

// Create mock functions to access the internal functions
const mockPlop = {
  setActionType: jest.fn((name, fn) => {
    // Store the function for testing
    mockPlop.actionFn = fn;
  }),
  actionFn: null,
};

// Initialize the plugin with our mock plop
modifyEnv(mockPlop);

describe("plop-modify-env", () => {
  let tempDir;
  let destPath;
  let srcPath;

  beforeEach(() => {
    // Create a temporary directory for our test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "plop-modify-env-test-"));
    destPath = path.join(tempDir, "dest.env");
    srcPath = path.join(tempDir, "src.env");
  });

  afterEach(() => {
    // Clean up the temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("should merge env files without conflicts", () => {
    // Create test files
    fs.writeFileSync(destPath, "EXISTING_VAR=value1\nCOMMON_VAR=same_value\n");
    fs.writeFileSync(srcPath, "NEW_VAR=value2\nCOMMON_VAR=same_value\n");

    // Call the action function
    const result = mockPlop.actionFn(
      {},
      {
        path: destPath,
        sourcePath: srcPath,
      }
    );

    // Check the result
    expect(result).toContain(`Modified ENV file at ${destPath}`);

    // Read the merged file
    const mergedContent = fs.readFileSync(destPath, "utf8");

    // Verify the content
    expect(mergedContent).toContain("EXISTING_VAR=value1");
    expect(mergedContent).toContain("NEW_VAR=value2");
    expect(mergedContent).toContain("COMMON_VAR=same_value");
  });

  it("should handle empty files", () => {
    // Create test files
    fs.writeFileSync(destPath, "");
    fs.writeFileSync(srcPath, "NEW_VAR=value\n");

    // Call the action function
    const result = mockPlop.actionFn(
      {},
      {
        path: destPath,
        sourcePath: srcPath,
      }
    );

    // Check the result
    expect(result).toContain(`Modified ENV file at ${destPath}`);

    // Read the merged file
    const mergedContent = fs.readFileSync(destPath, "utf8");

    // Verify the content
    expect(mergedContent).toContain("NEW_VAR=value");
  });

  it("should handle comments and empty lines", () => {
    // Create test files
    fs.writeFileSync(destPath, "# This is a comment\nEXISTING_VAR=value1\n\n");
    fs.writeFileSync(srcPath, "# Another comment\nNEW_VAR=value2\n");

    // Call the action function
    const result = mockPlop.actionFn(
      {},
      {
        path: destPath,
        sourcePath: srcPath,
      }
    );

    // Check the result
    expect(result).toContain(`Modified ENV file at ${destPath}`);

    // Read the merged file
    const mergedContent = fs.readFileSync(destPath, "utf8");

    // Verify the content
    expect(mergedContent).toContain("EXISTING_VAR=value1");
    expect(mergedContent).toContain("NEW_VAR=value2");
    // Comments are not preserved in the current implementation
  });

  it("should throw an error on conflicts", () => {
    // Create test files with conflicting values
    fs.writeFileSync(destPath, "CONFLICT_VAR=value1\n");
    fs.writeFileSync(srcPath, "CONFLICT_VAR=value2\n");

    // Expect an error when calling the action function
    expect(() => {
      mockPlop.actionFn(
        {},
        {
          path: destPath,
          sourcePath: srcPath,
        }
      );
    }).toThrow(/Conflict modifying ENV key 'CONFLICT_VAR'/);
  });

  it("should handle quoted values", () => {
    // Create test files with quoted values
    fs.writeFileSync(destPath, 'EXISTING_VAR="value with spaces"\n');
    fs.writeFileSync(srcPath, 'NEW_VAR="another value with spaces"\n');

    // Call the action function
    const result = mockPlop.actionFn(
      {},
      {
        path: destPath,
        sourcePath: srcPath,
      }
    );

    // Check the result
    expect(result).toContain(`Modified ENV file at ${destPath}`);

    // Read the merged file
    const mergedContent = fs.readFileSync(destPath, "utf8");

    // Verify the content
    expect(mergedContent).toContain('EXISTING_VAR="value with spaces"');
    expect(mergedContent).toContain('NEW_VAR="another value with spaces"');
  });
});
