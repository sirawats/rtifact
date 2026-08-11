## MODIFIED Requirements

### Requirement: Self-contained compressed artifact

The packager SHALL produce one valid HTML file whose browser application payload is gzip-compressed and embedded within that file, and every artifact SHALL NOT require neighboring local files to start. When self-contained packaging is selected, the artifact SHALL also embed its required runtime dependencies. A direct JSX or TSX build MAY additionally carry inert, uncompressed authoring metadata outside the browser application payload, but that metadata SHALL NOT replace or alter payload compression.

#### Scenario: Package a compatible application

- **WHEN** the packager receives a compatible application containing HTML, JavaScript, CSS, and local build assets
- **THEN** it emits one HTML file containing a gzip payload and no references to required neighboring local files

#### Scenario: Self-contained packaging embeds the runtime

- **WHEN** a direct JSX build selects `--self-contained` or the user invokes `pack`
- **THEN** the generated artifact starts without fetching remote package code

#### Scenario: Compression is retained in the artifact

- **WHEN** the generated HTML file is inspected
- **THEN** the substantial browser application payload is represented as gzip-compressed bytes encoded for safe HTML embedding rather than as uncompressed compiled application text, even when direct-build authoring source is separately readable

## ADDED Requirements

### Requirement: Agent-readable authoring metadata shell

When readable direct-build source is supplied, the single-file shell SHALL place self-contained agent instructions and an inert `template` identified as `rtifact-source` at the start of the document body before the loading status and compressed `rtifact-payload`. The source template SHALL use safe HTML text escaping, SHALL carry the safe relative source path, and SHALL neither render nor execute.

The instructions SHALL identify Rtifact and `https://github.com/sirawats/rtifact`, direct an unfamiliar AI agent to read `rtifact-source` instead of decoding or decompressing `rtifact-payload`, and provide copy-pasteable extraction examples using `xmllint` and a Python standard-library fallback.

#### Scenario: Agent inspects the beginning of an artifact

- **WHEN** an AI agent reads the generated HTML from the start
- **THEN** it encounters the self-contained reading instructions and readable source before the loading status and large compressed payload

#### Scenario: Arbitrary JSX remains inert and recoverable

- **WHEN** source contains JSX tags, ampersands, `</template>`, `<!--`, `-->`, decrement operators, or other HTML-significant sequences
- **THEN** the generated document remains valid and inert, `xmllint` provides a readable extraction, and the documented Python fallback writes the exact decoded source to standard output without line-ending normalization

#### Scenario: Source metadata does not affect startup

- **WHEN** a supported browser opens an artifact carrying readable source metadata
- **THEN** the existing bootstrap validates, decompresses, and starts the browser payload with no execution or rendering of the authoring metadata

#### Scenario: Readable metadata is omitted together

- **WHEN** a direct single-file build disables readable source metadata
- **THEN** the shell contains neither `rtifact-agent-instructions` nor `rtifact-source`, while retaining the same compressed browser payload contract

#### Scenario: Artifact budget includes readable source

- **WHEN** readable source increases the generated HTML size
- **THEN** the complete HTML including instructions and source remains subject to the existing final portable-artifact size limit and fails before publication if that limit is exceeded
