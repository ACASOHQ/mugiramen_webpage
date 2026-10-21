# Website brief (Oct 2026) vs. current site

Source: `WEBSITE Mugi .docx`. The brief's two images (a "Kurofude" layout and a Klook-watermarked photo) are mood references only and are not used on the site.

| Brief item | Status | Notes |
|---|---|---|
| Mobile-first, responsive | Done | Single-column mobile layout, scrollable nav, stacked sections |
| Home: hero, short intro, featured dishes, branch list, Menu/Reserve CTAs, social | Done | Real dish photos; only the Facebook link is known (no Zalo/other) |
| About MUGI | Partial | Short factual copy only. **Needs the real founding story, philosophy and values from MUGI** |
| Menu: groups, photo, name, description, price, per-branch menus | Done | 3 branch menus; "Featured" tag added (4 dishes, my pick, please confirm). 3 dishes still lack photos (see `menus/photo-matching.md`) |
| Menu seasonal flag | Missing | Add a `seasonal` flag when there is a seasonal dish |
| Branch pages (address, phone, hours, photos, Maps, menu, reserve) | Done, no photos | One section per branch with Maps embed, menu link and prefilled reserve link. **No interior/storefront photos exist**, so none are shown |
| Reservation form | Prototype | UI works, prefilled by branch. **Not connected to any backend** (shows a demo notice): no staff notification, status tracking or storage |
| News & offers | Structure only | Data-driven list with empty state. Old invented promos were removed |
| Careers | Structure only | Same; needs real job posts |
| Contact | Done | Phones, directions, Facebook |
| Vietnamese / Japanese / English | Done (UI) | Per-language link via `?lang=ja`. Brief asks for separate paths (`/vi`, `/ja`, `/en`) which needs the hosting/framework choice. Japanese dish names are shown; drink descriptions and toppings fall back to English |
| Staff CMS, roles, add branch without code | Missing | Needs the platform decision (WordPress vs Next.js + headless CMS). Today, edit `index.html` data |
| SEO | Basic | Title, description, Open Graph, Restaurant JSON-LD. Content renders client-side, so a static/SSR build is better for Google |
| HTTPS, backups, spam protection, analytics | Missing | Hosting-level; not part of this static prototype |
| iPOS integration | Not started | Brief: survey only in phase 1 |
| Phase 2 (online ordering, loyalty, CRM) | Out of scope | Per brief |

## Content removed because it was invented or unverifiable
Tagline in the hero, "18-hour broth", "glass pass / open kitchen", fake 2026 promotions and anniversary, "both locations", delivery apps, parking/office-group/private-room/"lunch sets from 89,000₫" bullets, seat counts, fictional "specials".

## Still unverified (kept from earlier data)
Opening hours (10:30–14:00 / 17:00–22:00, same at all branches).

## Needed from MUGI
Real story and values, interior/storefront/team photos, news and job posts, Zalo link, booking backend decision, confirmation of featured dishes and hours.
