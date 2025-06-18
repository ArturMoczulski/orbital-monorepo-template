module.exports = function (plop) {
  plop.setGenerator("nestjs", {
    description: "Scaffold a new NestJS service",
    prompts: (inquirer, data = {}) => {
      if (data.name) {
        return [];
      }
      return [
        {
          type: "input",
          name: "name",
          message: "Enter service name:",
        },
      ];
    },
    actions: [
      {
        type: "addMany",
        destination: "services/{{name}}",
        templateFiles: [
          // Scaffold core files
          ".prettierrc",
          "eslint.config.mjs",
          "nest-cli.json",
          "package.json",
          "README.md",
          "tsconfig.build.json",
          "tsconfig.json",
          // Source code
          "src/**/*",
          // Tests
          "test/**/*",
        ],
        base: "templates/nestjs",
        skipInterpolation: ["**/*.js"],
        skipIfExists: true,
      },
      {
        type: "modify",
        path: "services/{{name}}/package.json",
        pattern: /"name":\s*".*"/,
        template: '"name": "@orbital/{{name}}",',
      },
    ],
  });
};