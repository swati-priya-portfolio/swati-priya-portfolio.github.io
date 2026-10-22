# GrayQuest case study

Responsive, buildless HTML/CSS/JavaScript at `/case-study/grayquest/`.
The home-page GrayQuest card links here. Existing Guardian One and home styling are otherwise unchanged.

## Design source
Figma `BItsaIJYIc1xs8DNVPRuAz`, page `481:413`, desktop `481:414`.
The page uses Archivo Black, Inter and Caveat, with shared site typography tokens and the Figma cream/ink/yellow palette.

Portfolio text is semantic HTML. Original product evidence and illustration layers are local PNG assets; entire case-study sections are not flattened into images. Historical product examples retain their source styling. The OTP recovery concept is labelled separately. Feb 2025–Jun 2026 denotes GrayQuest tenure, not a measured project duration.

## Behaviour
- Continuous scroll with chapter anchors and reading progress.
- Responsive single-column layouts on mobile; no page-wide scaling.
- Evidence buttons open a native dialog. Escape closes it and restores focus.
- Lazy-loaded evidence, explicit image dimensions, eager hero artwork.
- Reduced-motion support, semantic headings, skip link and visible keyboard focus.

## Validation
Browser checks at frame widths 320, 390, 768, 1024 and 1440px: 17 sections, no horizontal content overflow, no broken source images. Checked mobile chapter navigation and evidence open/Escape-close. JavaScript syntax and local links/assets validated.

No build step or new runtime dependencies. To preview locally, serve the repository root with any static HTTP server and open `/case-study/grayquest/`.
