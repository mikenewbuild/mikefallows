import GithubSlugger from 'github-slugger';
import { visit } from 'unist-util-visit';

// Reproduces the heading anchor and footnote markup that markdown-it produced
// for the Eleventy site, which the stylesheet and existing deep links rely on.

const addClass = (node, name) => {
  node.properties.className = [...(node.properties.className ?? []), name];
};

const textOf = (node) => (node.type === 'text' ? node.value : (node.children ?? []).map(textOf).join(''));

// markdown-it-anchor's default slugify, which the Eleventy site used for ids.
// Kept as aliases so existing #fragment links still resolve.
const legacySlugify = (text) => encodeURIComponent(text.trim().toLowerCase().replace(/\s+/g, '-'));

export default function rehypeLegacyMarkup() {
  return (tree) => {
    const slugger = new GithubSlugger();
    const usedLegacyIds = new Set();

    visit(tree, 'element', (node, index, parent) => {
      const { tagName, properties } = node;

      if (/^h[1-6]$/.test(tagName) && properties.id !== 'footnote-label') {
        const text = textOf(node);
        const legacySlug = legacySlugify(text);
        let legacyId = legacySlug;
        for (let n = 1; usedLegacyIds.has(legacyId); n++) legacyId = `${legacySlug}-${n}`;
        usedLegacyIds.add(legacyId);

        properties.id = slugger.slug(text);
        if (legacyId !== properties.id) {
          node.children.unshift({ type: 'element', tagName: 'span', properties: { id: legacyId }, children: [] });
        }
        properties.tabIndex = -1;
        node.children.push(
          { type: 'text', value: ' ' },
          {
            type: 'element',
            tagName: 'a',
            properties: { className: ['direct-link'], href: `#${properties.id}`, ariaLabel: 'Link to this section' },
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
