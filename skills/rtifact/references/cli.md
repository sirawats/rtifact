# Rtifact CLI and artifact output modes

## Invocation

Use the latest published CLI through `npx` by default:

```sh
npx rtifact@latest Report.jsx
```

Use an installed `rtifact` executable only when the user explicitly asks for
it. Entries may be `.jsx` or `.tsx`; both are supported identically.

## Output modes

### Compact CDN-backed HTML: default

```sh
npx rtifact@latest Report.jsx
# ./Report.html

npx rtifact@latest Report.jsx --output deliverables/index.html
```

The finished artifact is one HTML file containing a base64-encoded gzip application
payload. A browser with `DecompressionStream("gzip")` and import-map support
restores it, including through `file://`; no neighboring local assets or server
are required. React and Ant Design runtime modules load from exact-version
esm.sh URLs, so the default requires network access.

Direct file output also embeds the exact original entry source in an inert
`template#rtifact-source` before the payload. This is the preferred representation
for an AI agent inspecting or revising a received artifact; do not decode
`rtifact-payload`. The source block is intentionally readable and may expose
comments, dead code, or unused strings, so never put secrets in shareable source.
Use `--no-readable-source` to omit both readable templates when source disclosure
is not wanted. The compiled application remains in the compressed payload.

Extract it with `xmllint` when available:

```sh
xmllint --html --xpath 'string(//template[@id="rtifact-source"])' artifact.html 2>/dev/null
```

For a byte-exact fallback that preserves line endings, use Python’s standard
library:

```sh
python3 -c 'import html,re,sys; text=open(sys.argv[1], encoding="utf-8", newline="").read(); match=re.search(r"<template\b[^>]*\bid=\"rtifact-source\"[^>]*>(.*?)</template>", text, re.S); sys.stdout.write(html.unescape(match.group(1)))' artifact.html
```

This metadata is present for default and `--self-contained` direct builds only;
directory output and `pack` do not have an original direct entry to expose.

Choose this mode for the smallest shareable reports, guides, demos,
comparisons, and small tools.

### Self-contained HTML

```sh
npx rtifact@latest Report.jsx --self-contained
npx rtifact@latest Report.jsx --self-contained --output deliverables/index.html
```

Choose this mode when the artifact must start offline. It embeds the supplied
runtime and is therefore substantially larger.

### Deployable directory

```sh
npx rtifact@latest Report.jsx --out-dir dist
npx rtifact@latest Report.jsx --out-dir public/app --base /application/
```

Choose directory mode for conventional static hosting, strict Content Security
Policy, or application graphs the single-file packer cannot normalize.

### Pack an existing build

```sh
npx rtifact@latest pack dist --output Report.html
```

Packing reads a compatible directory build without modifying it and produces a
self-contained artifact.

## Themes and theme modules

```sh
npx rtifact@latest themes
npx rtifact@latest prism-themes
npx rtifact@latest theme-inspect rtifact
npx rtifact@latest --theme-inspect ./company-theme.jsx
npx rtifact@latest Report.jsx --theme material
npx rtifact@latest Report.jsx --theme material-dark
npx rtifact@latest Report.jsx --theme ./company-theme.jsx
```

Unsuffixed family aliases resolve to fixed light presets; dark mode is selected
only by naming a dark preset. `prism-themes` lists syntax themes discovered from
the installed PrismJS and Prism Themes packages. Every selected Rtifact theme
supplies a matching Prism default; `RTIFACT.prismTheme` remains an explicit
per-entry override. Run `npx rtifact@latest theme-inspect <name>` or
`npx rtifact@latest --theme-inspect <name>` to print the `.jsx` source code of
any preset theme or custom theme module for inspection.

`--theme` also accepts a readable local `.ts` or `.jsx` module resolved from the
invocation directory. Its default export is the complete declarative theme
manifest and may include an optional `css` string. Rtifact emits that CSS after
theme variables in `@layer components` in every JSX output mode; no stylesheet
import is needed. Applications import named exports, including reusable
components, normally; Rtifact does not inject them. Theme modules are trusted
local code compiled and executed before output is created. Malformed embedded
CSS fails the build before publication. Theme modules apply to JSX builds, not
discovery or `pack` commands, and do not appear in
`npx rtifact@latest themes`.

Import application-specific CSS from the JSX or TSX entry:

```tsx
import "./styles/report.css";
```

Vite preserves stylesheet-relative assets. There is no `--css` option or
privileged post-theme CSS slot.

## Option constraints

- `--output` names the single HTML destination.
- `--out-dir` selects directory mode and conflicts with `--output`.
- `--base` requires `--out-dir`.
- `--self-contained` embeds runtime dependencies and conflicts with directory
  mode; `pack` is already self-contained.
- `--no-readable-source` omits direct-file authoring metadata and conflicts with
  directory mode; `pack` already has no readable direct-entry source.
- `--single-file` is a deprecated alias for the default mode.
- `--force` replaces an existing protected output; use it only after confirming
  the exact target may be replaced.

The CLI rejects unsafe output paths and stages publication so a failed rebuild
preserves the last successful artifact.

## Single-file compatibility

Use `--out-dir dist` when an application requires:

- extra executable chunks or unsupported dynamic imports;
- workers or service workers;
- runtime-loaded WASM;
- unresolved required local files;
- runtime-relative `fetch()` calls;
- strict CSP that rejects inline scripts or styles.

Default files require network access to esm.sh. Both file modes execute inline
code and styles. Compression is packaging, not a security boundary. Never
embed secrets.

## Verification

Run the smallest build matching the requested deliverable. A successful CLI
build completes the task. Return the output and ask the user to open the
generated HTML in their browser; do not open, render, or inspect it yourself,
and do not create a screenshot or snapshot.

## When a build fails

1. Read the originating source path and diagnostic.
2. Fix JSX syntax, missing default export, missing bare dependency, or the
   incompatible application shape at its source.
3. Retry the same command.
4. Switch to directory mode only when the application genuinely requires it.
