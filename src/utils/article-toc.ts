import { parseFragment, serialize, type DefaultTreeAdapterTypes } from 'parse5';

type Node = DefaultTreeAdapterTypes.Node;

export interface TocHeading {
  id: string;
  text: string;
  depth: 2 | 3;
}

export interface TocSection extends TocHeading {
  children: TocHeading[];
}

function walk(node: Node, visit: (node: Node) => void): void {
  visit(node);
  if ('childNodes' in node) {
    for (const child of node.childNodes) walk(child, visit);
  }
}

function textContent(node: Node): string {
  if ('value' in node) return node.value;
  if ('tagName' in node && ['script', 'style'].includes(node.tagName)) return '';
  return 'childNodes' in node ? node.childNodes.map(textContent).join('') : '';
}

function slugify(text: string): string {
  return text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'section';
}

export function buildArticleToc(html: string): {
  html: string;
  headings: TocHeading[];
  sections: TocSection[];
} {
  const tree = parseFragment(html);
  const reserved = new Set<string>();
  const encountered = new Set<string>();
  const headings: TocHeading[] = [];

  walk(tree, (node) => {
    if ('attrs' in node) {
      const id = node.attrs.find((attribute) => attribute.name === 'id')?.value;
      if (id) reserved.add(id);
    }
  });

  walk(tree, (node) => {
    if (!('tagName' in node)) return;
    const attribute = node.attrs.find((item) => item.name === 'id');
    const existingId = attribute?.value;
    if (node.tagName !== 'h2' && node.tagName !== 'h3') {
      if (existingId) encountered.add(existingId);
      return;
    }
    const text = textContent(node).replace(/\s+/g, ' ').trim();
    if (!text) return;
    let id = existingId;
    if (!id || encountered.has(id)) {
      const base = slugify(text);
      id = base;
      let suffix = 2;
      while (reserved.has(id)) id = `${base}-${suffix++}`;
      if (attribute) attribute.value = id;
      else node.attrs.push({ name: 'id', value: id });
      reserved.add(id);
    }
    encountered.add(id);
    headings.push({ id, text, depth: node.tagName === 'h2' ? 2 : 3 });
  });

  const sections: TocSection[] = [];
  for (const heading of headings) {
    const parent = sections.at(-1);
    if (heading.depth === 3 && parent?.depth === 2) parent.children.push(heading);
    else sections.push({ ...heading, children: [] });
  }
  return { html: serialize(tree), headings, sections };
}
