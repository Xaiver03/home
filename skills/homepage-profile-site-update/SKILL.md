---
name: homepage-profile-site-update
description: "Safely update this personal website's profile, homepage text, external site links, honors summaries, and related images through the repository's existing SSH and database workflow. Use when asked to update personal introduction data, add or reorder external sites, upload a profile/site logo, publish selected honors or credentials, or verify and roll back those production content changes."
---

# Homepage Profile and Site Update

Use this Skill for content and asset updates to the personal site `xiangleideng.site`. Do not use it to update the separate `x-c` company website or its company PostgreSQL database.

## Scope

Allowed content targets are limited to the personal site's existing configuration labels and explicitly requested additions:

- `my-avatar`
- `about-basic-info`
- `about-social-links`
- `home-texts`
- `profile-honors`
- `siteLinks` or the checked-in `apps/homepage/src/assets/siteLinks.json` fallback
- selected public honors/credentials summaries

The homepage reads profile data through `apps/homepage/src/App.vue` and normalizes links through `apps/homepage/src/lib/homeContent.js`. Preserve those rules, including QR links, internal `/blog` routes, external URL detection, and logo fallbacks.

## Privacy boundary

Treat the user's private certificate directory as source material, not a deployment directory. Never recursively upload a private folder. Before publishing an honor or credential:

1. Confirm the exact title, category, issuer, date and summary.
2. Mark the item `public` only after the user explicitly selects it.
3. Remove identity numbers, addresses, contact information, private QR codes and unrelated document pages. Redact professional credential numbers unless the user explicitly approves that exact field; public competition-award numbers may remain when the user approves the certificate for clear display.
4. Prefer a text summary or a reviewed public thumbnail with only the necessary fields redacted.
5. Keep original PDFs and high-resolution evidence local unless the user explicitly authorizes publication.

Future credentials such as `高中语文教师资格证` should be added as a new `职业资格` record without changing the component schema. Unknown or incomplete records remain private.

### Honor wall assets

Use `scripts/generate-honor-assets.mjs` for certificate-derived wall thumbnails. Its source allowlist contains relative paths only; provide the reviewed source root with `HONOR_SOURCE_DIR`. Run without `--apply` first, then generate only after the dry-run succeeds.

The generator creates clear 960×640 WebP previews with a softly blurred framing background and strips all metadata. Its allowlist applies normalized, irreversible region masks only to reviewed sensitive fields. The current professional-accounting credential masks document/identity/management numbers and its lookup QR code; approved competition awards remain readable. Keep redaction geometry explicit and test-validated instead of applying a global blur.

- Never add a private absolute source path to code, JSON, logs or configuration.
- Never copy source PDF/JPEG/ZIP files into `public`.
- Never treat CSS `filter: blur()` as redaction; a browser can remove it.
- Honors without an approved safe output use the built-in visual placeholder.
- Verify manifest hashes and inspect a contact sheet before publishing.

## Preflight

Before any production write:

1. Read the current configuration through the personal site's public configuration API or the repository's existing backend tooling.
2. Confirm the target is the personal site deployment and not `x-c`.
3. Validate JSON shape, URL protocols, logo paths, image MIME type, dimensions and SHA-256.
4. For external links, allow only `https://` unless the existing normalizer explicitly supports the requested scheme. Preserve QR behavior.
5. Check that every asset path is inside the personal site's approved public/static or storage path.
6. Run a dry-run that reports target labels, old/new summaries, asset hashes and affected counts without writing.
7. Confirm the public configuration endpoint returns only its explicit label allowlist. For `profile-honors`, it must also filter non-public records and strip fields outside the public display schema; private source metadata must never be exposed by `reception/getConfig`.

Never print passwords, private keys, full database URLs or secret environment values.

## SSH, database and asset update

Use the repository's documented SSH alias and deployment scripts, normally `ssh finlaw` and `scripts/deploy-local.sh`, only after the user has authorized the production update. Do not invent a database dialect or reuse the `x-c` PostgreSQL settings. Resolve the personal site's actual production database and storage configuration from its approved runtime environment on the server.

Before changing a configuration row or replacing an image:

- create a timestamped backup on the server;
- record the configuration `id`, `label`, `type` and old content in the backup without exposing secrets;
- retain the previous image/object path and hash;
- use a transaction or the repository's existing update script;
- update only the allowlisted labels or explicit site-link record;
- verify the row after commit and stop immediately on count or validation mismatch.

Transfer images with the existing SSH/rsync/scp or storage helper. Upload to a temporary path first, verify MIME, dimensions and hash remotely, then promote it. Do not overwrite an unrelated image and do not delete the previous asset until the verification window has passed.

## Verification and rollback

After an update:

1. Read the configuration API again and compare normalized values.
2. Request the homepage and each new external-link/logo URL; record status codes and image content type.
3. Check desktop and mobile layouts for even and odd site counts, long labels, keyboard focus and no horizontal overflow.
4. Run the homepage tests and build.
5. Keep the backup path, changed labels, asset hashes and validation results in the report.
6. Confirm public HTML, JSON and JavaScript contain no local private path, original certificate URL, protected professional credential/identity number or source archive name.

If any verification fails, stop publishing, restore the prior configuration and asset from the timestamped backup, and re-run the same read-only checks. Never claim production success when SSH, database, build or HTTP verification is incomplete.

## Required report

Report:

- target site and environment;
- requested labels/items and public/private decisions;
- created backup path;
- old/new normalized summaries;
- asset paths, MIME types, dimensions and hashes;
- dry-run, database, build and HTTP verification results;
- rollback status or remaining blocker.
