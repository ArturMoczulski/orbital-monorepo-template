import * as fs from "fs";
import * as path from "path";

function deepMerge(target: any, source: any): any {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      target[key] = deepMerge(target[key], source[key]);
    } else {
      if (
        target[key] !== undefined &&
        target[key] !== source[key] &&
        typeof target[key] !== "object" &&
        !Array.isArray(target[key])
      ) {
        throw new Error(
          `Conflict modifying JSON key '${key}': existing '${target[key]}' vs new '${source[key]}'`
        );
      }
      target[key] = source[key];
    }
  }
  return target;
}

export default function modifyJson(plop: any): void {
  plop.setActionType(
    "modify-json",
    (answers: any, config: { path: string; data: any }) => {
      let filePath: string;
      if (path.isAbsolute(config.path)) {
        filePath = config.path;
      } else {
        const pkgRoot = path.resolve(__dirname, "..");
        filePath = path.resolve(pkgRoot, config.path);
      }

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, "utf8");
      const json = JSON.parse(content);
      const merged = deepMerge(json, config.data);
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + "\n");
      return `Modified JSON at ${filePath}`;
    }
  );
}
