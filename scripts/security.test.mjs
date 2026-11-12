import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { findUnsafeFiles } from './check-artifact.mjs';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('build and Karma exclude JSON assets; Hosting independently excludes them', () => {
  const architects = JSON.parse(read('angular.json')).projects.skeleton.architect;
  for (const target of ['build', 'test']) {
    const assets = architects[target].options.assets;
    assert.equal(assets.includes('src/assets'), false);
    assert.ok(assets.some(asset => asset.input === 'src/assets' && asset.ignore.includes('**/*.json')));
  }
  assert.ok(JSON.parse(read('firebase.json')).hosting.ignore.includes('**/assets/**/*.json'));
});

test('local Firebase configuration targets a demo project and loopback API', () => {
  const local = read('src/environments/environment.development.ts');
  const architect = JSON.parse(read('angular.json')).projects.skeleton.architect;
  for (const replacements of [architect.build.configurations.development.fileReplacements, architect.test.options.fileReplacements]) {
    assert.ok(replacements.some(r => r.replace === 'src/environments/environment.ts' && r.with === 'src/environments/environment.development.ts'));
  }
  assert.ok(/production:\s*false/.test(local));
  assert.ok(/useEmulators:\s*true/.test(local));
  assert.ok(/projectId:\s*'demo-leds-local'/.test(local));
  assert.ok(/apiUrl:\s*'http:\/\/127\.0\.0\.1:5001\/demo-leds-local\//.test(local));
  assert.equal(local.includes('cloudfunctions.net'), false);
  const module = read('src/app/app.module.ts');
  assert.ok(module.includes("connectFirestoreEmulator(firestore, '127.0.0.1', 8080)"));
  assert.ok(module.includes("environment.useEmulators ? ['127.0.0.1', 9000]"));
});

test('preview build uses local environment and deployment workflows run security checks', () => {
  const preview = read('.github/workflows/firebase-hosting-pull-request.yml');
  assert.ok(preview.includes('npm run build -- --configuration development'));
  for (const name of ['pull-request', 'merge']) {
    assert.ok(read(`.github/workflows/firebase-hosting-${name}.yml`).includes('npm run test:security'));
  }
  const scripts = JSON.parse(read('package.json')).scripts;
  assert.equal(scripts.postbuild, 'npm run check:artifact');
  assert.equal(scripts['postbuild-prod'], 'npm run check:artifact');
});

test('artifact scanner permits visual assets and rejects nested synthetic backups and keys', t => {
  const root = mkdtempSync(join(tmpdir(), 'leds-security-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'assets', 'nested'), { recursive: true });
  writeFileSync(join(root, 'index.html'), '<p>Fictional fixture</p>');
  writeFileSync(join(root, 'assets', 'logo.svg'), '<svg/>');
  assert.equal(findUnsafeFiles(root).length, 0);
  writeFileSync(join(root, 'assets', 'nested', 'fixture.json'), '{"fictional":true}');
  writeFileSync(join(root, 'fake.key'), 'FICTIONAL TEST CONTENT');
  writeFileSync(join(root, '.env.local'), 'FICTIONAL=true');
  assert.equal(findUnsafeFiles(root).length, 3);
  symlinkSync(join(root, 'index.html'), join(root, 'link.html'));
  assert.equal(findUnsafeFiles(root).length, 4);
});

test('artifact scanner fails closed if build does not exist', () => {
  assert.throws(() => findUnsafeFiles('/nonexistent-leds-security-artifact'));
});
