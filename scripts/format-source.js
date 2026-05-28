import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative } from "node:path";

const formattedExtensions = new Set([".css", ".html", ".ts", ".tsx", ".json", ".md", ".svg"]);
const ignoredDirectories = new Set([".git", ".next", ".vercel", "dist", "node_modules", "out"]);
const ignoredFiles = new Set(["package-lock.json"]);

function* walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        yield* walk(join(directory, entry.name));
      }
      continue;
    }

    const filePath = join(directory, entry.name);
    if (entry.isFile() && formattedExtensions.has(extname(entry.name)) && !ignoredFiles.has(entry.name)) {
      yield filePath;
    }
  }
}

function formatText(text) {
  const normalized = text.replace(/\r\n/g, "\n");
  const trimmed = normalized
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/u, ""))
    .join("\n");

  return trimmed.length > 0 && !trimmed.endsWith("\n") ? `${trimmed}\n` : trimmed;
}

const root = process.cwd();
const changedFiles = [];

if (!statSync(root).isDirectory()) {
  throw new Error(`Invalid working directory: ${root}`);
}

for (const filePath of walk(root)) {
  const original = readFileSync(filePath, "utf8");
  const formatted = formatText(original);
  if (formatted !== original) {
    writeFileSync(filePath, formatted, "utf8");
    changedFiles.push(relative(root, filePath));
  }
}

if (changedFiles.length > 0) {
  console.log("Formatted files:");
  changedFiles.forEach((file) => console.log(`- ${file}`));
} else {
  console.log("No formatting changes needed.");
}
