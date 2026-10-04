import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { root } from './helpers.mjs';

const fixtures = {
  'zz-draft-fixture': 'draft: true\ndate: 2020-01-01T00:00:00.000Z',
  'zz-future-fixture': 'draft: false\ndate: 2999-01-01T00:00:00.000Z',
};

function files(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && !entry.parentPath.includes('pagefind'))
    .map((entry) => join(entry.parentPath, entry.name));
}

test('drafts and future posts are left out of a production build', () => {
  const outDir = mkdtempSync(join(tmpdir(), 'drafts-'));
  const paths = Object.entries(fixtures).map(([slug, meta]) => {
    const path = join(root, 'src/content/posts', `${slug}.md`);
    writeFileSync(path, `---\ntitle: ${slug}\ndescription: Fixture\n${meta}\ntags:\n  - fixture-tag\n---\nBody.\n`);
    return path;
  });

  try {
    execFileSync('npx', ['astro', 'build', '--outDir', outDir], { cwd: root, stdio: 'pipe' });
    const leaks = files(outDir).filter((file) => /zz-(draft|future)-fixture|fixture-tag/.test(readFileSync(file, 'utf-8')));
    assert.deepEqual(leaks, []);
  } finally {
    paths.forEach((path) => rmSync(path));
    rmSync(outDir, { recursive: true, force: true });
  }
});
