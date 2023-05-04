import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeParse from "rehype-parse";
import rehypeStringify from "rehype-stringify";
import remarkStringify from "remark-stringify";
import rehypeRemark from "rehype-remark";
export const markdownToHtml = (markdown) => {
  const file = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeStringify)
    .processSync(markdown);
  return file.toString();
};
export const htmlToMarkdown = (html) => {
  const file = unified()
    .use(rehypeParse)
    .use(rehypeRemark)
    .use(remarkStringify)
    .processSync(html);
  return file.toString();
};
