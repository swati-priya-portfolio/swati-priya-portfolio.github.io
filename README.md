# Swati Priya — Portfolio (static site)

Built from the Figma file `Final-Design`, frame **Swati Priya — Home Page / Clean** (`5:6127`).

## Deploy to GitHub Pages

1. Create a repo and push `index.html`, `styles.css`, `script.js` and the `images/` folder.
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

## Notes

- Fonts load from Google Fonts: Archivo Black, Luckiest Guy, Inter, Caveat, IBM Plex Mono.
- Animations: hero rises on load, cards and timeline rows fade up on scroll, buttons scale on
  hover, nav links draw an underline. All of it is switched off under `prefers-reduced-motion`.
- Tested at 390px, 820px and 1440px.
