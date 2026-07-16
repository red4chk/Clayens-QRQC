---
name: Angular Material 18 M2 theming
description: Legacy Material 2 theming API functions/variables moved under an `m2-` prefix in Angular Material 17/18; using the old names fails silently with a cryptic Sass error.
---

`@angular/material` v17+ forwards its M3 (new) theming APIs at the top level and re-exports the legacy M2 palette/theme functions under an `m2-` prefix via `@forward './core/m2' as m2-*` in `_index.scss`.

This means the commonly-documented pre-v15 API:
```scss
$theme: mat.define-dark-theme((
  color: (primary: mat.define-palette(mat.$green-palette, ...), ...),
));
```
fails to compile in Angular Material 18 with `Error: Undefined function.` pointing at `mat.define-palette(...)` — because `define-palette` and `$green-palette` no longer exist un-prefixed.

**Fix**: prefix every legacy M2 theming symbol with `m2-`:
```scss
$primary: mat.m2-define-palette(mat.$m2-green-palette, 500, 200, 800);
$warn: mat.m2-define-palette(mat.$m2-red-palette);
$typography: mat.m2-define-typography-config($font-family: '...');
$theme: mat.m2-define-dark-theme((
  color: (primary: $primary, accent: ..., warn: $warn),
  typography: $typography,
  density: 0,
));
@include mat.all-component-themes($theme); // this one stays un-prefixed
```
`mat.all-component-themes(...)` (and `mat.core()`) remain un-prefixed — only the theme/palette *definition* functions and the named palette variables (`$green-palette`, `$red-palette`, etc.) moved under `m2-`.
