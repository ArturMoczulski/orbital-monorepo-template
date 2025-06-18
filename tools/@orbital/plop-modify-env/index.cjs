#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

/**
 * Merge source env variables into target env variables
 * @param {Object} target The target env variables
 * @param {Object} source The source env variables to merge
 * @returns {Object} The merged env variables
 * @throws {Error} if there's a conflict between source and target
 */
function mergeEnvVars(target, source) {
  const result = { ...target };

  for (const [key, value] of Object.entries(source)) {
    // If the key exists in the target and has a different value, throw an error
    if (key in target && target[key] !== value) {
      throw new Error(
        `Conflict modifying ENV key '${key}': existing '${target[key]}' vs new '${value}'`
      );
    }

    // Otherwise, add or update the key
    result[key] = value;
  }

  return result;
}

/**
 * Convert env variables object back to .env file format
 * @param {Object} envVars The env variables object
 * @returns {string} The .env file content
 */
function formatEnvFile(envVars) {
  return (
    Object.entries(envVars)
      .map(([key, value]) => {
        // If the value contains spaces or special characters, quote it
        const formattedValue = /[\s"'`$&|<>^;()\\]/.test(value)
          ? `"${value}"`
          : value;
        return `${key}=${formattedValue}`;
      })
      .join("\n") + "\n"
  );
}

/**
 * Plop plugin to modify .env files
 * @param {Object} plop The plop object
 */
function modifyEnv(plop) {
  plop.setActionType("modify-env", (answers, config) => {
    let destPath;
    let srcPath;

    // Resolve destination path
    if (path.isAbsolute(config.path)) {
      destPath = config.path;
    } else {
      destPath = path.resolve(process.cwd(), config.path);
    }

    // Resolve source path
    if (path.isAbsolute(config.sourcePath)) {
      srcPath = config.sourcePath;
    } else {
      srcPath = path.resolve(process.cwd(), config.sourcePath);
    }

    // Check if files exist
    if (!fs.existsSync(destPath)) {
      throw new Error(`Destination file not found: ${destPath}`);
    }

    if (!fs.existsSync(srcPath)) {
      throw new Error(`Source file not found: ${srcPath}`);
    }

    // Read and parse files using dotenv
    const destContent = fs.readFileSync(destPath, "utf8");
    const srcContent = fs.readFileSync(srcPath, "utf8");

    // Parse the env files using dotenv
    const destEnvVars = dotenv.parse(destContent);
    const srcEnvVars = dotenv.parse(srcContent);

    try {
      // Merge env vars
      const mergedEnvVars = mergeEnvVars(destEnvVars, srcEnvVars);

      // Format and write back to destination
      const mergedContent = formatEnvFile(mergedEnvVars);
      fs.writeFileSync(destPath, mergedContent);

      return `Modified ENV file at ${destPath}`;
    } catch (err) {
      throw new Error(`Error merging ENV files: ${err.message}`);
    }
  });
}

module.exports = modifyEnv;
