# GrayQuest case study

Responsive, buildless HTML/CSS/JavaScript at `/case-study/grayquest/`.
The home-page GrayQuest card links here. Existing Guardian One and home styling are otherwise unchanged.

## Design source
Figma `BItsaIJYIc1xs8DNVPRuAz`, page `481:413`, desktop `481:414`.
The page uses Archivo Black, Inter and Caveat, with isolated case-study typography tokens and the Figma cream/ink/yellow palette.

Portfolio text is semantic HTML. Original product evidence and illustration layers are local high-resolution WebP and SVG assets; entire case-study sections are not flattened into images. Historical product examples retain their source styling. The OTP recovery concept is labelled separately. Feb 2025–Jun 2026 denotes GrayQuest tenure, not a measured project duration.

## Behaviour
- Continuous scroll with chapter anchors and reading progress.
- Responsive single-column layouts on mobile; no page-wide scaling.
- Evidence opens in a fit-to-screen dialog with actual size, zoom controls and drag-to-pan. Escape closes it and restores focus.
- Supporting screens live in accessible disclosures; the main story remains continuous.
- Student and plan screens use outlined SVG exports from the original editable Figma layers. Other screenshots retain their original raster quality.
- Lazy-loaded evidence, explicit image dimensions, eager hero artwork.
- Reduced-motion support, semantic headings, skip link and visible keyboard focus.

## Validation
Browser checks at frame widths 320, 390, 768, 1024 and 1440px: 8 main sections, no horizontal content overflow, no broken source images. Checked mobile chapter navigation and evidence open/Escape-close. JavaScript syntax and local links/assets validated.

No build step or new runtime dependencies. To preview locally, serve the repository root with any static HTTP server and open `/case-study/grayquest/`.

## Fidelity refinements
Original journey artwork and icons restored. Source-framed evidence uses a single border; paired evidence stages and captions align. Compact spacing reduces desktop page length without cropping screen evidence. Subtle entrance motion respects reduced-motion preferences. Screens open at full export resolution.

Compact version: measured desktop document height fell from 18,616px to 7,467px at a 1,363px viewport (supporting disclosures closed).
