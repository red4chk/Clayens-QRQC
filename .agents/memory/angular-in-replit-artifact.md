---
name: Angular in a react-vite artifact shell
description: How to run a real Angular CLI 18 app under Replit's artifact/workflow system when a project requires Angular-only (no native Angular artifact type exists).
---

Replit's `createArtifact` only supports `expo`, `openscad`, `react-vite`, `slides`, `video-js` — no native Angular type. To satisfy a hard "Angular only" requirement:

1. Create a `react-vite` artifact purely to get a registered workflow, assigned `PORT`, and `BASE_PATH` env vars wired into `artifact.toml`.
2. Delete all React/Vite scaffold files and hand-author a real Angular CLI 18 project in the same directory (`angular.json`, `tsconfig*.json`, `src/`), keeping the `package.json` script names (`dev`, `build`, `typecheck`) so the already-registered workflow command (`pnpm --filter <pkg> run dev`) keeps working untouched.
3. Pin Angular's own toolchain versions locally in that package's `package.json` (Angular 18.2.x wants TypeScript ~5.4–5.5, not the repo-root 5.9) — pnpm workspaces let each package have independent versions.
4. `angular.json` build target: use the classic `@angular-devkit/build-angular:browser` + `:dev-server` builders (not the newer esbuild `application` builder) — `browser` outputs directly to `outputPath` (e.g. `dist/public`) with no nested `/browser` subfolder, matching the flat static-serve convention (`serve = "static"`, `publicDir = "dist/public"`) that `artifact.toml` expects.
5. Dev script: `ng serve --port $PORT --host 0.0.0.0 --disable-host-check` — do NOT pass `--base-href` to `ng serve` (build-time only flag, unknown argument error). Don't set `allowedHosts` in `angular.json`'s serve options as `true`; the classic dev-server schema requires an array. `--disable-host-check` is what actually lets the Replit proxy's rewritten Host header through.
6. Build script: `ng build --output-path dist/public --base-href $BASE_PATH --deploy-url $BASE_PATH`.
7. Add `"cli": { "analytics": false }` to `angular.json` — otherwise the first `ng build`/`ng serve` blocks forever on an interactive analytics-consent prompt in the non-interactive workflow shell.
8. Add `tslib` as a direct dependency — Angular's decorator output needs it; without it you get `TS2354: This syntax requires an imported helper but module 'tslib' cannot be found`.
9. For strictly-typed Reactive Forms, use `this.fb.nonNullable.group(...)` for required string fields — plain `fb.group({foo: ''})` infers `FormControl<string | null>`, which then fails to satisfy stricter domain types on `getRawValue()`.
