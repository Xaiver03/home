import { access } from 'node:fs/promises';
import { join } from 'node:path';

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname;
  const prefix = '/blog/_nuxt/';

  if (!pathname.startsWith(prefix) || !pathname.includes('/builds/meta/')) {
    return;
  }

  const relativePath = pathname.slice('/blog/'.length).replace(/^\/+/, '');
  const filePath = join(process.cwd(), '.output/public', relativePath);

  try {
    await access(filePath);
  } catch {
    setResponseStatus(event, 404);
    return '';
  }
});
