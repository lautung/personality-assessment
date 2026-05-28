import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const checkedExtensions = new Set([".css", ".html", ".ts", ".tsx", ".json", ".md", ".svg"]);
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
    if (entry.isFile() && checkedExtensions.has(extname(entry.name)) && !ignoredFiles.has(entry.name)) {
      yield filePath;
    }
  }
}

function checkFile(filePath) {
  const text = readFileSync(filePath, "utf8");
  const lines = text.split("\n");
  const problems = [];

  lines.forEach((line, index) => {
    const normalized = line.endsWith("\r") ? line.slice(0, -1) : line;
    if (/[ \t]+$/.test(normalized)) {
      problems.push(`line ${index + 1}: trailing whitespace`);
    }
  });

  if (text.length > 0 && !text.endsWith("\n")) {
    problems.push("missing final newline");
  }

  return problems;
}

const root = process.cwd();
const problems = [];

if (!statSync(root).isDirectory()) {
  throw new Error(`Invalid working directory: ${root}`);
}

for (const filePath of walk(root)) {
  const fileProblems = checkFile(filePath);
  for (const problem of fileProblems) {
    problems.push(`${relative(root, filePath)}: ${problem}`);
  }
}

if (problems.length > 0) {
  console.error("Source check failed:");
  problems.forEach((problem) => console.error(`- ${problem}`));
  process.exitCode = 1;
} else {
  console.log("Source check passed.");
}
