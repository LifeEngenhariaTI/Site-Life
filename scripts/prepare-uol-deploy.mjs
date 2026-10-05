import { cp, copyFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';

const source = join(process.cwd(), 'deploy', 'uol');
const destination = join(process.cwd(), 'out');

await mkdir(destination, { recursive: true });
await rm(join(destination, 'api'), { recursive: true, force: true });
await rm(join(destination, 'README.md'), { force: true });
await cp(join(source, 'api'), join(destination, 'api'), { recursive: true, force: true });
await copyFile(join(source, '.htaccess'), join(destination, '.htaccess'));
console.log('Pacote UOL pronto em out/');
