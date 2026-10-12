/**
 * Writes the FAQPage JSON-LD in faq.html from the visible questions and answers, so search
 * engines see exactly what readers see. Replaces the block between
 * `<!-- faq-schema:start -->` and `<!-- faq-schema:end -->`.
 *
 * Run: node scripts/faq-schema.mjs        (update faq.html)
 *      node scripts/faq-schema.mjs --check (fail if it's out of date; used in CI)
 * No dependencies.
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../faq.html', import.meta.url);
const START = '<!-- faq-schema:start -->';
const END = '<!-- faq-schema:end -->';

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', mdash: '—', ndash: '–', rarr: '→' };

function decode(entity) {
  if (entity.startsWith('#x')) return String.fromCodePoint(parseInt(entity.slice(2), 16));
  if (entity.startsWith('#')) return String.fromCodePoint(Number(entity.slice(1)));
  if (entity in ENTITIES) return ENTITIES[entity];
  throw new Error(`faq.html: unknown entity &${entity}; (add it to ENTITIES)`);
}

function text(html) {
  return html
    .replace(/<\/(p|li)>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (_, entity) => decode(entity))
    .replace(/\s+/g, ' ')
    .trim();
}

const page = readFileSync(FILE, 'utf8');
const items = [...page.matchAll(/<details[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<div class="answer">([\s\S]*?)<\/div>\s*<\/details>/g)].map(
  ([, question, answer]) => ({
    '@type': 'Question',
    name: text(question),
    acceptedAnswer: { '@type': 'Answer', text: text(answer) },
  })
);
// Every <details> must have been read; one in an unexpected shape would otherwise be left
// out of the structured data without anyone noticing.
const detailsCount = (page.match(/<details[\s>]/g) ?? []).length;
if (items.length === 0 || items.length !== detailsCount) {
  throw new Error(
    `faq.html has ${detailsCount} <details> but ${items.length} matched the expected ` +
      '<details><summary>…</summary><div class="answer">…</div></details> shape.'
  );
}

const json = JSON.stringify(
  { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items },
  null,
  2
)
  .split('\n')
  .map((line) => `      ${line}`)
  .join('\n');

const start = page.indexOf(START);
const end = page.indexOf(END);
if (start < 0 || end < start) {
  throw new Error(`faq.html has no ${START} … ${END} block`);
}
const next =
  page.slice(0, start + START.length) +
  `\n    <script type="application/ld+json">\n${json}\n    </script>\n    ` +
  page.slice(end);

if (process.argv.includes('--check')) {
  if (next !== page) {
    console.error('faq.html: the FAQPage JSON-LD is out of date. Run node scripts/faq-schema.mjs');
    process.exitCode = 1;
  } else {
    console.log(`faq.html: JSON-LD matches ${items.length} questions.`);
  }
} else {
  writeFileSync(FILE, next);
  console.log(`faq.html: wrote JSON-LD for ${items.length} questions.`);
}
