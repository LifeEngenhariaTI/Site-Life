import sharp from 'sharp';
import { join } from 'node:path';

const assets = [
  'locacao-chiller',
  'projetos-engenharia',
  'banco-sangue',
  'qualidade-ar',
];

await Promise.all(assets.map((name) => sharp(join('public', 'assets', `${name}.png`))
  .resize({ width: 1200, withoutEnlargement: true })
  .webp({ quality: 80, effort: 6 })
  .toFile(join('public', 'assets', `${name}.webp`))));

console.log(`Imagens otimizadas: ${assets.length}`);
