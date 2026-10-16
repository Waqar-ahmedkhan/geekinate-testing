import { copyFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

const OUT = 'out';
const PREFIX = '__next.';

const entriesOf = (dir) => readdirSync(dir, { withFileTypes: true });
const filesUnder = (dir) =>
  entriesOf(dir).flatMap((entry) => (entry.isDirectory() ? filesUnder(join(dir, entry.name)) : [join(dir, entry.name)]));
const segmentDirs = (dir) =>
  entriesOf(dir)
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => (entry.name.startsWith(PREFIX) ? [join(dir, entry.name)] : segmentDirs(join(dir, entry.name))));
const flatPath = (parent, file) => join(parent, relative(parent, file).split(sep).join('.'));

segmentDirs(OUT).forEach((segmentDir) => {
  const parent = dirname(segmentDir);
  filesUnder(segmentDir).forEach((file) => copyFileSync(file, flatPath(parent, file)));
});
