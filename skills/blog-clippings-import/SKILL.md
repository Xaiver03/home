---
name: blog-clippings-import
description: "Manage this repository's Obsidian clipping articles across their full blog lifecycle: publish or update only the owner's Markdown posts, organize notes, archive/unpublish posts, permanently delete posts and media, restore from backups, and verify production results. Use when asked to batch-publish, replace, synchronize, organize, take down, archive, delete, or restore Markdown/WeChat clipping articles for the blog."
---

# Blog Clippings Import

Use `apps/blog-api/scripts/importClippings.js` for publish/update operations. It recursively reads Markdown files, ignores macOS `._` sidecars, strips only the first Obsidian frontmatter block from published content, upserts records by title, and writes post bodies to the blog storage directory.

## Owner Filter

Publish only notes whose initial frontmatter author contains `灯下灯`, including aliases such as `灯下灯/Xaiver` and `Xaiver/灯下灯`. Notes without that author marker are external clippings and must stay offline.

The importer enforces this by default. `--include-external` is an exceptional opt-in; do not use it unless the user explicitly requests external content.

## Publish Or Update

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

## Archive Or Restore

- To take a post offline without destroying its content, update the target article records to `status: "archived"`. Preserve the database record, article body, media, popularity, and comments.
- Before changing status, query and print the exact article IDs and titles. Archive only the user-confirmed targets.
- To restore a post, set the same record's status back to `publish`; do not create a duplicate.
- Reflect archival in the corresponding Obsidian frontmatter by replacing `blog-published` with `blog-archived`.

## Permanent Delete

1. Require an explicit list of article IDs or titles. Never delete by a broad category or timestamp alone.
2. Create a new application-level backup in `/opt/home/backups/` containing article rows, article types, and body files.
3. Query comments for every target. If any target has comments, report them and get explicit confirmation before removing user content.
4. The repository's `Article` bulk-delete hook can fail for articles without comments. For a verified no-comment deletion, use `Article.destroy({ hooks: false })` for only the preflighted IDs, then explicitly delete:
   - `/file/article/<id>.md`
   - `/image/articleCover/<id>.png`
   - files under `/image/articleContent/<id>/`
5. Delete an article type only after querying that its article count is zero. Delete its cover only after deleting the empty type.
6. Verify targets no longer appear in the public list or database, their body files are gone, and unrelated articles remain.
7. Move their local notes to an `外部摘录` or archive folder. Remove `blog_article_id` and `blog-published`; never leave an offline note marked as published.

## Restore From Backup

Use the recorded `/opt/home/backups/...json` file. Restore only the approved records, their categories, and their body files. Do not overwrite unrelated current articles. Verify IDs, titles, status, and body readability after restoration.

## Constraints

- Author metadata is mandatory for publishing. Skip and report notes that do not contain `灯下灯`.
- The production database metadata columns use `utf8mb3`; keep titles and introductions free of non-BMP characters such as emoji. Preserve those characters in Markdown body files.
- Preserve publication dates when the clipping provides a valid date. Reject invalid dates during preflight.
- Do not write frontmatter into published article bodies. Preserve later `---` horizontal rules.
- Do not upload a cover unless the user explicitly provides or chooses one.
- Do not use server credentials from repository files or print secrets.
- Do not deploy application code merely to import content. Copy the verified importer to a timestamped temporary server filename and remove it after verification if it is not being shipped.

## Required Report

Report the requested operation, source folder, author-filter result, exact target IDs and titles, backup path, created/updated/archived/deleted/restored counts, category count, comment check, missing-content count, public article count after the operation, and local Obsidian state. Mention any skipped covers, skipped external notes, or unsupported metadata characters.
