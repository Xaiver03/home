---
name: blog-clippings-import
description: Import a folder of Obsidian Markdown clippings into this repository's production blog, update matching posts by title, preserve image links, categorize the posts, and organize the source notes. Use when asked to batch-publish, replace, synchronize, or organize Markdown/WeChat clipping articles for the blog.
---

# Blog Clippings Import

Use `apps/blog-api/scripts/importClippings.js`. It recursively reads Markdown files, ignores macOS `._` sidecars, strips only the first Obsidian frontmatter block from published content, upserts records by title, and writes post bodies to the blog storage directory.

## Workflow

1. Locate the clipping directory and inspect every Markdown file. Keep remote image URLs in the body. Do not invent cover images.
2. Run the focused importer test and a local preflight:

   ```bash
   pnpm --filter blog-api test -- importClippings.test.js
   node apps/blog-api/scripts/importClippings.js "<clippings-dir>" --dry-run
   ```

3. Read the public article list before writing. Match existing posts by title. Treat a title match as an update; otherwise create a new published post.
4. Before touching production, connect through `ssh finlaw` and export the current article rows, categories, and body files to `/opt/home/backups/`. Keep the generated backup path in the final report.
5. Copy the importer and source directory to a unique temporary path on the server. Run the remote `--dry-run` first:

   ```bash
   cd /opt/home/apps/blog-api
   NODE_ENV=pro node scripts/importClippings-<timestamp>.js /tmp/<batch>/Clippings --dry-run
   ```

6. Run the same command without `--dry-run`. The importer uses one database transaction. If it fails, stop and verify that the article and type counts are unchanged before attempting a fix.
7. Verify all requested titles exist as `publish`, every corresponding `/file/article/<id>.md` file is readable, and the public listing count includes the imported posts.
8. Only after production verification, move local notes into folders named after their blog category. Add `category`, `blog_article_id`, and `blog-published` tags to each note's initial frontmatter.

## Constraints

- The production database metadata columns use `utf8mb3`; keep titles and introductions free of non-BMP characters such as emoji. Preserve those characters in Markdown body files.
- Preserve publication dates when the clipping provides a valid date. Reject invalid dates during preflight.
- Do not write frontmatter into published article bodies. Preserve later `---` horizontal rules.
- Do not upload a cover unless the user explicitly provides or chooses one.
- Do not use server credentials from repository files or print secrets.
- Do not deploy application code merely to import content. Copy the verified importer to a timestamped temporary server filename and remove it after verification if it is not being shipped.

## Required Report

Report the source folder, backup path, created and updated counts, category count, missing-content count, public article count after import, and whether local Obsidian notes were organized. Mention any skipped covers or unsupported metadata characters.
