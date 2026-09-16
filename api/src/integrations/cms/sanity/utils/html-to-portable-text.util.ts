import { randomBytes } from 'crypto';
import { parse, HTMLElement, Node, NodeType } from 'node-html-parser';

interface PortableTextSpan {
  _type: 'span';
  _key: string;
  text: string;
  marks: string[];
}

interface PortableTextMarkDef {
  _key: string;
  _type: 'link';
  href: string;
}

interface PortableTextBlock {
  _type: 'block';
  _key: string;
  style: 'normal' | 'h2' | 'h3' | 'blockquote';
  listItem?: 'bullet' | 'number';
  level?: number;
  children: PortableTextSpan[];
  markDefs: PortableTextMarkDef[];
}

const BLOCK_STYLE_BY_TAG: Record<string, PortableTextBlock['style']> = {
  h2: 'h2',
  h3: 'h3',
  blockquote: 'blockquote',
};

function key(): string {
  return randomBytes(6).toString('hex');
}

// Walks inline content (text, strong/b, em/i, s/del, a) collecting spans and
// link markDefs for a single block-level element. Tiptap's StarterKit only
// ever nests these inline nodes, so no deeper recursion is needed.
function collectInline(
  node: Node,
  activeMarks: string[],
  spans: PortableTextSpan[],
  markDefs: PortableTextMarkDef[],
) {
  if (node.nodeType === NodeType.TEXT_NODE) {
    const text = node.rawText;
    if (!text) return;
    spans.push({ _type: 'span', _key: key(), text, marks: [...activeMarks] });
    return;
  }

  if (node.nodeType !== NodeType.ELEMENT_NODE) return;
  const el = node as HTMLElement;
  const tag = el.tagName?.toLowerCase();

  if (tag === 'strong' || tag === 'b') {
    el.childNodes.forEach((child) =>
      collectInline(child, [...activeMarks, 'strong'], spans, markDefs),
    );
    return;
  }
  if (tag === 'em' || tag === 'i') {
    el.childNodes.forEach((child) =>
      collectInline(child, [...activeMarks, 'em'], spans, markDefs),
    );
    return;
  }
  if (tag === 's' || tag === 'del' || tag === 'strike') {
    el.childNodes.forEach((child) =>
      collectInline(child, [...activeMarks, 'strike-through'], spans, markDefs),
    );
    return;
  }
  if (tag === 'a') {
    const href = el.getAttribute('href') ?? '';
    const markKey = key();
    markDefs.push({ _key: markKey, _type: 'link', href });
    el.childNodes.forEach((child) =>
      collectInline(child, [...activeMarks, markKey], spans, markDefs),
    );
    return;
  }

  el.childNodes.forEach((child) =>
    collectInline(child, activeMarks, spans, markDefs),
  );
}

function toBlock(
  el: HTMLElement,
  overrides: Partial<
    Pick<PortableTextBlock, 'style' | 'listItem' | 'level'>
  > = {},
): PortableTextBlock {
  const spans: PortableTextSpan[] = [];
  const markDefs: PortableTextMarkDef[] = [];
  el.childNodes.forEach((child) => collectInline(child, [], spans, markDefs));

  return {
    _type: 'block',
    _key: key(),
    style:
      overrides.style ??
      BLOCK_STYLE_BY_TAG[el.tagName?.toLowerCase() ?? ''] ??
      'normal',
    ...(overrides.listItem
      ? { listItem: overrides.listItem, level: overrides.level ?? 1 }
      : {}),
    children:
      spans.length > 0
        ? spans
        : [{ _type: 'span', _key: key(), text: '', marks: [] }],
    markDefs,
  };
}

// Converts the fixed HTML node set produced by the app's Tiptap StarterKit
// editor (h2/h3/p/ul/ol/li/blockquote/strong/em/s/a) into Sanity Portable
// Text blocks. Not a general-purpose HTML sanitizer/converter.
export function htmlToPortableText(
  html: string | null | undefined,
): PortableTextBlock[] {
  if (!html) return [];

  const root = parse(html);
  const blocks: PortableTextBlock[] = [];

  root.childNodes.forEach((node) => {
    if (node.nodeType !== NodeType.ELEMENT_NODE) return;
    const el = node as HTMLElement;
    const tag = el.tagName?.toLowerCase();

    if (tag === 'ul' || tag === 'ol') {
      el.querySelectorAll('li').forEach((li) => {
        blocks.push(
          toBlock(li, { listItem: tag === 'ul' ? 'bullet' : 'number' }),
        );
      });
      return;
    }

    if (tag === 'p' || tag === 'h2' || tag === 'h3' || tag === 'blockquote') {
      blocks.push(toBlock(el));
      return;
    }

    // Unknown top-level tags are flattened into a normal paragraph block.
    blocks.push(toBlock(el, { style: 'normal' }));
  });

  return blocks;
}
