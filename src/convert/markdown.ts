import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import remarkStringify from "remark-stringify";
import rehypeRemark from "rehype-remark";
import { visit } from "unist-util-visit";
import type { Element } from "hast";
import type { Raw } from "hast-util-raw";
import { toHtml } from "hast-util-to-html";
import rehypeRaw from "rehype-raw";
export const markdownToHtml = (markdown) => {
  const mdKey = "md" + Math.floor(Math.random() * 1e17);
  const file = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(() => (tree) => {
      visit(tree, "element", (node: Element) => {
        node.properties[mdKey] = true;
      });
      return tree;
    })
    .use(rehypeRaw)
    .use(() => (tree) => {
      visit(tree, "element", (node) => {
        if (typeof node.properties[mdKey] !== "undefined") {
          delete node.properties[mdKey];
        } else {
          node.properties.dataHtml = true;
        }
      });
      return tree;
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .processSync(markdown);
  return file.toString();
};
export const htmlToMarkdown = (html) => {
  const file = unified()
    .use(rehypeParse)
    .use(() => (tree) => {
      visit(tree, "element", (node: Element) => {
        if (typeof node.properties.dataHtml !== "undefined") {
          delete node.properties.dataHtml;
          const html = toHtml(node);
          const unknownNode = node as unknown;
          for (const prop of Object.keys(unknownNode)) {
            delete unknownNode[prop];
          }
          const rawNode = unknownNode as Raw;
          rawNode.type = "raw";
          rawNode.value = html;
        }
      });
      return tree;
    })
    .use(rehypeRemark, {
      handlers: {
        raw: (h, node, parent) => {
          node.type = "html";
          return node;
        },
      },
    })
    .use(remarkStringify)
    .processSync(html);
  return file.toString();
};
