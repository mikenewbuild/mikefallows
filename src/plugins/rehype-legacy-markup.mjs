import { visit } from 'unist-util-visit';

// Reproduces the heading anchor and footnote markup that markdown-it produced
// for the Eleventy site, which the stylesheet and existing deep links rely on.

const addClass = (node, name) => {
  node.properties.className = [...(node.properties.className ?? []), name];
};

const textOf = (node) => (node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join(''));

// markdown-it-anchor's default slugify, kept so existing #fragment links resolve.
const slugify = (text) => encodeURIComponent(text.trim().toLowerCase().replace(/\s+/g, '-'));

export default function rehypeLegacyMarkup() {
  return (tree) => {
    const usedIds = new Set();

    visit(tree, 'element', (node, index, parent) => {
      const { tagName, properties } = node;

      if (/^h[1-6]$/.test(tagName) && properties.id !== 'footnote-label') {
        const slug = slugify(textOf(node));
        let id = slug;
        for (let n = 1; usedIds.has(id); n++) id = `${slug}-${n}`;
        usedIds.add(id);

        properties.id = id;
        properties.tabIndex = -1;
        node.children.push(
          { type: 'text', value: ' ' },
          {
            type: 'element',
            tagName: 'a',
            properties: { className: ['direct-link'], href: `#${properties.id}` },
            children: [{ type: 'text', value: '#' }],
          },
        );
      }

      if (tagName === 'sup' && node.children.some((child) => child.properties?.dataFootnoteRef !== undefined)) {
        addClass(node, 'footnote-ref');
      }

      if (tagName === 'a' && properties.dataFootnoteBackref !== undefined) {
        addClass(node, 'footnote-backref');
      }

      if (tagName === 'section' && properties.dataFootnotes !== undefined) {
        parent.children.splice(index, 0, {
          type: 'element',
          tagName: 'hr',
          properties: { className: ['footnotes-sep'] },
          children: [],
        });
        visit(node, 'element', (child) => {
          if (child.tagName === 'ol') addClass(child, 'footnotes-list');
          if (child.tagName === 'li') addClass(child, 'footnote-item');
        });
        return index + 2;
      }
    });
  };
}
