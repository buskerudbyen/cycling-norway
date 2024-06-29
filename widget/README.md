# Sykkelveier.no Widget

## Integration

1. Go to https://widget.sykkelveier.no/.
2. Choose your destination and add an initial zoom level.
3. Click on `Last inn widget` to check the result.
4. Copy the necessary codes from below (the proper `script` tag, the corresponding `div` and the JavaScript code) to your website.

## Development

Based on a minimal setup to get React working in Vite with hot module reloading
and some ESLint rules.

A note about dependencies: This `widget/package.json` has all `dependencies`
from the parent `package.json` copied in.

To install dependencies:

```bash
npm install
```

To build the widget:

```bash
npm run build
# dist/widget.js is the widget that one can use via a <script> tag
```

To open the demo page for the widget:

```bash
npm run build
npm run dev
# Note: The index.html page purposely uses the built bundle as the widget
# instead of starting from widget.tsx. This is to ensure that the widget works
# as intended when including it with a <script> tag. However, a trade-off is
# that we do not have hot reloading, so any changes require running
# `npm run build && npm run dev` again.
```
