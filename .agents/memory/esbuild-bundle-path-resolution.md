---
name: esbuild bundling breaks import.meta.dirname paths
description: Runtime file/data paths computed relative to import.meta.dirname (or __dirname) become wrong once esbuild bundles a multi-file src/ tree into one flat dist file.
---

If backend code resolves a data or asset path relative to its own module directory (e.g. `path.resolve(import.meta.dirname, "..", "..", "data")` from `src/lib/foo.ts`), that math assumes the file still lives at `src/lib/foo.ts` at runtime.

Once esbuild bundles everything (`src/index.ts` and all its imports) into a single flat `dist/index.mjs`, `import.meta.dirname` for the running code is just `dist/`, not `dist/lib/` or any nested path — every `..` segment written assuming source-tree depth now walks one level too far up, silently writing/reading files outside the package directory.

**Fix**: for paths that should be "relative to the package root at runtime" (e.g. a local JSON data store), resolve from `process.cwd()` instead, and make sure the process is actually launched with the package directory as cwd (true for `pnpm --filter <pkg> run <script>` and any script invoked via `pnpm --filter`).

**Why it's easy to miss**: the code works perfectly in dev if you run it directly via `tsx src/index.ts` (real nested paths), and only breaks after `esbuild` bundles it for the production/start path — so it can pass local dev testing and only surface after a build.
