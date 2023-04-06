export interface TextBlock {
  style: string;
  type: "text";
  text: string;
  pre: boolean;
}
export interface HtmlBlock {
  style: string;
  type: "html";
  html: string;
}
export type Block = TextBlock | HtmlBlock;
export interface Page {
  blocks: Block[];
  title: string;
  lang: string;
  theme: string;
  cssProps: string;
}
