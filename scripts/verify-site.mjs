// Verifica se os assets publicados no GitHub Pages respondem e se contem o conteudo esperado.
const ORIGIN = 'https://anildogomes.github.io';
const BASE = `${ORIGIN}/meuportfolio`;

const html = await fetch(`${BASE}/`, { cache: 'no-store' }).then((r) => r.text());

const check = async (ref, needle) => {
  const url = ref.startsWith('http') ? ref : ORIGIN + ref;
  const res = await fetch(url, { cache: 'no-store' });
  const body = await res.text();
  const found = needle ? body.includes(needle) : null;
  console.log(
    `${url} -> HTTP ${res.status} | bytes=${body.length}` + (found !== null ? ` | contem "${needle}": ${found}` : '')
  );
};

console.log('index.html publicado:');
for (const ref of [...html.matchAll(/(?:src|href)="(\/meuportfolio\/[^"]+)"/g)].map((m) => m[1])) {
  await check(ref, ref.endsWith('.js') ? 'Anildo Gomes' : 'font-display');
}
