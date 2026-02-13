import { build } from 'esbuild';
import { chmod } from 'fs/promises';
import { builtinModules } from 'module';

// Mark all node built-ins as external (both 'fs' and 'node:fs' forms)
const nodeExternals = [
  ...builtinModules,
  ...builtinModules.map(m => `node:${m}`),
];

await build({
  entryPoints: ['src/cli.tsx'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist/bigocto.mjs',
  banner: {
    js: '#!/usr/bin/env node\nimport { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
  external: nodeExternals,
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  minify: false,
  sourcemap: false,
});

await chmod('dist/bigocto.mjs', 0o755);
console.log('Build complete: dist/bigocto.mjs');
