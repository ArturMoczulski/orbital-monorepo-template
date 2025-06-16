module.exports = function (plop) {
  const path = require("path");
  const templateDir = __dirname;
  plop.setGenerator("plop-plugin-ts", {
    description: "Scaffold a new TypeScript-based Plop plugin",
    prompts: (inquirer, data = {}) => {
      if (data.name) {
        return [];
      }
      return [
        {
          type: "input",
          name: "name",
          message:
            "Enter plugin name (lowercase letters, numbers, dash/underscore):",
          validate: (value) =>
            /^[a-z0-9_-]+$/.test(value.trim()) ||
            "Plugin name must use only lowercase letters, numbers, hyphens or underscores",
        },
      ];
    },
    actions: [
      {
        type: "add",
        path: "tools/{{name}}/package.json",
        templateFile: path.join(templateDir, "package.json"),
        skipIfExists: true,
      },
      {
        type: "add",
        path: "tools/{{name}}/tsconfig.json",
        templateFile: path.join(templateDir, "tsconfig.json"),
        skipIfExists: true,
      },
      {
        type: "add",
        path: "tools/{{name}}/src/index.ts",
        templateFile: path.join(templateDir, "src", "index.ts"),
        skipIfExists: true,
      },
      {
        type: "add",
        path: "tools/{{name}}/index.cjs",
        templateFile: path.join(templateDir, "index.cjs"),
        skipIfExists: true,
      },
    ],
  });
};
