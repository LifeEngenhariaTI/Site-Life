import { notFound } from 'next/navigation';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import LegacyEnhancements from '../legacy-enhancements';
import { defaultDescription, jsonLd, routePath, siteName, siteUrl, socialImage } from '../seo';

const root = process.cwd();

function pagePath(slug = []) {
  return path.join(root, ...slug, 'index.html');
}

function secureFormMarkup(body, slug) {
  const formKind = slug[0] === 'privacidade' ? 'privacy' : slug[0] === 'transparencia' ? 'transparency' : null;
  if (!formKind) return body;
  return body
    .replace(/<form class="institutional-form" data-mail-form[^>]*>/, `<form class="institutional-form" data-mail-form data-form-kind="${formKind}"><label class="honeypot" aria-hidden="true">Não preencha este campo<input name="website" tabindex="-1" autocomplete="off"></label>`)
    .replace('Seu aplicativo de e-mail será aberto com a solicitação preenchida. Revise e confirme o envio ao encarregado.', 'A solicitação será enviada pelo canal seguro da Life diretamente ao encarregado.')
    .replace('Ao continuar, seu aplicativo de e-mail será aberto com a mensagem preenchida. Revise o conteúdo e confirme o envio.', 'A comunicação será enviada pelo canal seguro da Life. Evite incluir dados pessoais sensíveis que não sejam necessários.')
    .replace('Preparar solicitação LGPD', 'Enviar solicitação LGPD');
}

function optimizeImageMarkup(body) {
  const replacements = {
    'locacao-chiller.png': 'locacao-chiller.webp',
    'projetos-engenharia.png': 'projetos-engenharia.webp',
    'banco-sangue.png': 'banco-sangue.webp',
    'qualidade-ar.png': 'qualidade-ar.webp',
  };
  return Object.entries(replacements).reduce(
    (html, [original, optimized]) => html.replaceAll(`/assets/${original}`, `/assets/${optimized}`),
    body,
  );
}

async function getLegacyPage(slug) {
  try {
    const source = await readFile(pagePath(slug), 'utf8');
    const title = source.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || 'Life Engenharia';
    const description = source.match(/<meta name="description" content="([^"]*)"/i)?.[1];
    const body = source.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1];
    if (!body) return null;
    return { title, description, body: secureFormMarkup(optimizeImageMarkup(body), slug) };
  } catch {
    return null;
  }
}

async function collectRoutes(directory, segments = []) {
  const entries = await readdir(directory, { withFileTypes: true });
  const ignoredDirectories = new Set(['assets', 'app', 'public', 'deploy', 'scripts', 'node_modules', '.next', 'out', 'qa_security_report', 'qa_email_report', 'qa_email_report_final']);
  const routes = (await Promise.all(entries.filter((entry) => entry.isDirectory() && !ignoredDirectories.has(entry.name)).map(async (entry) => {
    const nextSegments = [...segments, entry.name];
    const nested = await collectRoutes(path.join(directory, entry.name), nextSegments);
    try {
      await readFile(pagePath(nextSegments));
      return [{ slug: nextSegments }, ...nested];
    } catch {
      return nested;
    }
  }))).flat();
  return routes;
}

export async function generateStaticParams() {
  return [{ slug: [] }, ...(await collectRoutes(root))];
}

export async function generateMetadata({ params }) {
  const { slug = [] } = await params;
  const page = await getLegacyPage(slug);
  if (!page) return {};
  const pathname = routePath(slug);
  const description = page.description || defaultDescription;
  return {
    title: page.title.replace(/\s*\|\s*Life Engenharia\s*$/i, ''),
    description,
    alternates: { canonical: pathname },
    openGraph: {
      title: page.title,
      description,
      url: pathname,
      type: 'website',
      locale: 'pt_BR',
      siteName,
      images: [{ url: socialImage, width: 1200, height: 630, alt: `${siteName} — engenharia para operações que não podem parar` }],
    },
    twitter: { card: 'summary_large_image', title: page.title, description, images: [socialImage] },
  };
}

export default async function Page({ params }) {
  const { slug = [] } = await params;
  const page = await getLegacyPage(slug);
  if (!page) notFound();
  const pathname = routePath(slug);
  const crumbs = [
    { '@type': 'ListItem', position: 1, name: 'Início', item: `${siteUrl}/` },
    ...slug.map((segment, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: index === slug.length - 1 ? page.title.replace(/\s*\|\s*Life Engenharia\s*$/i, '') : segment.replaceAll('-', ' '),
      item: `${siteUrl}/${slug.slice(0, index + 1).join('/')}/`,
    })),
  ];

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: page.body }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${siteUrl}${pathname}#webpage`,
        url: `${siteUrl}${pathname}`,
        name: page.title,
        description: page.description || defaultDescription,
        inLanguage: 'pt-BR',
        isPartOf: { '@id': `${siteUrl}/#website` },
        about: { '@id': `${siteUrl}/#organization` },
        breadcrumb: { '@type': 'BreadcrumbList', itemListElement: crumbs },
      }) }} />
      <LegacyEnhancements />
    </>
  );
}
