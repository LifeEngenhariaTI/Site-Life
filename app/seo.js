export const siteUrl = 'https://life.eng.br';
export const siteName = 'Life Engenharia';
export const defaultDescription = 'Soluções em engenharia, refrigeração, climatização e tecnologia hospitalar para operações que não podem parar.';
export const socialImage = '/assets/life-mobilizacao.jpeg';

export function routePath(slug = []) {
  return slug.length ? `/${slug.join('/')}/` : '/';
}

export function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
