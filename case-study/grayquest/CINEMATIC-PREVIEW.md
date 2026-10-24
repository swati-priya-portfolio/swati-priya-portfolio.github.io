# GrayQuest cinematic preview

## Scope and audit

The earlier experiment replaced Figma's connected journey with tabs and flattened the handwritten evidence captions. Those compositions are restored and retained. This revision enhances the presentation around them rather than replacing authentic evidence. Desktop enhancements begin at 761px; mobile markup, styles, shared viewer code and the live main branch are unchanged.

## Chapter direction

| Chapter | Treatment |
| --- | --- |
| Opening | Original comic cover, upright headline, ambient yellow light and halftone backdrop |
| Overview | Existing problem panels and white evidence cards; restrained chapter entrance |
| Journey | All four original illustrated panels visible; scrolling emphasizes the current panel; direct screen links below |
| Plans | Existing plan comparison and selectable field highlights; authentic sample amounts retained |
| Checks | Existing applicant, income and KYC layouts and alternative routes retained; question entrances |
| Payment | Existing review and payment screens remain readable; no simulated approval celebration |
| Setup | Existing mandate and recovery evidence; no added user-facing penny-test stage |
| Reflection | Calm cream editorial columns, original takeaway, dark next-project feature and all-work/contact links |

## Motion specification

- Hero cover: 750ms vertical mask reveal on an initial visit without a URL fragment.
- Hero heading: 600ms / 16px entrance; content does not depend on completion.
- Chapter headings: 480ms / 12px entrance once per page lifecycle.
- Chapter boundary: 650ms yellow rule draws across the section.
- Parent questions and next-project feature: 380ms / 8px entrance with scale .98 to 1.
- Journey panel: 300ms border/background emphasis in the viewport's reading zone; inactive rows remain fully visible.
- Hover: 200–250ms controls and screen affordances; no rotation or content parallax.
- Hero background light follows mouse position via requestAnimationFrame. No pointer movement on touch or reduced-motion preference.

## Performance and accessibility

No new animation libraries, video, image payloads, fake progress or blocking loader. Existing original image sources and viewer are reused. Below-fold lazy loading is preserved. IntersectionObserver triggers entrances and journey emphasis. Active animations cancel on reduced-motion preference or mobile breakpoint changes. Observers disconnect on pagehide and reconnect after back-forward cache restoration. Existing semantic headings, alt text, keyboard focus and image-viewer controls remain.

## Files changed

- comic-preview.js: cover restoration, chapter entrances, journey emphasis, motion lifecycle handling and direct links.
- comic-preview.css: desktop atmosphere, original cover framing, motion states and reflection styling.
- CINEMATIC-PREVIEW.md: audit, motion specification and QA notes.

## Validation

- JavaScript syntax check passed.
- Browser visual review of original-cover opening and reflection composition.
- All four journey rows remain visible; no tab-hidden narrative.
- No broken loaded desktop images or horizontal overflow at the reviewed desktop viewport.
- Plan field selection updates aria-pressed.
- Original image viewer opens and loads the selected source; Escape closes it.
- Mobile HTML, mobile stylesheet and shared viewer source unchanged (Git diff verification).

## Limits

This is an isolated preview, not a main-site deployment. Physical mobile/tablet device testing and a performance benchmark were not run. Reduced-motion handling is implemented but was not toggled through OS settings during browser QA. Screen image quality remains limited by the original exports; no AI sharpening or invented replacement UI was introduced. The intro is deliberately non-blocking rather than a full-screen loader. No audio, page-turn simulation or forced scrolling was added.
