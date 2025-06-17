module.exports = function (plop) {
  const path = require("path");
  const templateDir = __dirname;

  // Get the parsed name components from environment variables
  // This is used when the name contains special characters like slashes
  const getParsedName = () => {
    return {
      name: process.env.PARSED_NAME || "",
      scope: process.env.PARSED_SCOPE || "",
    };
  };

  plop.setGenerator("plop-plugin-ts", {
    description: "Scaffold a new TypeScript-based Plop plugin",
    prompts: (inquirer, data = {}) => {
      // If name is provided via CLI args, skip prompts
      if (data.name) {
        return [];
      }
      return [
        {
          type: "input",
          name: "name",
          message:
            "Enter plugin name (lowercase letters, numbers, dash/underscore, optional scope like @scope/):",
          validate: (value) => {
            const nameRegex = /^[a-z0-9_-]+$/;
            const scopedNameRegex = /^@[a-z0-9_-]+\/[a-z0-9_-]+$/;
            return (
              nameRegex.test(value.trim()) ||
              scopedNameRegex.test(value.trim()) ||
              "Plugin name must use only lowercase letters, numbers, hyphens or underscores, optionally with a scope like @scope/name"
            );
          },
        },
      ];
    },
    actions: function (data) {
      const { name: parsedName, scope: parsedScope } = getParsedName();

      // When called from orb create, all files have already been copied
      // This plopfile is only needed for direct plop usage
      if (process.env.PARSED_NAME) {
        console.log("Files already copied by orb create command");
        return [];
      }

      // Only used when running plop directly
      const baseDir = parsedScope
        ? path.join(parsedScope, parsedName)
        : parsedName;

      return [
        {
          type: "add",
          path: `tools/${baseDir}/package.json`,
          templateFile: path.join(templateDir, "package.json"),
        },
        {
          type: "add",
          path: `tools/${baseDir}/tsconfig.json`,
          templateFile: path.join(templateDir, "tsconfig.json"),
        },
        {
          type: "add",
          path: `tools/${baseDir}/src/index.ts`,
          templateFile: path.join(templateDir, "src", "index.ts"),
        },
        {
          type: "add",
          path: `tools/${baseDir}/index.cjs`,
          templateFile: path.join(templateDir, "index.cjs"),
        },
      ];
    },
  });
};
