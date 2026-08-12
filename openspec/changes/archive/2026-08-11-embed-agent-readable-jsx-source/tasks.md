## 1. RED-First Contract Tests

- [x] 1.1 Add failing unit tests for optional readable-source shell rendering, instruction/source placement before runtime content, HTML text and path escaping, and exact source recovery for HTML-significant and comment-like sequences.
- [x] 1.2 Add failing tests that verify the embedded `xmllint` and Python standard-library examples target `template#rtifact-source`, with the Python fallback preserving exact source text and line endings.
- [x] 1.3 Add failing integration tests proving default and `--self-contained` direct builds embed only the stable entry source with a working-directory-relative `/`-normalized path, while imported local modules and selected custom theme source remain absent.
- [x] 1.4 Add failing regression tests proving `--out-dir` and `rtifact pack` do not emit direct-entry metadata, browser payload compression remains intact, and final artifact-size accounting includes readable metadata.

## 2. Stable Entry-Source Handoff

- [x] 2.1 Extend the temporary application build consumption boundary to provide only the snapshotted entry text alongside the temporary output, failing safely if the validated entry is unexpectedly absent from the snapshot.
- [x] 2.2 In the direct-file worker path, derive a `/`-normalized path relative to the validated invocation working directory and pass it with the stable entry text to single-file artifact creation.
- [x] 2.3 Keep directory-build and `pack` call paths free of readable-source metadata and confirm no second entry read or whole-source-graph handoff is introduced.

## 3. Agent-Readable HTML Shell

- [x] 3.1 Add optional readable-source metadata to single-file artifact and shell creation without changing the normalized payload interface, payload version, gzip compression, or bootstrap validation.
- [x] 3.2 Implement valid context-specific escaping for inert instruction and source templates so template text decoding round-trips the original source exactly and path attributes cannot alter markup.
- [x] 3.3 Emit `template#rtifact-agent-instructions` and `template#rtifact-source[data-path]` at the start of `<body>`, before the status and payload, with no source-surrounding whitespace that changes extraction.
- [x] 3.4 Include concise standalone guidance naming Rtifact and its repository, directing unfamiliar agents away from `rtifact-payload`, and providing the verified `xmllint` command plus compact Python standard-library fallback.
- [x] 3.5 Ensure shell byte measurement applies the existing 128 MiB artifact limit after readable metadata is included and never truncates or silently omits oversized source.

## 4. Public Contract Documentation

- [x] 4.1 Update README output-mode documentation to explain that direct HTML artifacts expose their original entry source and may therefore disclose comments, dead code, or unused strings.
- [x] 4.2 Update the official Rtifact skill and relevant CLI reference so agents know generated artifacts are directly inspectable through `rtifact-source` and must not contain secrets intended to remain private.
- [x] 4.3 Add an Unreleased changelog entry describing agent-readable entry source, affected direct file modes, and unchanged `pack` and directory behavior.

## 5. Verification

- [x] 5.1 Run the focused unit and integration test groups covering single-file templates, packaging, direct builds, custom themes, and resource limits; resolve failures without weakening assertions.
- [x] 5.2 Build a representative artifact and verify the Python extraction command writes byte-for-byte equivalent entry text, `xmllint` provides readable extraction, and the artifact still loads through the existing bootstrap.
- [x] 5.3 Run `npm run verify` and `openspec validate embed-agent-readable-jsx-source --strict`, confirming formatting, lint, type checks, tests, package verification, and specification validation all pass.

## 6. Readable-Source Opt-Out

- [x] 6.1 Add failing argument and integration tests for `--no-readable-source` in default and `--self-contained` direct builds, including rejection with `--out-dir` and `pack`.
- [x] 6.2 Parse and thread one direct-build readable-source boolean through the existing build and worker boundaries so opting out omits both authoring templates without changing the compressed payload.
- [x] 6.3 Update CLI help, README, official Rtifact skill/reference, and Unreleased changelog documentation for the opt-out and its source-disclosure semantics.
- [x] 6.4 Run focused tests, `npm run verify`, and `openspec validate embed-agent-readable-jsx-source --strict`.
