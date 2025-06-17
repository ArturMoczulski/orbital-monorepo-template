module.exports = function (plop) {
  const path = require("path");
  const pluginPath = path.resolve(
    __dirname,
    "../../tools/@orbital/plop-modify-json/index.cjs"
  );
  const fs = require("fs");
  console.log(
    "DEBUG pluginPath:",
    pluginPath,
    "exists:",
    fs.existsSync(pluginPath)
  );
  // Register modify-json action by loading plugin path
  require(pluginPath)(plop);
  plop.setGenerator("profile", {
    description: "Add hello script to package.json",
    prompts: [],
    actions: [
      {
        type: "modify-json",
        path: "package.json",
        data: {
          scripts: {
            hello: "echo hello",
          },
        },
      },
    ],
  });
};
