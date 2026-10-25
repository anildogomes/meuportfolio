// Consulta compacta o status dos workflows do repositorio.
import { execFileSync } from 'node:child_process';

const REPO = 'anildogomes/meuportfolio';

const token = (() => {
  const out = execFileSync('git', ['credential', 'fill'], {
    input: 'protocol=https\nhost=github.com\n\n',
    encoding: 'utf8',
  });
  const line = out.split('\n').find((l) => l.startsWith('password='));
  return line ? line.slice('password='.length).trim() : null;
})();

const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
if (token) headers.Authorization = `Bearer ${token}`;

const get = async (path) => {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  return res.json();
};

const runs = await get(`/repos/${REPO}/actions/runs?per_page=8`);
console.log('--- RUNS ---');
for (const r of runs.workflow_runs || []) {
  console.log(
    `${r.status}/${r.conclusion || '-'} | ${r.name} | ${r.head_sha.slice(0, 7)} | ${r.created_at} | ${r.html_url}`
  );
}

const pages = await get(`/repos/${REPO}/pages`);
console.log('\n--- PAGES ---');
console.log('build_type:', pages.build_type, '| source:', JSON.stringify(pages.source), '| url:', pages.html_url);
