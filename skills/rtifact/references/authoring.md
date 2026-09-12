# Authoring Rtifact artifacts

## Artifact source contract

- Create a readable `.jsx` module with one default-exported React component.
- Use relative imports for local modules and assets.
- Assume Rtifact supplies React, React DOM, Ant Design, Tailwind CSS, React
  Icons, and PrismJS. Other bare imports must exist in the input project's
  `node_modules`.
- Use browser APIs directly for small tools when they are sufficient.

```jsx
import { Card, Typography } from "antd";
import icon from "./icon.png";

export const RTIFACT = {
  title: "Release readiness",
  icon,
};

export default function Report() {
  return (
    <main className="min-h-screen p-6 sm:p-10">
      <Card className="mx-auto max-w-4xl">
        <Typography.Title>Release readiness</Typography.Title>
        <Typography.Paragraph type="secondary">
          Review the findings, then build the approved result for sharing.
        </Typography.Paragraph>
        <Typography.Text code copyable>
          rtifact Report.jsx --output release-readiness.html
        </Typography.Text>
      </Card>
    </main>
  );
}
```

Use the optional `RTIFACT` export when the artifact needs a meaningful
browser-tab title, favicon, or a PrismJS token theme that overrides the selected
Rtifact theme's default. `icon` may be an imported local image or a remote/data
URL. Select one supplied Prism theme by name only when an override is useful:

```jsx
export const RTIFACT = { prismTheme: "prism" };
```

`prism` selects PrismJS's original theme. Run `rtifact prism-themes` to discover
all names supplied by PrismJS and `prism-themes`. Unknown names use the selected
Rtifact theme's default and produce a CLI warning.

## Stack responsibilities

- **React:** component structure, derived values, and only the state needed for
  useful interaction.
- **Ant Design:** controls, forms, cards, tables, navigation, feedback, and other
  interactive UI. Prefer ordinary semantic props such as `type="primary"`,
  `danger`, `disabled`, and `Typography.Text type="secondary"`.
- **Tailwind CSS v4:** responsive layout, spacing, sizing, and small utility
  adjustments. Prefer semantic utilities over hard-coded theme colors.
  Write complete, statically discoverable class strings; map variants to static
  strings instead of constructing classes such as `` `text-${tone}` ``.
- **Rtifact themes:** global typography, surfaces, focus, selection, native
  elements, Ant Design tokens, and visual direction.
- **React Icons:** recognizable supporting symbols. Import named icons from one
  specific collection subpath such as `react-icons/lu`; do not import an entire
  catalog or mix several icon families without a reason.
- **PrismJS:** syntax highlighting for code that benefits from language-aware
  tokens. Import only the language definitions used by the artifact. Keep plain
  `<pre><code>` for short or language-neutral snippets.

## PrismJS highlighting

Import PrismJS and each language definition the artifact renders. Use the same
language name for the grammar lookup, `Prism.highlight()` call, and
`language-${lang}` classes on both `<pre>` and `<code>`:

```jsx
import Prism from "prismjs";
import "prismjs/components/prism-json";

const lang = "json";
const source = `{"status":"ready"}`;
const highlighted = Prism.highlight(source, Prism.languages[lang], lang);

export default function CodeSample() {
  return (
    <pre className={`language-${lang} overflow-x-auto`} tabIndex={0}>
      <code
        className={`language-${lang}`}
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    </pre>
  );
}
```

The language module must be imported before reading `Prism.languages[lang]`.
For a dynamic language selector, import every offered grammar and handle a
missing grammar before calling `Prism.highlight()`.

For line numbers, import PrismJS's plugin and stylesheet, put `line-numbers` on
the `<pre>`, and use `Prism.highlightElement()` so the plugin hook runs. Rtifact
themes keep the generated gutter aligned with the code typography.

```jsx
import "prismjs/plugins/line-numbers/prism-line-numbers";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";

const highlightCode = (element) => {
  if (element) Prism.highlightElement(element);
};

function NumberedCode({ source }) {
  return (
    <pre className="language-json line-numbers overflow-x-auto" tabIndex={0}>
      <code key={source} ref={highlightCode} className="language-json">
        {source}
      </code>
    </pre>
  );
}
```

## Theme usage

Let native elements inherit the theme and let Ant Design style its own
components. The following utilities are common examples, not a required styling
recipe or a complete list. Prefer theme-backed semantic Tailwind utilities when
explicit styling is needed. Other Tailwind CSS v4 utilities are also available;
write their complete class names statically in the source:

