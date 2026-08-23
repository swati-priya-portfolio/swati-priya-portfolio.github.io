# Swati Priya — Portfolio (static site)

Built from the Figma file `Final-Design`, frame **Swati Priya — Home Page / Clean** (`5:6127`).

## Deploy to GitHub Pages

1. Create a repo and push `index.html`, `styles.css`, `motion.css`, `script.js`, `motion.js`
   and the `images/` folder.
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/ (root)`.
3. The site is live at `https://<username>.github.io/<repo>/` in about a minute.

No build step, no dependencies. Every path is relative, so it also works from a subfolder.

## Replace the placeholder images

`images/` currently holds labelled placeholders at the right pixel dimensions. Export each
one from Figma at **2x** and overwrite the file, keeping the same filename.

| File | Figma node | What it is |
|---|---|---|
| `avatar-nav.png` | `5:14` | Round portrait in the nav |
| `hero-character.png` | `5:6131` | Hero laptop illustration |
| `case-guardian-one.png` | `I5:6178;259:1180` | Guardian One comic cover |
| `case-grayquest.png` | `I5:6179;259:1161` | GrayQuest comic cover |
| `case-embibe.png` | `I5:6180;259:1199` | Embibe comic cover |
| `book-back-2.png` | `5:6193` | Back book in the stack |
| `book-back-1.png` | `5:6194` | Middle book in the stack |
| `book-inspired.png` | `5:6195` | Front book cover |
| `album-art.png` | `5:6203` | Lo-Fi player artwork |
| `polaroid-portrait.png` | `5:6258` | Polaroid photo |
| `logo-grayquest.png` | `5:6340` | GrayQuest mark |
| `logo-tring.png` | `5:6349` | Tring mark |
| `logo-houzeo.png` | `5:6358` | Houzeo mark |
| `logo-embibe.png` | `5:6367` | Embibe mark |
| `tool-figma.png` | `5:6296` | Figma icon |
| `tool-framer.png` | `5:6300` | Framer icon |
| `tool-spline.png` | `5:6305` | Spline icon |
| `tool-lovable.png` | `5:6308` | Lovable icon |
| `tool-claude.png` | `5:6313` | Claude icon |
| `footer-the-end.png` | `5:6444` | "The End" cover artwork |

Also drop your CV in as `images/swati-priya-resume.pdf` — the hero and footer both link to it.

The small hand-drawn marks (underlines, the curved arrow, the star, the headphone outline,
the pin, the tape, the torn footer edge) are inline SVG in the HTML/CSS rather than exports,
so there's nothing to replace for those.

## Where to edit content

| Change | Where |
|---|---|
| Headline, bio, metrics | `index.html` → `.hero` |
| Case study links and copy | `index.html` → `.case-grid` |
| Roles and dates | `index.html` → `.timeline` |
| Email address | `index.html` → `.footer-actions` (`mailto:`) |
| Colours and fonts | `styles.css` → `:root` |
| Motion timing and intensity | `motion.css` → `:root { --ep }` and each numbered section |
| Cursor labels | `index.html` → `data-cursor="…"` on any element |
| Footer giant words | `index.html` → `data-giant="…"` on the footer links |

## The motion layer

`motion.css` + `motion.js` sit on top of the design. They add movement only — no colour, type
or layout of the original file is changed, and the page is fully readable with both removed.

- **Loader** — "SWATI PRIYA PRESENTS…" runs once per browsing session, about 1.2s, then opens.
- **Hero** — headline rises line by line behind a clip, the portrait settles in behind a warm
  pool of light, and a hidden comic sketch layer is revealed in a ~210px circle around the
  cursor. Parallax is 2–5px.
- **Headline** — every letter is its own span. Letters lift and grow as the cursor passes,
  neighbours trailing behind them; positions are measured once and offset by the scroll, so
  scrolling never triggers a layout read.
- **Custom cursor** — a dot that grows a speech-bubble label. Labels come from `data-cursor`.
- **Nav** — expands over the hero, compresses into avatar + name + AVAILABLE FOR WORK below it.
- **Pick an episode** — the strongest moment. The stage pins for about one screen of scroll.
  GrayQuest opens the section alone in the centre and never moves sideways; Guardian One
  slides out to the left, then Embibe to the right, each as its own beat. Below 1080px, or
  when the stage would not fit on screen, it falls back to a staggered reveal.
- **Paper tears** — case studies, behind the screens and about each arrive on a torn edge
  that pulls into place as the band enters the viewport. The silhouettes are generated,
  irregular masks, in the same language as the footer's torn edge.
- **Everything else** — books lift, boards tilt a degree, the music button toggles a real
  equaliser (no autoplay, session-remembered), the footer grows a giant outline word and a
  comic speech bubble behind the final cover.

Switched off automatically: all of the above under `prefers-reduced-motion`, and the cursor,
sketch reveal, parallax, tilt and magnetic words on touch devices, which get press states
instead.

## Notes

- Fonts load from Google Fonts: Archivo Black, Luckiest Guy, Inter, Caveat, IBM Plex Mono.
- Only `transform` and `opacity` are animated; all pointer-driven work shares one rAF loop.
- Tested at 393px, 1100px, 1280px and 1440px, plus reduced-motion and JavaScript-disabled.
