import { build } from 'esbuild';
import { chmod, writeFile } from 'fs/promises';
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
  outfile: 'dist/bigocto-bundle.mjs',
  banner: {
    js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
  },
  external: [
    ...nodeExternals,
    'react-devtools-core',
    '@anthropic-ai/claude-agent-sdk',
  ],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  minify: false,
  sourcemap: false,
});

// Wrapper entry point: polyfill `self` before loading the bundle.
// ESM hoists imports above inline code, so the polyfill must be in a
// separate module that runs before the bundle's imports are resolved.
const wrapper = `#!/usr/bin/env node
globalThis.self ??= globalThis;
globalThis.window ??= globalThis;
await import('./bigocto-bundle.mjs');
`;

await writeFile('dist/bigocto.mjs', wrapper);
await chmod('dist/bigocto.mjs', 0o755);
console.log('Build complete: dist/bigocto.mjs');
