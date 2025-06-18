module.exports = function (plop) {
  const modifyJson = require(`../../tools/@orbital/plop-modify-json/index.cjs`);
  modifyJson(plop);
  plop.setGenerator("default", {
    prompts: [],
    actions: [
      {
        type: "modify-json",
        path: "package.json",
        data: { scripts: { hello: "echo hello" } },
      },
    ],
  });
};
