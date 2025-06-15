module.exports = function (plop) {
  plop.setGenerator("nestjs", {
    description: "Scaffold a new NestJS service project",
    prompts: (inquirer, data = {}) => {
      if (data.name) {
        return [];
      }
      return [
        {
          type: "input",
          name: "name",
          message: "Enter project name:",
        },
      ];
    },
    actions: [
      {
        type: "addMany",
        destination: "services/{{name}}",
        templateFiles: [
          "templates/nestjs/**/*",
          "!templates/nestjs/plopfile.cjs",
          "!templates/nestjs/plopfile.js",
        ],
        base: "templates/nestjs",
        skipInterpolation: ["**/*"],
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
