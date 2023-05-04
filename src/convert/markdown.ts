import showdown from "showdown";
const converter = new showdown.Converter();
export const markdownToHtml = (markdown) => converter.makeHtml(markdown);
export const htmlToMarkdown = (html) => converter.makeMarkdown(html);
