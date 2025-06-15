const fs = require("fs");

module.exports = (plop) => {
  // Project template generators
  fs.readdirSync("./templates")
    .filter((dir) => fs.statSync(`./templates/${dir}`).isDirectory())
    .forEach((name) => {
      const tplPath = `./templates/${name}/plopfile`;
      if (fs.existsSync(`${tplPath}.cjs`)) {
        require(`${tplPath}.cjs`)(plop);
      }
    });
  // load plop-profile generator scaffold dynamically if present
  // (will be picked up by the templates loop if plopfile.js exists in that folder)

  // Profile generators
  if (fs.existsSync("./profiles")) {
    fs.readdirSync("./profiles")
      .filter((dir) => fs.statSync(`./profiles/${dir}`).isDirectory())
      .forEach((name) => {
        const profilePath = `./profiles/${name}/plopfile`;
        if (fs.existsSync(`${profilePath}.cjs`)) {
          require(`${profilePath}.cjs`)(plop);
        }
      });
  }
};
