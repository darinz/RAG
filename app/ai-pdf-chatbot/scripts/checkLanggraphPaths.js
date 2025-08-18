// Import Node.js built-in modules for file system, path operations, and module URL resolution
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Function to check if a file exists at a given path
function fileExists(filePath) {
  // Synchronously checks for existence of the file
  return fs.existsSync(filePath);
}

// Function to determine if a specific object is exported from a given file
function isObjectExported(filePath, objectName) {
  try {
    // Read the content of the file as a UTF-8 string
    const fileContent = fs.readFileSync(filePath, "utf8");

    // Regular expression to match two types of exports:
    // 1. Named exports like: export const myObject = ...
    // 2. Grouped exports like: export { myObject }
    const exportRegex = new RegExp(
      `export\\s+(?:const|let|var)\\s+${objectName}\\s*=|export\\s+\\{[^}]*\\b${objectName}\\b[^}]*\\}`,
    );

    // Return true if the object name appears in any valid export statement
    return exportRegex.test(fileContent);
  } catch (error) {
    // Handle errors, such as file not found or read errors
    console.error(`Error reading file ${filePath}: ${error.message}`);
    return false;
  }
}

// Main function that checks the validity of paths and exports defined in langgraph.json
function checkLanggraphPaths() {
  // Get the absolute path of the current module file (ESM compatible)
  const __filename = fileURLToPath(import.meta.url);

  // Get the directory name of the current file
  const __dirname = path.dirname(__filename);

  // Construct path to langgraph.json, assumed to be one directory above current
  const langgraphPath = path.join(__dirname, "..", "langgraph.json");

  // Check if langgraph.json exists
  if (!fileExists(langgraphPath)) {
    console.error("langgraph.json not found in the root directory");
    process.exit(1); // Exit with error
  }

  try {
    // Read and parse langgraph.json content
    const langgraphContent = JSON.parse(fs.readFileSync(langgraphPath, "utf8"));

    // Access the "graphs" object from the parsed JSON
    const graphs = langgraphContent.graphs;

    // Validate that "graphs" is a valid object
    if (!graphs || typeof graphs !== "object") {
      console.error('Invalid or missing "graphs" object in langgraph.json');
      process.exit(1);
    }

    let hasError = false; // Track if any error is encountered

    // Iterate over each graph entry (key = graph name, value = "filePath:objectName")
    for (const [key, value] of Object.entries(graphs)) {
      // Split the value into file path and object name
      const [filePath, objectName] = value.split(":");

      // Resolve the full path to the target file
      const fullPath = path.join(__dirname, "..", filePath);

      // Check if the target file exists
      if (!fileExists(fullPath)) {
        console.error(`File not found: ${fullPath}`);
        hasError = true;
        continue; // Skip to next entry
      }

      // Check if the specified object is exported from the file
      if (!isObjectExported(fullPath, objectName)) {
        console.error(
          `Object "${objectName}" is not exported from ${fullPath}`,
        );
        hasError = true;
      }
    }

    // If any error occurred during the checks, exit with failure
    if (hasError) {
      process.exit(1);
    } else {
      // Otherwise, all validations passed
      console.log(
        "All paths in langgraph.json are valid and objects are exported correctly.",
      );
    }
  } catch (error) {
    // Handle JSON parsing errors or file reading errors
    console.error(`Error parsing langgraph.json: ${error.message}`);
    process.exit(1);
  }
}

// Invoke the main function to start the check
checkLanggraphPaths();