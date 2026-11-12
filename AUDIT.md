# Portfolio audit

Reviewed 2026-11-12 before the project replacement: index.html, all five CSS files, all four JavaScript files, README.md, .gitignore, and the local package manifests. This is a static site; there is no application backend, database, authentication, or build pipeline. The contact form uses an external Formspree service. Existing untracked package.json and package-lock.json were preserved.

## Fixed with this change

- Replaced Kech Delivery in the production panel and third case study with Dawuro Proverbs, retaining the accordion, three-column content structure, typography, design tokens, chips, and existing button styles.
- Added production and repository links, version 1.0.3 (build 5), and source-backed architecture details. Did not add unsupported performance or adoption metrics.
- Corrected the mobile Stack navigation target, which pointed at a nonexistent #matrix.
- Made collapsed accordion content inert and aria-hidden so hidden project links are excluded from keyboard navigation and the accessibility tree.
- Removed a stray comma from the footer element's attributes.

## Remaining findings

| Priority | Location | Finding and recommended follow-up |
| --- | --- | --- |
| Medium | js/funnel.js: refresh / send handler | Editing a field while a request is pending can re-enable the send button. Track submission state independently and prevent duplicate submissions. |
| Medium | js/funnel.js: updateFieldVisibility | Hidden client/recruiter inputs remain enabled, so FormData includes defaults from both inquiry paths. Disable inactive controls before submission. |
| Medium | js/funnel.js: copy handler | Clipboard access has no unavailable-API guard or rejection handler. File previews and denied permissions can fail without feedback. Provide a selectable-text fallback. |
| Medium | css/animations.css; css/components.css | Reveal elements and accordion bodies start hidden in CSS. If JavaScript fails or is disabled, key content remains invisible. Use progressive enhancement so content is visible by default. |
| Medium | css/variables.css: --text-faint | #5C6479 has approximately 2.8:1 contrast against #121A2E, below the 4.5:1 target for normal text. Review muted labels and captions throughout the site. |
| Low | js/accordion.js | Expanded panel height updates on window resize but not on web-font loading or other content size changes. Consider ResizeObserver on panel content. |
| Low | js/nav.js | Mobile menu state is not reset at the desktop breakpoint, and its accessible label remains Open menu when expanded. Reset on breakpoint changes and synchronize the label. |
| Low | index.html: status panel | Operational labels and performance figures for other projects are static editorial claims, not live monitoring. Validate their evidence separately. |
| Low | package.json; README.md | No project check scripts or setup documentation; the local @vercel/analytics dependency is not referenced by page scripts. Decide whether analytics integration is intended before adding tooling. |

The external contact service was not submitted to during this audit. No deployment or account changes were made. Browser rendering and assistive-technology behavior require a browser verification pass; static checks do not establish those results.

## Project sources

- Repository overview: https://github.com/NahumDm/Dawurogna-figurative-speaking/blob/master/README.md
- Version and dependencies: https://github.com/NahumDm/Dawurogna-figurative-speaking/blob/master/pubspec.yaml (1.0.3+5)
- App bootstrap and Provider wiring: https://github.com/NahumDm/Dawurogna-figurative-speaking/blob/master/lib/main.dart
- Local proverb repository: https://github.com/NahumDm/Dawurogna-figurative-speaking/blob/master/lib/data/repositories/proverbs_repository.dart
- Hive favorites: https://github.com/NahumDm/Dawurogna-figurative-speaking/blob/master/lib/features/favorites/data/favorite_repository.dart
- Production listing: https://play.google.com/store/apps/details?id=com.narke.dawuro_proverb

The version is the repository declaration; the public Play Store page reviewed did not expose its installed version. Core reading and favorites are offline; sharing, update checks, and external links can require other apps or connectivity.

## Barkot addition review

Re-audited the complete tracked portfolio source before adding Barkot as case study 02. Existing findings above remain follow-up items. Dawuro remains first and initially expanded; SSGI FIX and LexiAI are now 03 and 04. All four accordion controls retain unique matching panel IDs.

The Barkot README was read for business scope, architecture, tools, security, testing, and delivery status. Frontend package.json and backend requirements/base.txt corroborate the stack. The engineering handoff corroborates domain rules and records the local deployment rehearsal. These are upstream documentation claims; the Barkot application and its test suites were not run as part of this portfolio edit.

Barkot covers POS, ledger-based inventory, expenses, derived financial balances, payroll approval separation, PDF reports, and four staff roles. Stack: Next.js 16, React, TypeScript, Tailwind CSS, Django 5.2, DRF, PostgreSQL, Docker Compose, Nginx; pytest, Vitest, and Playwright. Redis/Celery are explicitly not in use and were not attributed to Barkot.

The README says VPS deployment remains pending client decisions. Barkot was therefore added only to the showcase, not to the operational production panel or shipped-system count. The showcase introduction now accommodates both production apps and systems awaiting deployment. No production URL or system-wide release version was invented.

The review also found and corrected regressions introduced during the earlier reorder: Dawuro's stale logistics subtitle and literal question marks in its separator and external-link labels. HTML entities preserve these characters across Windows shell encodings.

Responsive behavior reuses the existing three-column desktop / single-column tablet case grid, wrapped stack chips and actions, and the 480px phone heading and padding rules. Browser rendering remains unverified.

Sources:
- https://github.com/NahumDm/barkot_internal_system/blob/main/README.md
- https://github.com/NahumDm/barkot_internal_system/blob/main/frontend/package.json
- https://github.com/NahumDm/barkot_internal_system/blob/main/backend/requirements/base.txt
- https://github.com/NahumDm/barkot_internal_system/blob/main/docs/ENGINEERING_HANDOFF.md

## Remediation update

The nine findings from the subsequent codebase review have been addressed locally: submission state is independent of validation; inactive paths use disabled fieldsets; drafts survive requests; clipboard failures offer manual selection; feedback is announced; contact/footer layouts wrap; secondary text contrast is increased; essential content is visible without JavaScript; and navigation resets at the desktop breakpoint. The unsupported platform-count statistic was removed. Accordion sizing observes content changes.

Original findings above are historical review notes, not a statement that these defects remain open. README.md documents current operation, regression checks, delivery-status distinctions, and hosting/service security responsibilities. Production headers, provider abuse controls, and LexiAI's full-stack deployment status require external verification. No live contact request was sent during testing.
