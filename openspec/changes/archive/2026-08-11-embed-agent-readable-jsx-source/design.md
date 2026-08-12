## Context

Direct single-file builds currently pass a temporary Vite output directory into the same packager used by `rtifact pack`. By that point the original entry has been transformed into bundled JavaScript. Separately, `createTailwindSourceSnapshot()` already obtains a stable, bounded snapshot of the entry, imported source graph, and optional custom theme before the Vite build. The HTML shell currently begins its body with a loading element followed by the gzip/base64 payload and bootstrap.

The new metadata must use the already approved source snapshot so the readable text and compiled build come from one stable read. It must not cause a second entry-file read, leak absolute paths, expand source scope to imported modules, change the compressed payload schema, or weaken existing resource and publication guarantees.

## Goals / Non-Goals

**Goals:**

- Carry the exact stable entry text from the build stage to the direct-file packaging stage.
- Give agents unfamiliar with Rtifact an immediately visible and safely extractable representation.
- Preserve valid inert HTML for arbitrary JSX source and command text.
- Keep source inclusion within existing source and final-artifact budgets.
- Allow direct-file callers to omit readable authoring metadata when source disclosure is undesirable.

**Non-Goals:**

- Reconstruct source for `rtifact pack` or directory output.
- Embed imported local modules, selected theme source, source maps, or compiled JavaScript in readable form.
- Add source opt-in controls, payload fields, or runtime UI.
- Prove that shareable source contains no secrets; documentation will make the disclosure explicit.

## Decisions

### Carry only the snapshotted entry through the build callback

Extend the temporary-build consumption boundary with narrowly typed entry-source context. After `createTailwindSourceSnapshot()` completes, select only the normalized entry key from its `files` map and provide that string to the consumer alongside the temporary output directory. The file worker computes the display path relative to the job’s validated invocation `cwd`, normalizes separators to `/`, and passes `{ path, source }` only when creating a direct-file artifact.

This reuses the stable read already used by the build and structurally excludes theme and imported-module source. Reading the entry again in the worker was rejected because the file could change after the build snapshot. Passing the whole source map was rejected because it broadens disclosure and makes accidental graph embedding easier.

### Make readable source optional at the generic packager boundary

Allow single-file artifact creation to accept optional readable-source metadata. Direct file builds supply it; `pack` calls the packager without it. The normalized browser payload remains unchanged and continues to be serialized and compressed exactly as before.

Changing the payload schema was rejected because agents would still need to decompress it. Inferring source from Vite output was rejected because compiled code is not the original authoring representation.

### Keep embedding as the default with one direct-build opt-out

Add `--no-readable-source` to direct JSX and TSX file builds and carry one boolean through the existing parsed build options and worker job. When false, the direct-file worker calls single-file artifact creation without readable-source metadata, which already causes both authoring templates to be omitted. The stable source snapshot remains unchanged because it is also required for Tailwind discovery and build safety.

Reject the flag for `--out-dir` and `pack` instead of accepting a meaningless no-op. A positive opt-in flag was rejected because readable source is the established default, and a generic `--no-template` name was rejected because the HTML template is an implementation detail rather than the user-facing source contract.

### Emit two inert templates before all runtime content

When source metadata is present, the shell emits these elements at the start of `<body>`:

1. `template#rtifact-agent-instructions`, containing the standalone explanation and extraction commands.
2. `template#rtifact-source[data-path]`, containing the original entry text.

Both template bodies are HTML text-escaped by replacing `&` before `<`; attributes use attribute-safe escaping. The templates are inert, do not render, and are removed naturally when the existing bootstrap replaces the document body. The source text is not surrounded by formatting whitespace, so template text extraction reproduces the snapshot exactly.

A raw HTML comment was rejected because arbitrary source and command flags such as `--html` violate comment-content constraints or can terminate a comment. A JSON script was rejected because multiline string escaping makes JSX difficult for an agent to read and raw-text end-tag handling requires additional transformations.

### Put complete extraction guidance in the artifact

The instruction identifies the file as generated from JSX by Rtifact, links `https://github.com/sirawats/rtifact`, names `rtifact-source` as the authoring representation, and explicitly says not to decode or decompress `rtifact-payload`.

It includes a concise `xmllint` command:

`xmllint --html --xpath 'string(//template[@id="rtifact-source"])' artifact.html 2>/dev/null`

Because no HTML-decoding CLI is guaranteed across all macOS and Linux installations, it also includes a Python standard-library fallback:

`python3 -c 'import html,re,sys; text=open(sys.argv[1], encoding="utf-8", newline="").read(); match=re.search(r"<template\\b[^>]*\\bid=\\"rtifact-source\\"[^>]*>(.*?)</template>", text, re.S); sys.stdout.write(html.unescape(match.group(1)))' artifact.html`

The Python fallback uses `newline=""` so it preserves CRLF and LF source text. `xmllint` is intentionally the convenient readable extractor; its standard output may add a terminal newline, so byte-exact extraction uses the Python fallback. The generated shell controls the template shape, and escaping `<` in source prevents a source literal from creating a competing closing template tag, so the fallback’s bounded format-specific match is deterministic.

### Preserve existing limits and publication behavior

The existing stable snapshot limits continue to bound the entry at 4 MiB. Final HTML byte measurement occurs after shell generation, so readable metadata is naturally included in the existing 128 MiB artifact limit. Oversized output fails rather than silently omitting or truncating source. No new warning is printed during normal builds.

## Risks / Trade-offs

- [Original source can disclose comments, dead code, or unused strings that bundling previously removed] → Document the default disclosure in README, the official skill, and changelog; retain the existing guidance not to place secrets in portable artifacts.
- [Entry-only source may be incomplete when behavior lives in imported modules] → Keep the v1 contract narrow and explicit; a future versioned multi-file manifest can be considered from real usage without silently widening disclosure now.
- [HTML escaping makes raw JSX tags slightly less visually direct] → Escape only characters required for safe parsed text and provide extraction commands that recover exact source.
- [Instruction text adds fixed bytes to every direct artifact] → Keep it concise and use one-line commands; the readability benefit outweighs the small constant increase.
- [Changing callback types could accidentally affect directory builds] → Keep metadata additive, require direct-file packaging to opt into it internally, and test file, self-contained, directory, and pack paths independently.
- [Users may assume the opt-out changes application payload contents] → Document that it removes only the readable authoring templates; compiled application code remains in the compressed payload.

## Migration Plan

1. Add RED-first unit and integration coverage for source placement, exact extraction, path privacy, scope, and unchanged output modes.
2. Thread stable entry context through the temporary-build and file-worker boundary.
3. Add optional metadata rendering to the single-file shell without changing payload compression or bootstrap behavior.
4. Add the direct-file `--no-readable-source` opt-out at the existing argument and worker boundaries.
5. Update documentation and run the repository’s full verification gate.

Rollback removes the optional shell metadata and direct-build handoff; no persisted format migration or payload-version rollback is required because browser startup and payload schema remain unchanged.
