const { readFileSync, mkdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

// The judge runs this file offline. The committed raster is the entire entry.
const image = readFileSync(join(__dirname, 'entry.png'));
if (image.length > 1_048_576 || image.readUInt32BE(0) !== 0x89504e47) {
  throw new Error('The committed newspaper must be a PNG of at most 1 MiB.');
}
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(output, { recursive: true });
writeFileSync(join(output, 'entry.png'), image);
