export interface TextBlock {
  style: string;
  type: "text";
  text: string;
  pre: boolean;
  uuid: string;
}
export interface HtmlBlock {
  style: string;
  type: "html";
  html: string;
  uuid: string;
}
export type Block = TextBlock | HtmlBlock;
export interface Page {
  blocks: Block[];
  title: string;
  lang: string;
  theme: string;
  cssProps: string;
}
import type A11yDialog from "a11y-dialog";
import type { ComponentChildren } from "preact";
export type Dialogs = {
  edit?: A11yDialog;
  settings?: A11yDialog;
  editDialogContent: ComponentChildren;
  setEditDialogContent: (ComponentChildren?) => void;
};
