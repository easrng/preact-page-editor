import { MutableRef, useEffect, useMemo, useRef, useState } from "preact/hooks";
import type { Block, Dialogs, Page } from "../types.js";
import Sortable from "sortablejs";
import { markdownToHtml } from "../convert/markdown.js";
function BlockEditor(
  { setBlock, block, styles }: {
    block: Block;
    setBlock: (Block) => void;
    styles: [string, string][];
  },
) {
  return (
    <div style="display:flex;flex-direction:column">
      <label>
        Style:
        <select
          value={block.style}
          onChange={(e) => {
            const newStyle = (e.target as HTMLSelectElement).value;
            setBlock({ ...block, style: newStyle });
          }}
        >
          {styles.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label class="matter-input-filled">
        <textarea
          placeholder=" "
          value={block.markdown}
          onInput={(e) => {
            const newMarkdown = (e.target as HTMLTextAreaElement).value;
            setBlock({
              ...block,
              markdown: newMarkdown,
            });
          }}
        />
        <span>Markdown</span>
      </label>
    </div>
  );
}
function RenderBlock(
  { block, editor, onUpdate, onMove, dialogs, styles }: {
    block: Block;
    editor: boolean;
    onUpdate: (Block) => void;
    onMove: (number) => void;
    dialogs: MutableRef<Dialogs>;
    styles: [string, string][];
  },
) {
  const [editing, setEditing] = useState(false);
  let handle = null;
  if (editor) {
    const toggleEditing = () => setEditing(!editing);
    handle = (
      <div class="section-handle">
        <button
          class="matter-icon-button matter-button-text edit-icon"
          onClick={toggleEditing}
        >
          <span>Edit</span>
        </button>
        <div
          class="matter-icon-button matter-button-text drag-handle"
          title="drag or use arrow keys to reorder"
          role="button"
          tabIndex={0}
          onKeyDown={(e) =>
            ["ArrowDown", "ArrowUp"].includes(e.key) &&
            e.preventDefault()}
          onKeyUp={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              const t = e.target as HTMLElement;
              e.preventDefault();
              if (document.activeElement === t) {
                setTimeout(() => {
                  // idk why this is needed but the button was losing focus without it :/
                  t.focus();
                }, 0);
              }
              if (e.key === "ArrowDown") {
                onMove(1);
              } else if (e.key === "ArrowUp") {
                onMove(-1);
              }
            }
          }}
        >
          <span />
        </div>
      </div>
    );
  }
  if (editor) {
    useEffect(() => {
      if (!editing) return;
      dialogs.current.edit!.show();
      const hideHandler = () => {
        setEditing(false);
        dialogs.current.edit!.off("hide", hideHandler);
      };
      dialogs.current.edit!.on("hide", hideHandler);
      return () => {
        dialogs.current.edit!.hide();
        dialogs.current.setEditDialogContent(null);
      };
    }, [editing]);
    useEffect(() => {
      if (!editing) return;
      dialogs.current.setEditDialogContent(
        {
          header: (
            <button
              class="matter-icon-button matter-button-text deletebutton"
              onClick={() => {
                const hideHandler = () => {
                  onUpdate(null);
                  dialogs.current.edit!.off("hide", hideHandler);
                };
                dialogs.current.edit!.on("hide", hideHandler);
                dialogs.current.edit!.hide();
              }}
            >
              <span>Delete</span>
            </button>
          ),
          body: (
            <BlockEditor block={block} setBlock={onUpdate} styles={styles} />
          ),
        },
      );
    }, [editing, block]);
  }
  const memoizedHtml = useMemo(() => {
    return { __html: markdownToHtml(block.markdown) };
  }, [block.markdown]);
  return (
    <div
      class={"block b-html" +
        (block.style ? " s-" + block.style : "")}
      key={block.uuid}
    >
      {handle}
      <div
        dangerouslySetInnerHTML={memoizedHtml}
        class="content"
      >
      </div>
    </div>
  );
}
export function RenderPage(
  { page, editor, onUpdate, dialogs, styles }: {
    page: Page;
    editor: true;
    onUpdate: (newPage: Page) => void;
    dialogs: MutableRef<Dialogs>;
    styles: [string, string][];
  } | {
    page: Page;
    editor: false;
    onUpdate?: undefined;
    dialogs?: undefined;
    styles?: undefined;
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
          blocks: newBlock
            ? page.blocks.map((e) => e === block ? newBlock : e)
            : page.blocks.filter((e) => e !== block),
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
      dialogs={dialogs}
      styles={styles}
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
