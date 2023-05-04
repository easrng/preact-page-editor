import showdown from "showdown";
const converter = new showdown.Converter({
  noHeaderId: true,
});
export const markdownToHtml = (markdown) => converter.makeHtml(markdown);
export const htmlToMarkdown = (html) => converter.makeMarkdown(html);
