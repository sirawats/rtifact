## ADDED Requirements

### Requirement: Agent-readable direct-build entry source

Unless the user supplies `--no-readable-source`, every direct JSX or TSX single-file build SHALL embed the exact original entry-file text as inert, uncompressed, machine-readable content in the generated HTML. The embedded authoring source SHALL contain only the direct entry file, SHALL exclude selected built-in or custom theme source and other locally imported modules, and SHALL be present by default in both CDN-backed and `--self-contained` output. The CLI SHALL reject `--no-readable-source` for `--out-dir` and `pack`, where readable direct-entry metadata is already absent.

#### Scenario: Default artifact exposes its entry source

- **WHEN** a user directly builds `pages/Home.jsx` in default file mode
- **THEN** the generated HTML contains the exact original contents of `pages/Home.jsx` as inert readable source

#### Scenario: Offline artifact exposes its entry source

- **WHEN** a user directly builds `Home.tsx` with `--self-contained`
- **THEN** the generated HTML contains the exact original contents of `Home.tsx` without changing offline browser startup

#### Scenario: Direct artifact omits readable source on request

- **WHEN** a user directly builds `Home.jsx` with `--no-readable-source`, with or without `--self-contained`
- **THEN** the generated HTML omits both readable-source templates while preserving the compressed browser payload and normal startup

#### Scenario: Original text is preserved

- **WHEN** the entry contains comments, spacing, CRLF or LF line endings, HTML-significant text, comment delimiters, or no final newline
- **THEN** extracting and HTML-decoding the readable source reproduces the stable source snapshot exactly without formatting or line-ending normalization

#### Scenario: Source scope excludes theme and imported modules

- **WHEN** a direct entry imports local application modules and the build selects a built-in or custom theme
- **THEN** the readable source contains only the direct entry text and does not contain the source text of the imported modules or selected theme

#### Scenario: Non-direct output modes remain unchanged

- **WHEN** a user builds with `--out-dir` or invokes `rtifact pack <directory>`
- **THEN** Rtifact does not add the direct-entry readable-source metadata because those output contracts do not supply an original direct-build entry

#### Scenario: Readable-source opt-out is rejected outside direct file builds

- **WHEN** a user combines `--no-readable-source` with `--out-dir` or supplies it to `pack`
- **THEN** argument validation fails before building and explains that those modes do not include readable source

### Requirement: Private-safe source identity

A direct single-file artifact SHALL identify its readable source by the entry path relative to the CLI invocation working directory, normalized with `/` separators, and SHALL NOT expose an absolute filesystem path in readable-source metadata or agent instructions.

#### Scenario: Nested entry identity

- **WHEN** a user invokes Rtifact for an entry resolved as `/workspace/project/pages/Home.jsx` from `/workspace/project`
- **THEN** the readable-source metadata identifies `pages/Home.jsx` and does not contain `/workspace/project` or another absolute path
