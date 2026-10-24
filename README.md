# Mugi Ramen & Izakaya — Landing Page

Landing page for Mugi Ramen & Izakaya (Hanoi). Home, About, Menu, Location, and
Promotions live as tabs on a single page, with English/Vietnamese toggle.

## Running locally

No build step. Serve the folder with any static file server:

```sh
python3 -m http.server 4322
# then open http://localhost:4322/
```

To work on the site and the admin portal together, run the admin's dev
server from the `mugi_admin` repo next to this one. It serves this folder
under `/site/` and commits content changes here.

## How content works

- `content/site.json` holds everything the restaurant can change: all page
  text in vi/en/ja, photos with their descriptions (alt text), the "space" and
  story sections, branch details, the menu, news posts, job openings, the
  footer's tagline and social links (an icon shows once its link is filled
  in) and the analytics ID.
- `index.html` is only the template. It fetches `content/site.json` and
  renders it, so content changes never touch code.
- The menu is shared by the three branches. A dish's `at.<branch>` entry
  either hides it at that branch (`{ "hidden": true }`) or overrides fields
  there (`price`, `nameVi`, `photo`, …).
- `index.html?preview` accepts unpublished content from the admin portal
  (same address only) for its live preview.

## Reservations

`reservation.html` reads the booking rules from `api/booking-rules` (party
size, days ahead, last booking times, closed days) and posts bookings to
`api/reservations`. `netlify.toml` proxies `/api/*` to the admin portal,
which stores the booking, confirms it straight away and emails the branch.
Opened on its own (for example with `python3 -m http.server`), the form has
no API and says the booking couldn't be sent.

## Admin portal

The staff portal lives in its own repo and Netlify site (`mugi_admin`). Each
publish there is a commit to `content/site.json` (and new photos under
`assets/uploads/`) in this repo, made with the staff member as author. Netlify
then redeploys this site like any other push. Pull before editing content
files by hand, or your push will be rejected.

## Hosting on Netlify

Import this repo as a Netlify site. `netlify.toml` already sets everything:
no build command, and the publish directory is the repo root. Point the
domain at it. Give the admin's `/site/*` proxy this site's address.

### Visitor numbers (Umami)

1. Create a site at https://cloud.umami.is (the free plan covers 100k events
   a month).
2. Put its **website ID** in `content/site.json` → `analytics.umamiWebsiteId`
   and commit. The home page and the reservation page then load the tracker.
   It never loads inside the admin preview. Every "Đặt bàn" (Reserve) link
   counts as a `reserve` event, and a sent booking form counts as
   `reservation-sent`.
3. For real numbers in the admin, add the Umami API key to the admin's Netlify
   site (see its README).

## Accessibility

- `assets/a11y.js` adds a display-options button to the site and the
  reservation page (the admin portal loads it too): text size, high contrast, readable font, underlined links,
  reduced motion and a bold keyboard focus ring. Styles are in `washi.css`
  (`html.a11y-*`).
- The admin portal requires a Vietnamese photo description before it
  publishes a photo.
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
