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

describe("orb CLI profile apply command", () => {
  beforeAll(() => {
    setupTmpRepo();
  });

  afterAll(() => {
    cleanupTmpRepo();
  });

  test("profile apply creates marker file", () => {
    // First create a test profile
    execSync(`${cli} ${orbScript} profile create testprofile`, {
      cwd: tmpRepo,
    });

    // Create a test project
    execSync(`mkdir -p ${tmpRepo}/libs/test-lib`, {
      cwd: tmpRepo,
    });

    // Create a package.json for the test project
    const pkgJson = {
      name: "test-lib",
      version: "1.0.0",
    };
    fs.writeFileSync(
      path.join(tmpRepo, "libs", "test-lib", "package.json"),
      JSON.stringify(pkgJson, null, 2)
    );

    // Create a profiles directory for the profile
    execSync(`mkdir -p ${tmpRepo}/profiles/testprofile`, {
      cwd: tmpRepo,
    });

    // Create a templates directory for the profile
    execSync(`mkdir -p ${tmpRepo}/templates/testprofile`, {
      cwd: tmpRepo,
    });

    // Create a plopfile that creates a marker file
    const plopfileContent = `
module.exports = function (plop) {
  plop.setGenerator('default', {
    description: 'Create a marker file',
    prompts: [],
    actions: [
      {
        type: 'add',
        path: 'profile-marker.txt',
        template: 'This file was created by the testprofile'
      }
    ]
  });
};
`;
    fs.writeFileSync(
      path.join(tmpRepo, "templates", "testprofile", "plopfile.cjs"),
      plopfileContent
    );

    // Add the profile to the project
    execSync(`${cli} ${orbScript} profile add test-lib testprofile`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });

    // Check if orb.json was updated
    const orbConfigPath = path.join(tmpRepo, "orb.json");
    expect(fs.existsSync(orbConfigPath)).toBe(true);

    const orbConfig = JSON.parse(fs.readFileSync(orbConfigPath, "utf8"));
    expect(orbConfig.profiles).toBeDefined();
    expect(orbConfig.profiles["test-lib"]).toContain("testprofile");

    // Verify marker file doesn't exist yet
    const markerFilePath = path.join(
      tmpRepo,
      "libs",
      "test-lib",
      "profile-marker.txt"
    );
    expect(fs.existsSync(markerFilePath)).toBe(false);

    // Apply the profile
    execSync(`${cli} ${orbScript} profile apply test-lib`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });

    // Verify marker file was created
    expect(fs.existsSync(markerFilePath)).toBe(true);

    // Check the content of the marker file
    const markerContent = fs.readFileSync(markerFilePath, "utf8");
    expect(markerContent).toContain("This file was created by the testprofile");
  });
  test("profile apply adds script to package.json idempotently", () => {
    // First create a test profile
    execSync(`${cli} ${orbScript} profile create json-profile`, {
      cwd: tmpRepo,
    });

    // Create a test project
    execSync(`mkdir -p ${tmpRepo}/libs/json-test-lib`, {
      cwd: tmpRepo,
    });

    // Create a package.json for the test project with scripts section
    const pkgJson = {
      name: "json-test-lib",
      version: "1.0.0",
      scripts: {
        test: 'echo "Error: no test specified" && exit 1',
      },
    };
    fs.writeFileSync(
      path.join(tmpRepo, "libs", "json-test-lib", "package.json"),
      JSON.stringify(pkgJson, null, 2)
    );

    // Create a templates directory for the profile
    execSync(`mkdir -p ${tmpRepo}/templates/json-profile`, {
      cwd: tmpRepo,
    });

    // Create a plopfile that adds a script to package.json using append
    const plopfileContent = `
module.exports = function (plop) {
  plop.setGenerator('default', {
    description: 'Add a script to package.json',
    prompts: [],
    actions: [
      {
        type: 'modify',
        path: 'package.json',
        pattern: /"scripts": {/,
        template: '"scripts": {\\n    "profile-script": "echo \\\\"This script was added by json-profile\\\\"",',
      }
    ]
  });
};
`;
    fs.writeFileSync(
      path.join(tmpRepo, "templates", "json-profile", "plopfile.cjs"),
      plopfileContent
    );

    // Add the profile to the project
    execSync(`${cli} ${orbScript} profile add json-test-lib json-profile`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });

    // Check if orb.json was updated
    const orbConfigPath = path.join(tmpRepo, "orb.json");
    expect(fs.existsSync(orbConfigPath)).toBe(true);

    const orbConfig = JSON.parse(fs.readFileSync(orbConfigPath, "utf8"));
    expect(orbConfig.profiles).toBeDefined();
    expect(orbConfig.profiles["json-test-lib"]).toContain("json-profile");

    // Apply the profile
    execSync(`${cli} ${orbScript} profile apply json-test-lib`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });

    // Verify script was added to package.json
    const pkgJsonPath = path.join(
      tmpRepo,
      "libs",
      "json-test-lib",
      "package.json"
    );
    const updatedPkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

    expect(updatedPkg.scripts).toBeDefined();
    expect(updatedPkg.scripts["profile-script"]).toBe(
      'echo "This script was added by json-profile"'
    );
    expect(Object.keys(updatedPkg.scripts).length).toBe(2); // Original test script + new script

    // Apply the profile again to test idempotency
    execSync(`${cli} ${orbScript} profile apply json-test-lib`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });

    // Verify script is still there and not duplicated
    const reappliedPkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

    expect(reappliedPkg.scripts).toBeDefined();
    expect(reappliedPkg.scripts["profile-script"]).toBe(
      'echo "This script was added by json-profile"'
    );
    expect(Object.keys(reappliedPkg.scripts).length).toBe(2); // Still just 2 scripts, no duplication
  });

  test("profile apply uses custom JSON modification", () => {
    // Create tools directory
    execSync(`mkdir -p ${tmpRepo}/tools/plop-modify-json`, {
      cwd: tmpRepo,
    });

    // Create a simple plop plugin directly
    const pluginContent = `
/**
 * Plop plugin for modifying JSON files
 */
module.exports = function (plop) {
  // Add custom action to modify JSON files
  plop.setActionType('modifyJson', function (answers, config) {
    const fs = require('fs');
    const path = require('path');
    
    // Read the JSON file
    const filePath = path.resolve(process.cwd(), config.path);
    let fileContent;
    
    try {
      fileContent = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      throw new Error(\`Error reading file \${config.path}: \${err.message}\`);
    }
    
    // Parse the JSON
    let jsonData;
    try {
      jsonData = JSON.parse(fileContent);
    } catch (err) {
      throw new Error(\`Error parsing JSON in \${config.path}: \${err.message}\`);
    }
    
    // Ensure the section exists
    if (!jsonData[config.section]) {
      jsonData[config.section] = {};
    }
    
    // Add or update the key-value pairs
    Object.assign(jsonData[config.section], config.data);
    
    // Write the file back
    try {
      fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
      return \`Modified \${config.path}: Added/updated \${Object.keys(config.data).join(', ')} in \${config.section}\`;
    } catch (err) {
      throw new Error(\`Error writing to \${config.path}: \${err.message}\`);
    }
  });
};
`;
    fs.writeFileSync(
      path.join(tmpRepo, "tools", "plop-modify-json", "index.cjs"),
      pluginContent
    );

    // Create package.json for the plugin
    const pluginPkgJson = {
      name: "@orbital/plop-modify-json",
      version: "1.0.0",
      main: "index.cjs",
      type: "commonjs",
    };
    fs.writeFileSync(
      path.join(tmpRepo, "tools", "plop-modify-json", "package.json"),
      JSON.stringify(pluginPkgJson, null, 2)
    );

    // Create root plopfile.cjs to load plugins
    const rootPlopfile = `
/**
 * Root plopfile that automatically loads all plop plugins from the tools directory
 */
const fs = require('fs');
const path = require('path');

/**
 * @param {import('plop').NodePlopAPI} plop
 */
module.exports = function (plop) {
  // Get all directories in the tools directory that start with 'plop-'
  const toolsDir = path.join(__dirname, 'tools');
  
  if (fs.existsSync(toolsDir)) {
    const plopPlugins = fs.readdirSync(toolsDir)
      .filter(dir => dir.startsWith('plop-') && fs.statSync(path.join(toolsDir, dir)).isDirectory());
    
    // Load each plop plugin
    for (const plugin of plopPlugins) {
      const pluginPath = path.join(toolsDir, plugin, 'index.cjs');
      if (fs.existsSync(pluginPath)) {
        try {
          console.log(\`Loading plop plugin: \${plugin}\`);
          plop.load(pluginPath);
        } catch (error) {
          console.error(\`Error loading plop plugin \${plugin}:\`, error);
        }
      }
    }
  }
};
`;
    fs.writeFileSync(path.join(tmpRepo, "plopfile.cjs"), rootPlopfile);

    // Create a test profile
    execSync(`${cli} ${orbScript} profile create plugin-test-profile`, {
      cwd: tmpRepo,
    });

    // Create a test project
    execSync(`mkdir -p ${tmpRepo}/libs/plugin-test-lib`, {
      cwd: tmpRepo,
    });

    // Create a package.json for the test project with scripts section
    const pkgJson = {
      name: "plugin-test-lib",
      version: "1.0.0",
      scripts: {
        test: 'echo "Error: no test specified" && exit 1',
      },
    };
    fs.writeFileSync(
      path.join(tmpRepo, "libs", "plugin-test-lib", "package.json"),
      JSON.stringify(pkgJson, null, 2)
    );

    // Create a templates directory for the profile
    execSync(`mkdir -p ${tmpRepo}/templates/plugin-test-profile`, {
      cwd: tmpRepo,
    });

    // Create a plopfile that adds a script to package.json using modify
    const plopfileContent = `
module.exports = function (plop) {
  plop.setGenerator('default', {
    description: 'Add a script to package.json',
    prompts: [],
    actions: [
      {
        type: 'modify',
        path: 'package.json',
        pattern: /"scripts": {/,
        template: '"scripts": {\\n    "plugin-script": "echo \\\\"This script was added by plugin-test-profile\\\\"",',
      }
    ]
  });
};
`;
    fs.writeFileSync(
      path.join(tmpRepo, "templates", "plugin-test-profile", "plopfile.cjs"),
      plopfileContent
    );

    // Add the profile to the project
    execSync(
      `${cli} ${orbScript} profile add plugin-test-lib plugin-test-profile`,
      {
        cwd: tmpRepo,
        encoding: "utf8",
      }
    );

    // Check if orb.json was updated
    const orbConfigPath = path.join(tmpRepo, "orb.json");
    expect(fs.existsSync(orbConfigPath)).toBe(true);

    const orbConfig = JSON.parse(fs.readFileSync(orbConfigPath, "utf8"));
    expect(orbConfig.profiles).toBeDefined();
    expect(orbConfig.profiles["plugin-test-lib"]).toContain(
      "plugin-test-profile"
    );

    // Apply the profile
    execSync(`${cli} ${orbScript} profile apply plugin-test-lib`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });

    // Verify script was added to package.json
    const pkgJsonPath = path.join(
      tmpRepo,
      "libs",
      "plugin-test-lib",
      "package.json"
    );
    const updatedPkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

    expect(updatedPkg.scripts).toBeDefined();
    expect(updatedPkg.scripts["plugin-script"]).toBe(
      'echo "This script was added by plugin-test-profile"'
    );
    expect(Object.keys(updatedPkg.scripts).length).toBe(2); // Original test script + new script

    // Apply the profile again to test idempotency
    execSync(`${cli} ${orbScript} profile apply plugin-test-lib`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });

    // Verify script is still there and not duplicated
    const reappliedPkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

    expect(reappliedPkg.scripts).toBeDefined();
    expect(reappliedPkg.scripts["plugin-script"]).toBe(
      'echo "This script was added by plugin-test-profile"'
    );
    expect(Object.keys(reappliedPkg.scripts).length).toBe(2); // Still just 2 scripts, no duplication
  });
});
