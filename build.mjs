// Genera las páginas de error en dist/ a partir de src/template.html y src/pages.mjs.
// Uso: node build.mjs
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { pages } from './src/pages.mjs';

const OUT = 'dist';
const MAX_BYTES = 1_500_000; // límite de Cloudflare para páginas personalizadas

const COLOR = { ok: 'var(--ok)', fail: 'var(--fail)', block: 'var(--fail)', wait: 'var(--wait)', idle: 'var(--line)' };
const LINE = { ok: 'ok-line', bad: 'bad-line', wait: 'wait-line', idle: 'idle-line' };
const X = [40, 320, 600];

function icon(state, cx) {
  const c = COLOR[state];
  switch (state) {
    case 'ok':
      return `<path d="M${cx - 8} 40l6 6 11-12" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'fail':
      return `<path d="M${cx - 7} 33l14 14M${cx + 7} 33l-14 14" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
    case 'block':
      return `<path d="M${cx - 8} 40h16" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`;
    case 'wait':
      return [-6, 0, 6].map((d) => `<circle cx="${cx + d}" cy="40" r="2" fill="${c}"/>`).join('');
    default:
      return '';
  }
}

function diagram(page) {
  const [l1, l2] = page.lines;
  const anchors = [['start', 22], ['middle', 320], ['end', 618]];
  const nodes = page.nodes.map(([state, name, sub], i) => {
    const [anchor, tx] = anchors[i];
    return [
      `      <circle class="node" cx="${X[i]}" cy="40" r="18" stroke="${COLOR[state]}"/>`,
      `      ${icon(state, X[i])}`,
      `      <text x="${tx}" y="84" text-anchor="${anchor}">${name}</text>`,
      `      <text x="${tx}" y="102" text-anchor="${anchor}" class="sub">${sub}</text>`,
    ].join('\n');
  });
  return `  <div class="path" role="img" aria-label="${page.aria}">
    <svg viewBox="0 0 640 110">
      <line class="${LINE[l1]}" x1="60" y1="40" x2="290" y2="40"/>
      <line class="${LINE[l2]}" x1="350" y1="40" x2="580" y2="40"/>
${nodes.join('\n')}
    </svg>
  </div>
`;
}

function render(template, page) {
  const vars = {
    TITLE: page.heading,
    CODE: page.code,
    HEADING: page.heading,
    LEAD: page.lead,
    DIAGRAM: diagram(page),
    CHALLENGE: page.challenge ? `  <div class="challenge">${page.token}</div>\n` : '',
    STEPS: page.steps.map((s) => `      <li>${s}</li>`).join('\n'),
    ACTION: page.action ? `    ${page.action}` : '',
    BOX: page.challenge ? '' : `\n    <div class="box">${page.token}</div>`,
  };
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in vars)) throw new Error(`Variable desconocida {{${key}}} en la plantilla`);
    return vars[key];
  });
}

function validate(page, html) {
  const errors = [];
  if (!html.includes(page.token)) errors.push(`falta el token obligatorio ${page.token}`);
  if (!/<head>[\s\S]*<\/head>/i.test(html)) errors.push('faltan las etiquetas <head></head>');
  if (/<meta[^>]+name=["']referrer["']/i.test(html)) errors.push('no puede incluir <meta name="referrer">');
  const size = Buffer.byteLength(html);
  if (size > MAX_BYTES) errors.push(`pesa ${size} bytes (máximo ${MAX_BYTES})`);
  if (errors.length) throw new Error(`${page.slug}.html: ${errors.join('; ')}`);
}

function index() {
  const rows = pages
    .map(
      (p) => `      <tr>
        <td><a href="/${p.slug}">${p.label}</a></td>
        <td><code>${p.type}</code></td>
        <td><code>/${p.slug}</code></td>
        <td><code>${p.token}</code></td>
      </tr>`,
    )
    .join('\n');
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Páginas de error</title>
<style>
  :root { --bg: #eef2f5; --ink: #10222f; --muted: #51636f; --line: #b9c6cf; --panel: #ffffff; }
  @media (prefers-color-scheme: dark) {
    :root { --bg: #0d1a23; --ink: #e8eff3; --muted: #9fb0bb; --line: #35505f; --panel: #132530; }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font-family: "Avenir Next", "Segoe UI", system-ui, -apple-system, sans-serif; line-height: 1.55; padding: 56px 16px; }
  main { max-width: 900px; margin: 0 auto; }
  h1 { font-size: clamp(1.8rem, 5vw, 2.6rem); letter-spacing: -0.02em; margin: 0 0 12px; }
  p { color: var(--muted); max-width: 64ch; }
  .wrap { overflow-x: auto; background: var(--panel); border: 1px solid var(--line); border-radius: 6px; margin-top: 28px; }
  table { border-collapse: collapse; width: 100%; font-size: .9rem; }
  th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--line); white-space: nowrap; }
  tr:last-child td { border-bottom: 0; }
  th { color: var(--muted); font-weight: 600; }
  a { color: inherit; font-weight: 600; }
  code { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: .85em; }
</style>
</head>
<body>
<main>
  <h1>Páginas de error personalizadas</h1>
  <p>Asigna cada URL en <strong>Cloudflare → tu dominio → Reglas → Páginas personalizadas</strong> (Custom Error Pages). Usa la ruta sin <code>.html</code>: Cloudflare Pages redirige las rutas con extensión y Cloudflare solo acepta respuestas <code>200 OK</code>.</p>
  <div class="wrap">
    <table>
      <thead><tr><th>Tipo de página</th><th>ID de API</th><th>Ruta</th><th>Token obligatorio</th></tr></thead>
      <tbody>
${rows}
      </tbody>
    </table>
  </div>
</main>
</body>
</html>
`;
}

const template = await readFile('src/template.html', 'utf8');
await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

for (const page of pages) {
  const html = render(template, page);
  validate(page, html);
  await writeFile(`${OUT}/${page.slug}.html`, html);
  console.log(`✔ ${OUT}/${page.slug}.html  (${page.type})`);
}

await writeFile(`${OUT}/index.html`, index());
await writeFile(`${OUT}/_headers`, '/*\n  X-Robots-Tag: noindex, nofollow\n  Access-Control-Allow-Origin: *\n');
console.log(`✔ ${OUT}/index.html`);
