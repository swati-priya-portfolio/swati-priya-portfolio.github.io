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

## Illustrated landscape edition — 25 October 2026
- Original generated panoramic education-neighbourhood artwork, black/cream/gold ink drawing. Prompt: richly detailed Indian schools, colleges, homes, trees and paths at dusk; layered silhouettes, engraved linework and comic halftone; calm black upper sky, golden horizon, no text or proprietary characters. Generated with built-in image generation, converted to WebP at quality 88.
- Three environmental placements only: hero, a compact transition before applicant checks, and next-project closing. Original screenshots and financial/sample content untouched.
- Desktop-only ~1-second comic-page intro with skip/Escape, automatic removal, reduced-motion bypass, session repeat/hash/back-navigation bypass. Page is rendered beneath and remains interactive.
- Hero is upright, retains original cover, shares the existing fonts and CTA design. No new framework or animation dependency.
- Mobile HTML/CSS and live main unchanged. New CSS stays inside min-width:761px; new DOM is built only for desktop.
- Verification: JavaScript syntax, desktop screenshot and horizontal-overflow check. Physical mobile/tablet and OS reduced-motion testing not performed.

## Luminous background refinement
Landscape brightness increased 24% with slightly softer saturation; bridge and closing artwork also lifted. Added a warm animated cover halo, a fine moving light trail from cover to landscape, and ten sparse drifting lights. Background is decorative and confined to the hero, with Pause/Play, offscreen suspension, and reduced-motion static state. Mobile and evidence content unchanged.


## Readability and illustration refinement — 26 October 2026
- Desktop hero separates metadata and handwritten note from the landscape; cleaner 2-column facts and quieter secondary CTA. Replaced the gold light trail with restrained atmospheric haze.
- Reflection follows the inspected Figma frame 635:838: cream background, compact editorial heading, original parent illustration and two white validation panels.
- Applicant alternatives use original character crops with both routes visible, without nested cards or redundant selector pills.
- Removed gold screenshot hover outlines; kept visible keyboard focus. Aligned setup evidence sizing.
- Added opt-in original synthesized ambience with mute and volume controls, paused on hidden page/mobile breakpoint. This is not Harry Potter music. No audio autoplays.
- QA: syntax and whitespace checks passed; desktop 1363px screenshots checked for hero, applicant portraits and reflection; no horizontal overflow or broken loaded desktop images. Sound control toggles verified. Physical mobile/tablet, audio listening and full breakpoint testing not performed. Mobile source and homepage untouched.

## Printed comic edition
- Replaced full-width scenic banner with scenery confined behind an upright layered-paper cover. Reduced hero height and moved project facts into a four-column editorial strip.
- Reused the existing homepage SVG torn-edge silhouette at seven major chapter boundaries; brief reveal animation respects reduced motion and never hides content by default.
- Cream opening chapter with open illustrated columns and readable dark text. Original evidence screenshots unchanged.
- Added desktop-only pointer-revealed halftone/illustration texture to case study and homepage on this preview branch. Main remains unchanged; mobile content/styles untouched.
- Retained opt-in original synthesized audio; no Harry Potter recording added.
- QA: 1363px desktop hero, paper opening, homepage, no horizontal overflow; screen viewer opens and Escape closes; JS syntax and diff whitespace checks pass. Physical mobile and other viewport sizes not visually tested.

## Paper spread refinement — 27 October
- Desktop sheets overlap with native scrolling; long sheets remain readable before holding. Anchor markers support backward chapter navigation; reduced motion disables sticky sheets.
- Compact opening, consistent speech bubbles, smaller applicant alternatives, and stronger linked next-issue cover.
- Removed purple comparison field overlays and heavy evidence hover boxes; preserved source screenshots and keyboard focus indicators.
- Confined sheet painting to the case-study root. Main branch and mobile source unchanged. No commercial recording added.
- QA: desktop visual inspection at 1363px, backward chapter navigation, no horizontal overflow, JavaScript syntax and diff checks. Other viewport sizes and physical devices not visually tested. Dense evidence sections remain longer than one viewport to preserve readability.
