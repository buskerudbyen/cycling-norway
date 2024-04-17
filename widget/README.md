# Sykkelveier.no Widget

Based on a minimal setup to get React working in Vite with hot module reloading and some ESLint rules.

To install dependencies:

```bash
bun install
```

To build the widget:

```bash
bun run build
# dist/widget.js is the widget that one can use via a <script> tag
```

To open the demo page for the widget:

```bash
bun run build
bun run dev
# Note: Hot reloading is not fixed yet, so any changes require running these two commands again
```

FIXME: Document how to use when the widget API is ready, also make a note about the automatic demo div
