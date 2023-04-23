import { useEffect, useRef, useState } from "preact/hooks";
import type { Block, Page } from "../types.js";
import Sortable from "sortablejs";
function RenderBlock(
  { block, editor, onUpdate, onMove }: {
    block: Block;
    editor: boolean;
    onUpdate: (Block) => void;
    onMove: (number) => void;
  },
) {
  const [editing, setEditing] = useState(false);
  let handle = null;
  if (editor) {
    const toggleEditing = () => setEditing(!editing);
    handle = (
      <div
        class="section-handle matter-icon-button matter-button-text"
        title="drag to reorder, click to edit"
        onClick={toggleEditing}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          ["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key) &&
          e.preventDefault()}
        onKeyUp={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleEditing();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            onMove(1);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            onMove(-1);
          }
        }}
      >
      </div>
    );
  }
  const Tag = block.type == "text" && block.pre ? "pre" : "div";
  useEffect(() => {
    console.log("created " + block.uuid);
  }, []);
  return (
    <div
      class={"block b-" +
        block.type +
        (block.style ? " s-" + block.style : "")}
      key={block.uuid}
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
  const blockElements = page.blocks.map((block, index) => (
    <RenderBlock
      key={block.uuid}
      block={block}
      editor={editor}
      onUpdate={(newBlock) => {
        const newPage = {
          ...page,
          blocks: [
            ...page.blocks.slice(0, index),
            newBlock,
            ...page.blocks.slice(index + 1),
          ],
        };
        onUpdate && onUpdate(newPage);
      }}
      onMove={(offset) => {
        const newBlocks = [...page.blocks];
        const moved = newBlocks.splice(index || 0, 1)[0];
        newBlocks.splice(
          Math.min(Math.max(index + offset, 0), newBlocks.length),
          0,
          moved,
        );
        onUpdate({ ...page, blocks: newBlocks });
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
