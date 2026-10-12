# thymeit.lixlink.com

Brochure and help site for **ThymeIt**, the garden planting and pruning calendar app
([`bitPimps/thymeit`](https://github.com/bitPimps/thymeit)). A static site with no build step
and no framework, modeled on [steady.lixlink.com](https://steady.lixlink.com).

The plan (pages, store requirements, and which site sections each app feature touches) lives
in the app repo: [`docs/product/website-plan.md`](https://github.com/bitPimps/thymeit/blob/main/docs/product/website-plan.md).
**The site only describes what the shipped app does.** Never advertise unreleased features.

## Pages

- `index.html`: landing page. Hero with the app's task card, the interactive season ruler
  ("same plants, four ZIP codes"), features, privacy, sources, price. Store badges read
  "Coming soon" until the listings exist.
- `faq.html`: the Help Center. Sections and answers have **stable ids** (`#getting-started`,
  `#restore`, …) that the app's help links will point to: don't rename them. Search and
  `#anchor` deep links (which open the answer) are in `assets/js/main.js`.
- `privacy.html`: privacy policy (the App Store and Google Play listing URL). Change the
  effective date whenever what the app stores or shares changes, before the change ships.
- `delete-data.html`: deleting app data, the iCloud/Google Drive backup and garden files.
- `sources.html`: the publications and datasets behind the timings. The publication list is
  generated from the app (see below).
- `404.html`: not-found page (root-relative paths, since GitHub Pages serves it at any URL).
- `llms.txt`, `robots.txt`, `sitemap.xml`: keep `llms.txt` and the sitemap's `lastmod` dates
  in step with page changes.

Support email used on every page: `thymeit-support@lixlink.com`.

Analytics: every page loads Google Tag Manager container `GTM-WDTZSRVP` (its own GA4
property, like steady.lixlink.com): the script right after `<head>`, the `<noscript>` iframe
right after `<body>`. Add both to any new page. The app itself has no analytics; the privacy
policy's "This website" section says so and must stay true to what the container loads.

## Structure

```
assets/css/style.css   shared stylesheet; brand tokens from the app's brand guidelines,
                       light + dark themes
assets/js/main.js      mobile nav toggle + the season ruler (its data is copied from the
                       app's plant-library review sheet; update it when the library changes)
assets/img/mark.svg    clock + thyme sprig mark (inlined in pages with currentColor)
assets/img/app-icon.svg  white mark on Thyme Green tile; used as the favicon
```

Brand: Thyme Green `#2A5A3A`, Fresh Green `#54A76A`, Timing Orange `#F2994A`, Amber
`#F59E0B`; Outfit for headings and the wordmark (`thyme` green, `it` orange, never
recolored), Inter for body text.

## Deployment

GitHub Pages, **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
`main`, `/ (root)`. Every push to `main` publishes; there's no deploy workflow.

Custom domain: `thymeit.lixlink.com` is in the `CNAME` file. At the DNS provider for
`lixlink.com`, add a `CNAME` record `thymeit` → `bitpimps.github.io`, set the custom domain
under **Settings → Pages**, and tick **Enforce HTTPS** once the certificate is issued.

## Generated parts

- **FAQ structured data:** the FAQPage JSON-LD in `faq.html` is generated from the visible
  questions and answers. After editing the Help Center, run `node scripts/faq-schema.mjs`;
  CI fails if it's out of date.
- **Sources list:** from the app repo, run
  `npm run site:sources -- ../thymeit.lixlink.com/sources.html` (it rewrites the block between
  the `sources:start` / `sources:end` markers from the app's plant library). Re-run it whenever
  the app's content sources change.

## Checks

`.github/workflows/check.yml` runs [lychee](https://github.com/lycheeverse/lychee) on every PR
and push to `main` and fails on any broken internal link, image or `#anchor`. Run it locally:

```
lychee --offline --root-dir "$PWD" --index-files index.html --include-fragments '*.html'
```

Dependabot opens a monthly PR to bump the GitHub Actions versions. Changes also get a
`/code-review` pass before they're pushed to `main` (same rule as the app repo).

## Updating content

Plain HTML/CSS: edit the files directly. When an app feature ships or changes, update the
matching section here (the website plan's feature → site map lists them), and keep every
claim grounded in what the app actually does.
