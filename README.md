# Mugi Ramen & Izakaya — Landing Page

Landing page for Mugi Ramen & Izakaya (Hanoi). Home, About, Menu, Location, and
Promotions live as tabs on a single page, with English/Vietnamese toggle.

## Running locally

No build step. Serve the folder with any static file server and open it:

```sh
python3 -m http.server 4321
# then open http://localhost:4321/index.html
```

## How it works

This was imported from a [Claude Design](https://claude.ai/design) project and
runs as-is in the browser — no build/compile step needed.

- `index.html` — the page itself: an `<x-dc>` template (markup with `sc-if` /
  `sc-for` directives and `{{ }}` bindings) plus a `<script data-dc-script>`
  block defining a `Component extends DCLogic` class that supplies the tab
  state, menu/location/story data, and language toggle logic.
- `support.js` — the runtime that parses that template + script, loads
  React/ReactDOM from a CDN, and renders the page. Generated from Claude's
  `dc-runtime`; treat as vendored, do not hand-edit.
- `image-slot.js` — defines the `<image-slot>` custom element used as a
  placeholder wherever a photo goes. Outside the Claude Design editor these
  render as read-only placeholders (no drag-and-drop upload).
- `_ds/classical-48be7531-0163-46df-8139-e4ab66773657/styles.css` — the
  "Classical" design-system tokens (colors, spacing, type) and component
  classes (`.btn`, `.card`, `.nav`, `.seg`, …) the page is built from.

## Menus

`index.html` already contains full menu data for the three locations
(Golden Palace/Mễ Trì, Phan Chu Trinh, Mon City/Hàm Nghi), hand-authored in
the design file. The three PDF menus in this repo (`29177 - MUGI - Mễ Trì.pdf`,
`Menu Mỹ Đình.pdf`, `Menu cơ sở Phan Chu Trinh.pdf`) are the source references
for those locations but are **not yet wired in** — reconciling the in-page
menu data against them is future work.

## Updating the design

Changes made in the Claude Design project aren't synced automatically —
re-fetch `Mugi Ramen Landing.dc.html` and its imports (`styles.css`,
`image-slot.js`, `support.js`) via the `claude_design` MCP and reapply them
here.
