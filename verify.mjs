import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const png = await readFile(new URL('./entry.png', import.meta.url));
assert.ok(png.length <= 1048576, 'Image must fit 1 MiB');
assert.deepEqual(png.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
const crc32 = data => {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
};
let offset = 8, width, height, channels, ended = false;
const payload = [], chunks = [];
while (offset < png.length) {
  assert.ok(offset + 12 <= png.length, 'Complete PNG chunk envelope');
  const size = png.readUInt32BE(offset);
  const type = png.toString('ascii', offset + 4, offset + 8);
  const end = offset + 12 + size;
  assert.ok(end <= png.length, 'Complete PNG chunk data');
  assert.equal(crc32(png.subarray(offset + 4, end - 4)), png.readUInt32BE(end - 4), `${type} checksum`);
  const data = png.subarray(offset + 8, end - 4);
  if (type === 'IHDR') {
    assert.equal(offset, 8);
    assert.equal(size, 13);
    width = data.readUInt32BE(0); height = data.readUInt32BE(4);
    assert.ok(width > 0 && width <= 1024 && height > 0 && height <= 1024);
    assert.equal(data[8], 8, 'Expected 8-bit renderer output');
    channels = ({ 2: 3, 6: 4 })[data[9]];
    assert.ok(channels, 'RGB or RGBA image');
    assert.deepEqual([...data.subarray(10)], [0, 0, 0]);
  } else if (type === 'IDAT') payload.push(data);
  else if (type === 'IEND') {
    assert.equal(size, 0);
    assert.equal(end, png.length, 'No trailing bytes');
    ended = true;
  }
  chunks.push(type); offset = end;
}
assert.ok(ended && payload.length > 0, 'Complete image through IEND');
const pixels = inflateSync(Buffer.concat(payload));
const stride = width * channels + 1;
assert.equal(pixels.length, stride * height, 'All rows decode');
for (let row = 0; row < height; row++) assert.ok(pixels[row * stride] <= 4, 'Valid PNG row filter');
const temporary = await mkdtemp(join(tmpdir(), 'world-ledger-'));
try {
  for (const run of ['first', 'second']) {
    const output = join(temporary, run);
    execFileSync(process.execPath, [fileURLToPath(new URL('./main.ts', import.meta.url))], {
      cwd: temporary, env: { ...process.env, MAKEFUN_OUTPUT_DIR: output }, timeout: 10000,
    });
    assert.deepEqual(await readFile(join(output, 'entry.png')), png, `Offline run ${run} reproduces committed bytes from another cwd`);
  }
} finally { await rm(temporary, { recursive: true, force: true }); }
console.log(JSON.stringify({ valid: true, width, height, bytes: png.length, sha256: createHash('sha256').update(png).digest('hex'), chunks, decodedRows: height, identicalRuns: 2 }, null, 2));
