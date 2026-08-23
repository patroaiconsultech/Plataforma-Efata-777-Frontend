# Frontend staging canonical restore

Use this package while the official domain `patroai.com` is NOT yet linked.

## Apply only

- `index.html`
- `public/robots.txt`
- `public/sitemap.xml`

These files restore the technical Railway origin as the current canonical/staging URL.

## Important

Do NOT apply:
`EFATA_FRONTEND_HOTFIX_PATROAI_DOMAIN_TEST_ALIGNMENT_V1`

The existing test already expects the Railway origin, so after restoring these three files
the runtime and tests are aligned again.

## Final release

When the new version is formally ready and `patroai.com` is connected as the custom domain,
perform a separate final-domain cutover that changes, in the same commit:

- `index.html`
- `public/robots.txt`
- `public/sitemap.xml`
- `tests/premium-landing-foundation.test.mjs`

Then validate DNS, HTTPS, canonical, sitemap and social-preview URLs together.
