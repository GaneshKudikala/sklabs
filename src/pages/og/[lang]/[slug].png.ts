import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ogEntries } from '../../../lib/og';

export const getStaticPaths: GetStaticPaths = async () =>
  (await ogEntries()).map((e) => ({ params: { lang: e.lang, slug: e.slug }, props: e }));

const font = (file: string) =>
  readFileSync(join(process.cwd(), 'node_modules/@fontsource/inter/files', file));
const regular = font('inter-latin-400-normal.woff');
const bold = font('inter-latin-700-normal.woff');
const clamp = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

export const GET: APIRoute = async ({ props }) => {
  const { title, description } = props as { title: string; description: string };
  const el = (type: string, style: Record<string, unknown>, children?: unknown) => ({
    type,
    props: { style: { display: 'flex', ...style }, children },
  });
  const tree = el(
    'div',
    {
      width: '100%',
      height: '100%',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: '#ffffff',
      padding: 72,
      fontFamily: 'Inter',
    },
    [
      el('div', { alignItems: 'center', gap: 16 }, [
        el('div', { width: 20, height: 56, background: '#f5b52a', borderRadius: 4 }),
        el('div', { fontSize: 40, fontWeight: 700, color: '#0b1220', letterSpacing: 4 }, 'SK LABS'),
      ]),
      el('div', { flexDirection: 'column', gap: 24 }, [
        el(
          'div',
          { fontSize: 68, fontWeight: 700, color: '#0b1220', lineHeight: 1.1 },
          clamp(title, 80),
        ),
        el('div', { fontSize: 30, color: '#3b4560', lineHeight: 1.35 }, clamp(description, 150)),
      ]),
      el('div', { height: 8, width: '100%', flexShrink: 0, background: '#f5b52a' }),
    ],
  );
  const svg = await satori(tree as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: bold, weight: 700, style: 'normal' },
    ],
  });
  const png = new Resvg(svg).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
