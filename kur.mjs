// Kisisel icerigi (kisisel.json) sifreleyip sablon.html'den index.html uretir.
//
//   node kur.mjs
//
// Anahtar .anahtar dosyasinda (ilk calismada uretilir) ve YALNIZCA linkin
// sonundaki #k= kisminda: o kisim hicbir sunucuya gitmez. GitHub'daki sayfa
// herkese acik ama icindeki kisisel metin anahtarsiz okunamaz.
// kisisel.json ve .anahtar git'e girmez (.gitignore).
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as c } from 'node:crypto';

const kok = 'https://007checkmate007-dotcom.github.io/screening-room/';

let ham;
if (existsSync('.anahtar')) {
  ham = new Uint8Array(Buffer.from(readFileSync('.anahtar', 'utf8').trim(), 'base64url'));
} else {
  ham = c.getRandomValues(new Uint8Array(16));
  writeFileSync('.anahtar', Buffer.from(ham).toString('base64url') + '\n', { mode: 0o600 });
}

const kisisel = readFileSync('kisisel.json', 'utf8');
JSON.parse(kisisel);   // bozuk JSON sifrelenmesin

const anahtar = await c.subtle.importKey('raw', ham, 'AES-GCM', false, ['encrypt']);
const iv = c.getRandomValues(new Uint8Array(12));
const sifreli = new Uint8Array(await c.subtle.encrypt({ name: 'AES-GCM', iv }, anahtar, new TextEncoder().encode(kisisel)));
const paket = Buffer.concat([Buffer.from(iv), Buffer.from(sifreli)]).toString('base64');

const sablon = readFileSync('sablon.html', 'utf8');
if (!sablon.includes('__PAKET__')) throw new Error('sablon.html icinde __PAKET__ yok');
writeFileSync('index.html', sablon.replace('__PAKET__', paket));

const k = Buffer.from(ham).toString('base64url');
console.log('Lucy icin link :', `${kok}#k=${k}`);
console.log('Senin linkin   :', `${kok}?host#k=${k}`);
