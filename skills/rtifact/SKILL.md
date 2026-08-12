---
name: rtifact
description: Use when you need to create a deliverable for content, documentation, data presentation, findings, an offline or standalone website, or anything that benefits from a UI. This skill guides writing a .jsx entry compatible with the `rtifact` CLI and building it into a portable HTML file that can be sent to anyone, whether a human or an AI agent. Trigger even when the user does not mention Rtifact, JSX, or HTML, when a shareable browser-openable deliverable is more appropriate than a reusable application or codebase. Also use to revise, rebuild, or diagnose an existing Rtifact artifact.
---

# Rtifact

Create the finished deliverable artifact, not a frontend project. Rtifact supplies the
build environment and turns a JSX entry into portable HTML. Optimize for
the people or agents who will consume the resulting file; source code is only
the compact authoring format.

## Artifact Definition

An artifact is a self-contained deliverable that users or AI agents can view, interact with, edit, or reference outside the conversation.

Create an artifact when content meets these criteria:

- **Self-contained and substantial:** Stands on its own without requiring conversation context.
- **Reusable and referenceable:** Something the user will want to inspect, iterate on, or share later.

Common examples include:

- Documents, guides, reports, and presentations
- Interactive React components, calculators, and tools
- Data visualizations, diagrams, and flowcharts

## Workflow

1. Understand the deliverable. Identify its audience, purpose, source material,
   required content, and any interaction that helps the audience understand or
   act on it. Inspect supplied files before deciding how to present them.
2. Read [references/authoring.md](references/authoring.md) before writing or
   substantially revising an entry. Follow its authoring rules and guardrails,
   including any required user confirmation.
3. Create a readable `.jsx` entry with one default-exported React
   component. Organize the supplied material around the audience's
   purpose, preserve its facts, and add UI or interaction only when it improves
   the deliverable.
4. Let the Rtifact theme provide global visual direction. If the user supplies
   a custom theme, read
   [references/use-custom-theme.md](references/use-custom-theme.md). Use the
   `rtifact-create-theme` skill when creating, revising, or repairing the theme
   itself.
5. Read [references/cli.md](references/cli.md), choose the output mode, and build.
   Default to portable HTML; use `--self-contained` for offline delivery or
   `--out-dir` for static hosting.
6. When the Rtifact CLI builds successfully, return the output and any required
   handoff warning, then stop. Ask the user to open the generated HTML in their
   browser. Do not open, render, or inspect it yourself, and do not create a
   screenshot or snapshot.

## Portable handoff

Direct HTML builds embed the exact JSX source in agent-readable metadata by
default; prefer this normal handoff. Use `--no-readable-source` only when the
user asks to omit readable source, and note that compiled application code still
remains in the artifact.

## Boundaries

- Do not scaffold Vite, Tailwind, React, or HTML infrastructure; Rtifact already
  supplies it.
- Do not add routers, state libraries, component frameworks, or design systems
  for a single deliverable when the supplied stack covers the need.
- Do not import Rtifact theme CSS or add another Ant Design `ConfigProvider`;
  the generated output already owns that boundary.
- Prefer native browser capabilities and semantic elements before custom code.
- Keep controls keyboard accessible, label inputs and icon-only controls, and
  preserve meaningful text alternatives.
- Treat remote media and APIs as optional dependencies unless the deliverable
  explicitly requires them. Give essential remote content one useful failure
  state.
- Do not overwrite an existing output unless the user authorized replacing
  that exact target.
- Fix build errors at their source. Follow the diagnostic and retry the same
  mode before changing the packaging strategy.
