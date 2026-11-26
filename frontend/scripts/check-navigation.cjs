const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../lib/navigation.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const sandbox = { exports: {}, require };
vm.runInNewContext(compiled, sandbox);
const { moduleForPath, displayModule, storageModule, groupsFor, MODULES, destinations } = sandbox.exports;

for (const route of ['/dashboard', '/settings', '/users', '/system-status', '/reliability', '/maintenance']) {
  assert.equal(moduleForPath(route), 'PLANT', `${route} must not silently select FMIR`);
}
for (const route of ['/fmir', '/dsir', '/stand-area', '/running-stands', '/operations', '/inventory', '/asset-intelligence/dsir', '/asset-intelligence/fmir']) {
  assert.equal(moduleForPath(route), 'FMIR', `${route} must retain DSR context`);
}
for (const module of ['RMIR', 'MIR', 'DIR', 'SSIR']) {
  assert.equal(moduleForPath(`/${module.toLowerCase()}`), module);
  assert.equal(moduleForPath(`/asset-intelligence/${module.toLowerCase()}`), module);
  assert.equal(moduleForPath('/reliability', module), module);
  assert.equal(moduleForPath('/maintenance', module), module);
  assert.equal(moduleForPath(`/${module.toLowerCase()}-unknown`), 'PLANT');
}
assert.equal(moduleForPath('/reliability', 'FMIR'), 'FMIR');
assert.equal(moduleForPath('/reliability', 'DSIR'), 'FMIR');
assert.equal(moduleForPath('/reliability', 'ALL'), 'PLANT');
assert.equal(storageModule(displayModule('DSIR')), 'DSIR', 'FMIR must preserve historical DSIR identity');
const fmir = groupsFor('FMIR').flatMap(group => group.items);
for (const href of ['/stand-area', '/operations', '/entry-guides', '/inventory', '/activity', '/pm-schedule', '/reliability?module=DSIR']) {
  assert(fmir.some(item => item.href === href), `Missing original DSR workflow: ${href}`);
}
assert.equal(new Set(destinations.map(item => item.href)).size, destinations.length);
for (const module of MODULES) {
  for (const group of groupsFor(module.code)) {
    for (const item of group.items) {
      assert(destinations.some(destination => destination.href === item.href), `Search cannot reach ${item.href}`);
      const segments = item.href.split('?')[0].split('/').filter(Boolean);
      let directory = path.join(__dirname, '../app');
      for (const segment of segments) {
        const exact = path.join(directory, segment);
        if (fs.existsSync(exact)) directory = exact;
        else {
          const dynamic = fs.readdirSync(directory).find(name => /^\[.+\]$/.test(name));
          assert(dynamic, `Navigation points to missing route ${item.href}`);
          directory = path.join(directory, dynamic);
        }
      }
      assert(fs.existsSync(path.join(directory, 'page.tsx')), `Missing page: ${item.href}`);
    }
  }
}
console.log(`Navigation checks passed: ${MODULES.length} scopes, ${destinations.length} searchable destinations; FMIR preserves DSR workflows and storage identity.`);
