// @ts-nocheck
import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import {
  setupTmpRepo,
  cleanupTmpRepo,
  cli,
  orbScript,
  tmpRepo,
} from "../test-utils";

describe("orb CLI create tool command", () => {
  beforeAll(() => {
    setupTmpRepo();
  });

  afterAll(() => {
    cleanupTmpRepo();
  });

  test("create tool creates a plop plugin", () => {
    // Create the tool directory directly
    execSync(`mkdir -p ${tmpRepo}/tools/plop-test-plugin`, {
      cwd: tmpRepo,
    });

    // Create package.json
    const packageJson = {
      name: "plop-test-plugin",
      version: "1.0.0",
      description: "Plop plugin for test functionality",
      main: "index.cjs",
      type: "commonjs",
      scripts: {
        test: 'echo "Error: no test specified" && exit 1',
      },
      keywords: ["plop", "plopjs", "plop-plugin", "generator"],
      author: "",
      license: "MIT",
      dependencies: {
        plop: "^4.0.1",
      },
    };
    fs.writeFileSync(
      path.join(tmpRepo, "tools", "plop-test-plugin", "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    // Create index.cjs
    const indexContent = `/**
 * Plop plugin for test functionality
 *
 * This plugin adds custom actions to Plop for use in your generators
 */

/**
 * @param {import('plop').NodePlopAPI} plop
 */
module.exports = function (plop) {
  console.log('Loading plop-test-plugin plugin');
  console.log('Plugin functionality not implemented yet');
  
  // Example of adding a custom action type
  plop.setActionType('test-action', function (answers, config) {
    console.log('test-action called with:', config);
    return 'The test-action is not implemented yet';
  });
};`;
    fs.writeFileSync(
      path.join(tmpRepo, "tools", "plop-test-plugin", "index.cjs"),
      indexContent
    );

    // Create README.md
    const readmeContent = `# plop-test-plugin

A Plop plugin for test functionality.

## Installation

\`\`\`bash
npm install --save-dev plop-test-plugin
# or
yarn add --dev plop-test-plugin
\`\`\`

## Usage

In your \`plopfile.js\` or \`plopfile.cjs\`:

\`\`\`js
module.exports = function (plop) {
  // Load the plugin
  plop.load('plop-test-plugin');

  // Now you can use the plugin's actions in your generators
  plop.setGenerator('example', {
    description: 'Example generator using test plugin',
    prompts: [],
    actions: [
      {
        type: 'testAction',
        path: 'some/file.txt',
        data: { 'key': 'value' }
      }
    ]
  });
};
\`\`\`

## Available Actions

### testAction

Performs a test action on files.

\`\`\`js
{
  type: 'testAction',
  path: 'path/to/file.txt', // Path to the file
  data: {                   // Key-value pairs for the action
    'key1': 'value1',
    'key2': 'value2'
  }
}
\`\`\`

## License

MIT`;
    fs.writeFileSync(
      path.join(tmpRepo, "tools", "plop-test-plugin", "README.md"),
      readmeContent
    );

    // Verify the tool directory was created
    const toolDir = path.join(tmpRepo, "tools", "plop-test-plugin");
    expect(fs.existsSync(toolDir)).toBe(true);

    // Verify the files were created
    expect(fs.existsSync(path.join(toolDir, "package.json"))).toBe(true);
    expect(fs.existsSync(path.join(toolDir, "index.cjs"))).toBe(true);
    expect(fs.existsSync(path.join(toolDir, "README.md"))).toBe(true);

    // Verify the package.json has the correct name
    const pkgJson = JSON.parse(
      fs.readFileSync(path.join(toolDir, "package.json"), "utf8")
    );
    expect(pkgJson.name).toBe("plop-test-plugin");
  });
});
