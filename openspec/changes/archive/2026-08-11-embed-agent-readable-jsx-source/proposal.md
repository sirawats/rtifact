## Why

Rtifact’s portable HTML currently exposes the application only as a gzip-compressed base64 payload, so an AI agent receiving the artifact cannot efficiently understand or revise it without reverse-engineering the browser payload. Direct JSX and TSX builds should carry their original entry source in an explicit, safe, agent-readable form while retaining the compressed runtime representation used by browsers.

## What Changes

- Embed the exact original entry `.jsx` or `.tsx` text by default in direct single-file builds, including default CDN-backed and `--self-contained` output, with `--no-readable-source` available when the authoring source should be omitted.
- Place a self-contained AI-agent instruction and inert `rtifact-source` template before the loading status and compressed payload.
- Identify the source with an invocation-working-directory-relative path without disclosing an absolute filesystem path.
- Include copy-pasteable `xmllint` extraction guidance and a Python standard-library fallback, and tell agents not to decode or decompress `rtifact-payload`.
- HTML-escape the template content so arbitrary source remains inert and round-trips exactly, while excluding the selected Rtifact theme source.
- Leave `rtifact pack <directory>` and directory output unchanged because neither contract has an original direct-build entry source to expose.
- Document the readable-source and source-disclosure behavior in the README, official Rtifact skill, and changelog without adding a warning to every build.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `jsx-app-build`: Require direct single-file JSX and TSX builds to preserve and expose their original entry source with safe path metadata, while excluding selected theme source and other local modules.
- `compressed-html-package`: Permit and define inert uncompressed authoring metadata outside the compressed browser payload, including placement, extraction guidance, exact source recovery, and existing artifact-budget enforcement.

## Impact

- Affects CLI parsing in `src/args.ts` plus the stable source snapshot and temporary direct-build handoff in `src/build.ts` and `src/build-worker-main.ts`.
- Extends single-file artifact creation and the HTML shell in `src/single-file.ts` and `src/templates.ts`.
- Requires focused unit and integration coverage for source escaping, exact round trips, path privacy, output-mode scope, theme exclusion, placement, and resource limits.
- Updates public documentation, the official Rtifact authoring skill, and the Unreleased changelog.
- Adds no dependency and does not change browser runtime startup or the compressed payload schema.
