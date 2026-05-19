# Pre-release checklist

Run all sections before merge or release. Mark each item pass / fail / N/A.

## Performance

- No unnecessary re-renders on hot paths
- No layout shift (CLS) on primary views
- Images optimized (size, format, lazy where appropriate)
- Heavy components code-split or dynamically imported
- Animations use transform/opacity; no `transition: all`
- Server Components used where client JS is not required
- Data fetching avoids waterfalls; caching appropriate

## SEO & metadata

- Page `title` and `description` set per route
- Open Graph tags (og:title, og:description, og:image)
- Twitter card metadata where applicable
- Canonical URL correct for indexable pages
- `robots` / noindex correct for private or draft routes
- Favicon and app icons present
- Structured data only if required and valid

## Accessibility

- Keyboard navigation works for all interactive UI
- Focus visible and logical tab order
- Icon-only controls have accessible names
- Dialogs/sheets trap focus and restore on close
- Form inputs have labels; errors announced
- Color contrast sufficient (text, borders, states)
- Images have alt text; decorative images marked appropriately

## Production quality

- Responsive on mobile, tablet, desktop
- Loading, empty, error, and disabled states handled
- No console errors or obvious hydration mismatches
- UI spacing and typography consistent
- No secrets or env values in client bundle
- Types safe; no obvious `any` on public APIs
- Code maintainable; no duplicated patterns

## Release gate

- [ ] **Ship** — all critical/high issues resolved
- [ ] **Block** — list blockers with file paths and fixes
