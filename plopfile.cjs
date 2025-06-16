/**
 * Root plopfile that automatically loads all plop plugins from the tools directory
 */
const fs = require("fs");
const path = require("path");

/**
 * @param {import('plop').NodePlopAPI} plop
 */
module.exports = function (plop) {
  // Get all directories in the tools directory that start with 'plop-'
  const toolsDir = path.join(__dirname, "tools");

  if (fs.existsSync(toolsDir)) {
    const plopPlugins = fs
      .readdirSync(toolsDir)
      .filter(
        (dir) =>
          dir.startsWith("plop-") &&
          fs.statSync(path.join(toolsDir, dir)).isDirectory()
      );

    // Load each plop plugin
    for (const plugin of plopPlugins) {
      const pluginPath = path.join(toolsDir, plugin, "index.cjs");
      if (fs.existsSync(pluginPath)) {
        try {
          console.log(`Loading plop plugin: ${plugin}`);
          plop.load(pluginPath);
        } catch (error) {
          console.error(`Error loading plop plugin ${plugin}:`, error);
        }
      }
    }
  }

  // You can add your own generators here if needed
};
