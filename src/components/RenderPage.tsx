import { useEffect, useRef } from "preact/hooks";
import type { Block, Page } from "../types.js";
import Sortable from "sortablejs";
function RenderBlock(
  { block, editor, openEditor }: {
    block: Block;
    editor: boolean;
    openEditor: () => void;
  },
) {
  let handle = null;
  if (editor) {
    handle = (
      <div
        class="section-handle matter-icon-button matter-button-text"
        title="drag to reorder, click to edit"
        onClick={() => openEditor()}
      >
      </div>
    );
  }
  const Tag = block.type == "text" && block.pre ? "pre" : "div";
  return (
    <div
      class={"block b-" +
        block.type +
        (block.style ? " s-" + block.style : "")}
    >
      {handle}
      {block.type == "html"
        ? (
          <div
            dangerouslySetInnerHTML={{ __html: block.html }}
            class="content"
          >
          </div>
        )
        : <Tag class="content">{block.text}</Tag>}
    </div>
  );
}
export function RenderPage(
  { page, editor, onUpdate }: {
    page: Page;
    editor: true;
    onUpdate: (newPage: Page) => void;
  } | {
    page: Page;
    editor: false;
    onUpdate?: undefined;
  },
) {
  const blockElements = page.blocks.map((block) => (
    <RenderBlock
      block={block}
      editor={editor}
      openEditor={() => {
        // TODO: editor
      }}
    />
  ));
  const mainRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<{ page: Page }>({ page });
  useEffect(() => {
    pageRef.current.page = page;
  }, [page]);
  useEffect(() => {
    if (editor && mainRef.current) {
      new Sortable(mainRef.current, {
        animation: 150,
        ghostClass: "dragging",
        handle: ".section-handle",
        onSort: function (event) {
          const page = pageRef.current.page;
          const newBlocks = [...page.blocks];
          const moved = newBlocks.splice(event.oldIndex || 0, 1)[0];
          newBlocks.splice(event.newIndex || 0, 0, moved);
          onUpdate({ ...page, blocks: newBlocks });
        },
      });
    }
  }, [editor]);
  return (
    <div id="main" class={editor ? "editing" : ""} ref={mainRef}>
      {blockElements}
    </div>
  );
}
