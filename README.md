# Narke portfolio

A responsive static portfolio built with HTML, CSS design tokens, and plain deferred JavaScript. No bundler, framework, application server, or database is required.

## Run locally

From the project directory:

```powershell
npx --yes serve . -l 8000
```

Open http://localhost:8000. The command downloads the static server if it is not cached. Alternatives: VS Code Live Server, `python -m http.server 8000` if permitted, or opening index.html directly. Clipboard behavior and analytics differ under file://.

The portfolio does not require npm install. Node.js 24 LTS is recommended for development checks. The existing analytics dependency is retained; the page uses Vercel's hosted analytics script rather than bundling the npm package.

## Structure

- index.html: page content, project ordering, semantic contact form, and links.
- css/variables.css: colors, fonts, and spacing tokens.
- css/base.css: reset, layout primitives, and accessibility utilities.
- css/components.css: reusable components.
- css/animations.css: optional motion with visible content by default.
- css/responsive.css: 900px, 720px, and 480px layout overrides.
- js/funnel.js: inquiry paths, summary, copy fallback, and submission state.
- js/nav.js: mobile menu, Escape handling, and breakpoint reset.
- js/accordion.js: project expansion, accessibility state, and content resizing.
- js/reveal.js: optional entry animation respecting reduced motion.
- tests/behavior.test.cjs: isolated behavioral regression tests.
- AUDIT.md: review history and remediation notes.

## Contact form

The form uses a public Formspree endpoint configured in index.html and js/funnel.js. Update both together when changing accounts. An endpoint ID is public configuration, not a credential.

One form-submit handler supports clicks and keyboard submission. Native validation runs before a payload snapshot is captured. Pending-request state prevents concurrent sends, including when fields are edited. Inactive inquiry fieldsets are disabled and excluded from FormData. A 15-second timeout restores the interface if no confirmation arrives.

Drafts remain after success or failure, preserving edits made during a request. A timeout means delivery is unconfirmed, not necessarily rejected. Manual resubmission after completion remains possible; server-side deduplication belongs to the receiving service.

A polite live region announces results. If clipboard access is missing or denied, the summary is selected for manual copying. A direct email link provides another contact path. User values enter the summary through textContent rather than HTML.

Without JavaScript, project descriptions and mobile navigation remain visible. Project inquiries fall back to a normal HTTPS POST. Hiring inquiries can use the direct email link; recruiter field switching, the summary, and Copy require JavaScript.

## Responsive and accessible behavior

- Project columns become a single column on tablets and phones.
- Fluid contact padding, zero-minimum grid tracks, and wrapped text prevent narrow-screen compression.
- Footer links wrap, and contact actions stack on phones.
- Secondary text uses a higher-contrast color across dark surfaces.
- Accordion sections become collapsible only after initialization; collapsed links are inert and hidden from the accessibility tree.
- ResizeObserver updates expanded content heights when layout or fonts change.
- Mobile navigation closes at desktop widths; Escape closes it and restores focus.
- Reduced-motion preferences disable animations and smooth scrolling.

## Verification

```powershell
npm test
npm run check
```

No additional test dependencies are needed. Tests use Node's built-in runner and mocked browser APIs; no email is sent. Coverage includes duplicate-request prevention, payload snapshots, draft preservation, inactive inquiry paths, invalid email, failed and timed-out requests, clipboard recovery, navigation state, and accordion resizing. Syntax checks cover all application scripts.

Before publication, manually check 320px, 375px, 480px, 720px, 900px, and desktop widths plus 200% zoom. Check horizontal overflow, full expanded content, reachable contact actions, keyboard focus, Escape navigation, screen-reader announcements, reduced motion, and JavaScript-disabled navigation/content. Isolated tests do not establish browser rendering or assistive-technology compatibility.

## Content maintenance

Project order: Dawuro Proverbs, Barkot, SSGI FIX, LexiAI. Keep each aria-controls value matched to a unique panel ID and renumber sequentially. data-default-expanded sets the enhanced initial state; unenhanced sections are expanded for readability.

The production panel lists Dawuro Proverbs. Its store listing and version are editorial information, not uptime monitoring. Barkot records a local deployment rehearsal with VPS deployment pending. Distinguish available source code, frontend demos, and operational full-stack deployments. Confirm the scope and destination of LexiAI's existing Vercel deployment claim before counting it as a production system. The unsupported two-platform statistic was removed.

## Hosting and security boundaries

Deploy static files over HTTPS. Vercel Web Analytics must be enabled for /_vercel/insights/script.js; that route is normally unavailable under generic local servers. Google Fonts is external, with system fonts as the fallback.

There is no application backend or authentication layer in this repository. Configure and verify production security headers at the host: frame restrictions, content-type sniffing protection, and a tested Content Security Policy compatible with Google Fonts, Formspree, and analytics. Account for inline styles and the existing inline analytics bootstrap before enforcing strict CSP. Verify HTTPS and headers against the deployed domain.

Formspree owns server-side validation, spam controls, rate limits, and delivery. Verify those controls in its dashboard. Browser validation and disabled buttons are usability safeguards, not abuse prevention. Never place secrets in browser code, commit .env files, or expose client-sensitive details in public project descriptions.

## Favicon assets

Browser, bookmark, and home-screen icons live in assets/images/favicon/. The HTML links to the ICO fallback, 16px and 32px PNGs, the 180px Apple touch icon, and site.webmanifest. The manifest names the portfolio and uses 192px/512px Android icons with paths relative to the manifest, so assets also resolve under a subdirectory deployment. Browser display mode preserves normal navigation; the manifest does not add offline functionality.

When replacing icons, preserve their declared dimensions and update the HTML or manifest if filenames change. Browsers cache favicons aggressively; use a fresh tab or clear the site's cached data when verifying a replacement after deployment.
