import { getSitemapUrls } from '../../utils/sitemap-urls';

export default defineEventHandler(async () => ({
  urls: await getSitemapUrls(),
}));
