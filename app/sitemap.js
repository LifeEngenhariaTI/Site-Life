import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { routePath, siteUrl } from './seo';

export const dynamic = 'force-static';

const root = process.cwd();

async function collectRoutes(directory, segments = []) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.filter((entry) => entry.isDirectory() && !['app', 'public', 'node_modules', '.next'].includes(entry.name)).map(async (entry) => {
    const nextSegments = [...segments, entry.name];
    const nested = await collectRoutes(path.join(directory, entry.name), nextSegments);
    try {
      await readFile(path.join(root, ...nextSegments, 'index.html'));
      return [nextSegments, ...nested];
    } catch {
      return nested;
    }
  }))).flat();
}

export default async function sitemap() {
  const routes = [[], ...(await collectRoutes(root))];
  return routes.map((slug) => ({
    url: `${siteUrl}${routePath(slug)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: slug.length === 0 ? 1 : slug[0] === 'servicos' || slug[0] === 'mercados' ? 0.8 : 0.6,
  }));
}
