import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const partsDir = path.join(root, 'scripts', 'payload');
const parts = fs.readdirSync(partsDir)
  .filter((name) => /^part-\d+\.txt$/.test(name))
  .sort();

const encoded = parts
  .map((name) => fs.readFileSync(path.join(partsDir, name), 'utf8').trim())
  .join('');

const files = JSON.parse(
  zlib.gunzipSync(Buffer.from(encoded, 'base64')).toString('utf8'),
);

for (const [relativePath, content] of Object.entries(files)) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

console.log(`Materialized ${Object.keys(files).length} guided V2 files.`);
