# product-identity Specification

## Purpose

Define Rtifact's canonical product identity and its artifact-first positioning across package, CLI, integrations, documentation, website, and official skills.

## Requirements

### Requirement: Canonical Rtifact identity

The project SHALL use **Rtifact** as its product name, `rtifact` as its npm package, executable, plugin, marketplace, and primary skill identifier, `rtifact-create-theme` as its theme skill identifier, `RTIFACT` as its JSX metadata export, and Rtifact-derived names for package-owned code and generated identifiers.

#### Scenario: Public identifiers are inspected

- **WHEN** package metadata, CLI help, plugin manifests, skill metadata, generated output, and active source identifiers are inspected
- **THEN** they use the canonical Rtifact form appropriate to each surface

#### Scenario: Active repository surfaces are scanned

- **WHEN** tracked active product files and name-bearing paths are searched after the rebrand
- **THEN** no YOLO-derived product identifier remains outside OpenSpec change records

### Requirement: Artifact-first product positioning

Public product documentation and integration descriptions SHALL lead with Rtifact's ability to turn agent-authored JSX into finished, portable, interactive HTML artifacts and SHALL present frontend tooling as the supplied means rather than the primary outcome.

#### Scenario: New user reads the primary documentation

- **WHEN** a user reads the README or website introduction
- **THEN** the user can identify the JSX input, the finished HTML artifact, the default portable single-file workflow, and the alternative offline and directory output modes

#### Scenario: Agent discovers an integration

- **WHEN** an agent reads a plugin description or official skill
- **THEN** it is instructed to create a rendered artifact for an audience and purpose rather than scaffold a general frontend project

### Requirement: Artifact-first official skills

The packaged authoring and theme skills SHALL use Rtifact identifiers and SHALL explain artifact-oriented selection, authoring, build, readability, interaction, theme, output-mode, and verification guidance consistently with the public product documentation.

#### Scenario: Authoring skill is inspected

- **WHEN** an agent loads the primary Rtifact skill
- **THEN** the skill identifies portable browser artifacts as the outcome, routes common artifact types to examples, and requires the smallest relevant build plus rendered-state inspection

#### Scenario: Theme skill is inspected

- **WHEN** an agent loads the Rtifact theme skill
- **THEN** the skill describes theme modules and reusable brand components as tools for coherent artifact presentation without changing the artifact-first authoring model

#### Scenario: Verification tooling is unavailable

- **WHEN** an artifact builds successfully but the agent cannot inspect it in a browser
- **THEN** the skill directs the agent to report the successful build and the unverified visual and interaction checks separately

#### Scenario: Artifact source is recovered for revision

- **WHEN** an agent extracts readable entry metadata from a received HTML artifact
- **THEN** the skill explains that imported source files, assets, and custom themes are not restored by entry extraction and must be recovered before rebuilding

#### Scenario: Data and integrations are already authorized

- **WHEN** the user has authorized supplied data or a requested integration
- **THEN** the skill directs the agent to proceed within that scope without repeated confirmation, assess data size by bytes and rendering cost rather than a fixed row threshold, and clarify new sensitive-data exposure or unresolved delivery constraints

#### Scenario: Contrast guidance is followed

- **WHEN** an agent follows the authoring or theme skill's contrast guidance
- **THEN** status text uses semantic foreground/background pairs, documented role thresholds match the theme validator, and general WCAG large-text thresholds distinguish points from CSS pixels

### Requirement: Rtifact visual identity

Active public surfaces SHALL use a simple Rtifact identity and SHALL NOT retain YOLO- or Chihuahua-derived branding assets or explanations.

#### Scenario: Public brand assets are inspected

- **WHEN** README and website brand presentation and tracked assets are reviewed
- **THEN** they present Rtifact without the previous YOLO/Chihuahua identity
