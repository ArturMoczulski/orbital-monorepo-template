import * as fs from "fs";
import * as path from "path";

/**
 * List only directory names under the root templates folder.
 * @param projectRoot The root of the project containing the templates directory.
 */
export function listTemplates(projectRoot: string): string[] {
  const templatesPath = path.join(projectRoot, "templates");
  if (!fs.existsSync(templatesPath)) {
    return [];
  }
  return fs
    .readdirSync(templatesPath)
    .filter((dir) => fs.statSync(path.join(templatesPath, dir)).isDirectory());
}
