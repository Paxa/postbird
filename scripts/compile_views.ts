import fs from "fs";
import path from "path";
import pug from "pug";

function getJadeFiles(dir: string, baseDir: string = dir): { relativeName: string; fullPath: string }[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files: { relativeName: string; fullPath: string }[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(getJadeFiles(fullPath, baseDir));
    } else if (entry.isFile() && entry.name.endsWith(".jade")) {
      const rel = path.relative(baseDir, fullPath).replace(/\.jade$/, "");
      files.push({ relativeName: rel, fullPath });
    }
  }

  return files;
}

export function compileAllViews() {
  const viewsDir = path.resolve(__dirname, "..", "views");
  const cacheFile = path.join(viewsDir, "cache.js");
  const jadeFiles = getJadeFiles(viewsDir);

  const pugFn: Record<string, any> = {};
  const convertedPath = (process.cwd() + "/").replace(/\//g, "\\\\u002F");

  for (const file of jadeFiles) {
    const content = fs.readFileSync(file.fullPath, "utf-8");
    const compiled = pug.compile(content, {
      filename: file.fullPath,
      pretty: true,
      compileDebug: true,
    });

    pugFn[file.relativeName] = compiled;
    pugFn[file.relativeName].content = content;
  }

  let result = "";
  for (const key of Object.keys(pugFn).sort()) {
    const fn = pugFn[key];
    const fnStr = fn.toString().replace("locals", "pug, locals").replace(new RegExp(convertedPath, "g"), "");
    result += `exports["${key}"] = ${fnStr};\n`;
    result += `exports["${key}"].content = ${JSON.stringify(fn.content)};\n`;
  }

  fs.writeFileSync(cacheFile, result, "utf8");
  console.log(`[Compile Views] Successfully compiled ${jadeFiles.length} Jade templates into ${cacheFile}`);
}

if (import.meta.main) {
  compileAllViews();
}
