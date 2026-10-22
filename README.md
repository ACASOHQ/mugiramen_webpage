# Mugi Ramen & Izakaya — Landing Page

Landing page for Mugi Ramen & Izakaya (Hanoi). Home, About, Menu, Location, and
Promotions live as tabs on a single page, with English/Vietnamese toggle.

## Running locally

```sh
node tools/server.mjs
# site:  http://localhost:4321/
# admin: http://localhost:4321/admin/
```

`python3 -m http.server` still serves the site, but the admin then runs in
demo mode (nothing is published).

## How content works

- `content/site.json` holds everything the restaurant can change: all page
  text in vi/en/ja, photos with their descriptions (alt text), the "space" and
  story sections, branch details, the menu, news posts and job openings.
- `index.html` is only the template. It fetches `content/site.json` and
  renders it, so content changes never touch code.
- The menu is shared by the three branches. A dish's `at.<branch>` entry
  either hides it at that branch (`{ "hidden": true }`) or overrides fields
  there (`price`, `nameVi`, `photo`, …).

## Admin portal (`admin/`)

Staff edit the site as it is: text, captions, photos and menu items (add,
edit, delete, per-branch price and availability). Sections can't be added or
removed. The Website page shows the real `index.html` in a desktop, tablet or
phone frame with unpublished changes applied. Clicking text or a photo there
jumps to its field.

**Publishing is a git commit**, the same as a developer push. The API in
`tools/api.mjs` validates the content (`tools/publish.mjs`), writes
`content/site.json` plus any new photos under `assets/uploads/`, and commits
them with the staff member as author. Version history and restore read the
commits that touched `content/site.json`. The same API runs locally
(`tools/server.mjs`) and on Netlify (`netlify/functions/api.mjs`).

Still sample data: reservations, job applications and staff accounts. These
need a database. Until then, drafts of unpublished website edits and posts
are kept in the browser.

## Hosting on Netlify

1. In Netlify, choose **Add new site → Import an existing project** and pick
   this GitHub repo. `netlify.toml` already sets everything (no build
   command, publish directory is the repo root, the API function lives at
   `/api/*`).
2. Under **Site configuration → Environment variables**, add:
   - `ADMIN_PASSWORD`: the admin sign-in password (required; without it,
     sign-in is refused).
   - `GITHUB_TOKEN`: a fine-grained GitHub token for this repo only, with
     *Contents: read and write*.
   - `GITHUB_REPO`: `vicngan/mugiramen_webpage`.
   - `GITHUB_BRANCH`: optional, defaults to `main`. It must be the branch
     Netlify deploys.
   - `SESSION_SECRET`: optional, any long random string. Changing it (or
     the token or password) signs everyone out.
3. Point the domain at Netlify (**Domain management**).

Each publish from the admin commits to GitHub, and Netlify deploys it in about
a minute. After the admin publishes, pull before editing content files by
hand, or your push will be rejected.

### Visitor numbers (Umami)

Settings → Website & data shows sample numbers until Umami is connected:

1. Create a site at https://cloud.umami.is (the free plan covers 100k events
   a month).
2. Put its **website ID** in `content/site.json` → `analytics.umamiWebsiteId`
   and commit. The home page and the reservation page then load the tracker.
   It never loads inside the admin preview. Every "Đặt bàn" (Reserve) link
   counts as a `reserve` event, and a sent booking form counts as
   `reservation-sent`.
3. Add `UMAMI_API_KEY` (Umami → Settings → API keys) and `UMAMI_WEBSITE_ID`
   to Netlify's environment variables, so the admin can show real numbers.
   The key stays on the server.

The Umami calls are written against Umami's v2 API but have not been run
against a live account yet. Check the Settings page once the key is set.

## Accessibility

- `assets/a11y.js` adds a display-options button to the site, reservation page
  and admin: text size, high contrast, readable font, underlined links,
  reduced motion and a bold keyboard focus ring. Styles are in `washi.css`
  (`html.a11y-*`).
- The admin requires a Vietnamese photo description before it publishes a
  photo.
- The Website preview can simulate low vision and colour blindness, and its
  accessibility check lists low-contrast text, small text, photos without
  descriptions, empty links and missing translations.
- Guests can ask to confirm a reservation by text message or Zalo instead of
  a phone call (`confirm_by` on the reservation form).

## Menus

`content/site.json` → `menu` holds the full menu for the three locations
(Golden Palace/Mễ Trì, Phan Chu Trinh, Mon City/Hàm Nghi), transcribed from
the printed menus in `menus/*.md`, with each branch's differences stored as
`at.<branch>` overrides. The PDFs in `assets/` are the source references.

## Updating the design

Changes made in the Claude Design project aren't synced automatically —
re-fetch `Mugi Ramen Landing.dc.html` and its imports (`styles.css`,
`image-slot.js`, `support.js`) via the `claude_design` MCP and reapply them
here.
