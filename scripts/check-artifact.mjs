import { readdirSync, lstatSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

// Inspect names only. Never read or print the contents of a rejected file.
export function findUnsafeFiles(root) {
  const unsafe = [];
  function visit(directory) {
    for (const entry of readdirSync(directory)) {
      const path = resolve(directory, entry);
      const stat = lstatSync(path);
      const parts = relative(root, path).split(sep);
      if (stat.isSymbolicLink()) {
        unsafe.push(path);
      } else if (stat.isDirectory()) {
        visit(path);
      } else if (
        (parts[0] === 'assets' && /\.json$/i.test(entry)) ||
        /\.(pem|key|p12|pfx)$/i.test(entry) ||
        /^\.env(?:\.|$)/i.test(entry) ||
        /(?:service[-_]?account|credentials|db-realtime).*\.json$/i.test(entry)
      ) {
        unsafe.push(path);
      }
    }
  }
  visit(resolve(root));
  return unsafe;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const unsafe = findUnsafeFiles(resolve('dist/los-encargos-de-salomon-79854'));
    if (unsafe.length) {
      console.error(`Artifact rejected: ${unsafe.length} forbidden file(s). Contents and paths omitted.`);
      process.exitCode = 1;
    }
  } catch {
    console.error('Artifact security check failed: build directory missing or unreadable.');
    process.exitCode = 1;
  }
}
