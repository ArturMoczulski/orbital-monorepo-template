import * as fs from "fs";
import * as path from "path";

function deepMerge(target: any, source: any): any {
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (srcVal && typeof srcVal === "object" && !Array.isArray(srcVal)) {
      if (tgtVal && typeof tgtVal === "object" && !Array.isArray(tgtVal)) {
        target[key] = deepMerge(tgtVal, srcVal);
      } else {
        // conflict with nested primitive values
        const nestedKey = Object.keys(srcVal)[0];
        const nestedVal = srcVal[nestedKey];
        throw new Error(
          `Conflict modifying JSON key '${nestedKey}': existing '${tgtVal}' vs new '${nestedVal}'`
        );
      }
    } else {
      if (
        tgtVal !== undefined &&
        tgtVal !== srcVal &&
        typeof tgtVal !== "object" &&
        !Array.isArray(tgtVal)
      ) {
        throw new Error(
          `Conflict modifying JSON key '${key}': existing '${tgtVal}' vs new '${srcVal}'`
        );
      }
      target[key] = srcVal;
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
        filePath = path.resolve(process.cwd(), config.path);
      }

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const content = fs.readFileSync(filePath, "utf8");
      let json: any;
      try {
        json = JSON.parse(content);
      } catch (err: any) {
        throw new Error(`Error parsing JSON: ${err.message}`);
      }
      const merged = deepMerge(json, config.data);
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + "\n");
      return `Modified JSON at ${filePath}`;
    }
  );
}
