module.exports = function (plop) {
  plop.setGenerator("profile", {
    description: "Scaffold a new Plop-based profile",
    prompts: (inquirer, data = {}) => {
      if (data.name) {
        return [];
      }
      return [
        {
          type: "input",
          name: "name",
          message:
            "Enter a valid profile name (lowercase letters, numbers, dash/underscore):",
          validate: (value) =>
            /^[a-z0-9_-]+$/.test(value.trim()) ||
            "Profile name must use only lowercase letters, numbers, hyphens or underscores",
        },
      ];
    },
    actions: [
      {
        type: "add",
        path: "profiles/{{name}}/.gitkeep",
        templateFile: "templates/plop-profile/profile/.gitkeep",
        skipIfExists: true,
      },
      {
        type: "add",
        path: "profiles/{{name}}/plopfile.cjs",
        templateFile: "templates/plop-profile/plopfile.cjs",
        skipIfExists: true,
      },
    ],
  });
};
