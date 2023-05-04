export interface Block {
  style: string;
  type: "markdown";
  markdown: string;
  uuid: string;
}
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
  editDialogContent: {
    header: ComponentChildren;
    body: ComponentChildren;
  };
  setEditDialogContent: ({ header, body }: {
    header: ComponentChildren;
    body: ComponentChildren;
  }) => void;
};