- Surfaces: `bg-background`, `bg-card`, `bg-popover`, `bg-code`
- Text: `text-foreground`, `text-muted-foreground`, `text-primary`
- Structure: `border-border`, `ring-ring`, `shadow-card`
- Status: pair `text-success-foreground` with `bg-success-background`,
  `text-warning-foreground` with `bg-warning-background`,
  `text-danger-foreground` with `bg-danger-background`, or
  `text-info-foreground` with `bg-info-background`
- Shape and type: `rounded-sm`, `rounded-md`, `rounded-lg`, `font-sans`,
  `font-mono`

Status utilities such as `text-warning` use algorithm seed colors, which are
not guaranteed readable as text. Use the foreground/background pairs above for
status text; validate contrast against the actual surface for other combinations.

Avoid hard-coded page-wide palettes, `.ant-*` selector overrides, and large
custom stylesheets. Use a `.ts` or `.jsx` theme module for coordinated semantic
and Ant Design values. Import a local stylesheet from the application only for
focused rules the theme and utilities cannot express cleanly.

## Information design

Optimize all three layers:

1. **Legibility:** use body text around 16–20px, WCAG AA contrast (4.5:1 for
   normal text and 3:1 for large text), visible focus, and comfortable foreground
   and background colors.
2. **Readability:** keep prose measures around 45–75 characters, line height
   around 1.4–1.6, clear paragraph spacing, and fluid responsive layouts.
3. **Comprehension:** lead with the conclusion or status, use semantic landmarks
   and ordered headings, group related information, and expose the next action.

Support scanning with short paragraphs, descriptive headings, lists, summary
cards, callouts, and progressive disclosure. Do not turn every sentence into a
card. Use tables for exact comparisons, not general page layout.

## Interaction

- Interaction is optional. Add it when it improves the experience for human
  readers, such as navigation and links, filtering, comparison, inspection,
  expand/collapse controls, copying, editing, calculation, validation, task
  completion, or progress tracking.
- Show defaults and initial content; do not open to an empty dashboard.
- Cover loading, empty, error, disabled, and success states when the workflow can
  actually reach them.
- Keep controls keyboard accessible and label inputs explicitly.
- Make wide tables, code blocks, and dense toolbars usable on small screens.
- Prefer native browser capabilities for clipboard, download, date, color, and
  file inputs before adding code or dependencies.
- Target modern browsers supported by Rtifact. Do not add legacy API fallbacks or
  polyfills unless the user or target environment requires them.
- Handle rejected browser API promises with concise visible feedback when the
  action is part of the requested workflow.

## Content and token efficiency

- Put the user's real content and conclusions ahead of decorative chrome.
- Use data arrays plus mapping for repeated facts, options, rows, or sections.
- Keep small one-off layouts inline instead of creating abstraction layers.
- Use remote media when it materially improves the artifact. Preserve essential
  meaning in nearby text or `alt`; do not generate dozens of speculative
  fallbacks.

## Embedding user data

When the user provides structured data — JSON objects, CSV rows, plain lists —
embed it as a typed constant at module level rather than fetching it at runtime:

```jsx
const ROWS = [
  { region: "APAC", actual: 1_420_000, target: 1_300_000 },
  { region: "EMEA", actual: 980_000, target: 1_000_000 },
];

export default function Report() {
  return <DataTable rows={ROWS} />;
}
```

- Inline data the user supplies.
- Parse CSV or JSON once at module level, not inside render functions.
- For large datasets, assess serialized byte size and rendering cost against
  the requested delivery constraints. Row count alone is not a reason to pause.
  Embed the supplied data within the authorized scope; clarify only when meeting
  a size or performance constraint requires changing or reducing the content.

## Guardrails

- Keep credentials, access tokens, and secrets out of shareable source.
- Honor existing user authorization for supplied data and requested integrations;
  do not ask again for the same operation. Ask before embedding sensitive data
  or sending data to a service beyond that scope, or when the intended disclosure
  or audience is unclear. Explain the specific data and destination involved.
- In the handoff, identify material external dependencies and sensitive embedded
  data, including who can inspect it, when relevant to sharing. Tailor the notice
  to the actual exposure; ordinary public-data requests do not need a generic
  security warning.
- For external requests, cover loading, error, and empty states.
- Do not invent or estimate facts, metrics, testimonials, links, or available
  actions. Ask for required source data or label placeholders clearly.
- Insert only HTML returned by Prism into `dangerouslySetInnerHTML`; never append
  unescaped or untrusted HTML.
