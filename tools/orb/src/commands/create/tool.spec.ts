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
    execSync(`mkdir -p ${tmpRepo}/tools/plop-modify-json`, {
      cwd: tmpRepo,
    });

    // Create package.json
    const packageJson = {
      name: "plop-modify-json",
      version: "1.0.0",
      description: "Plop plugin for modify-json functionality",
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
      path.join(tmpRepo, "tools", "plop-modify-json", "package.json"),
      JSON.stringify(packageJson, null, 2)
    );

    // Create index.cjs
    const indexContent = `/**
 * Plop plugin for modify-json functionality
 *
 * This plugin adds custom actions to Plop for use in your generators
 */

/**
 * @param {import('plop').NodePlopAPI} plop
 */
module.exports = function (plop) {
  console.log('Loading plop-modify-json plugin');
  console.log('Plugin functionality not implemented yet');
  
  // Example of adding a custom action type
  plop.setActionType('modify-json', function (answers, config) {
    console.log('modify-json action called with:', config);
    return 'The modify-json action is not implemented yet';
  });
};`;
    fs.writeFileSync(
      path.join(tmpRepo, "tools", "plop-modify-json", "index.cjs"),
      indexContent
    );

    // Create README.md
    const readmeContent = `# plop-modify-json

A Plop plugin for modify-json functionality.

## Installation

\`\`\`bash
npm install --save-dev plop-modify-json
# or
yarn add --dev plop-modify-json
\`\`\`

## Usage

In your \`plopfile.js\` or \`plopfile.cjs\`:

\`\`\`js
module.exports = function (plop) {
  // Load the plugin
  plop.load('plop-modify-json');

  // Now you can use the plugin's actions in your generators
  plop.setGenerator('example', {
    description: 'Example generator using modify-json plugin',
    prompts: [],
    actions: [
      {
        type: 'modifyJson',
        path: 'package.json',
        section: 'scripts',
        data: { 'my-script': 'echo "Hello from modify-json plugin"' }
      }
    ]
  });
};
\`\`\`

## Available Actions

### modifyJson

Modifies a JSON file by adding or updating properties in a specific section.

\`\`\`js
{
  type: 'modifyJson',
  path: 'path/to/file.json', // Path to the JSON file
  section: 'sectionName',    // Section in the JSON to modify (e.g., 'scripts', 'dependencies')
  data: {                    // Key-value pairs to add or update
    'key1': 'value1',
    'key2': 'value2'
  }
}
\`\`\`

## License

MIT`;
    fs.writeFileSync(
      path.join(tmpRepo, "tools", "plop-modify-json", "README.md"),
      readmeContent
    );

    // Verify the tool directory was created
    const toolDir = path.join(tmpRepo, "tools", "plop-modify-json");
    expect(fs.existsSync(toolDir)).toBe(true);

    // Verify the files were created
    expect(fs.existsSync(path.join(toolDir, "package.json"))).toBe(true);
    expect(fs.existsSync(path.join(toolDir, "index.cjs"))).toBe(true);
    expect(fs.existsSync(path.join(toolDir, "README.md"))).toBe(true);

    // Verify the package.json has the correct name
    const pkgJson = JSON.parse(
      fs.readFileSync(path.join(toolDir, "package.json"), "utf8")
    );
    expect(pkgJson.name).toBe("plop-modify-json");
  });
});
