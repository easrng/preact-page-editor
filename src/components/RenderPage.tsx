import { MutableRef, useEffect, useRef, useState } from "preact/hooks";
import { createPortal } from "preact/compat";
import type { Block, Dialogs, Page } from "../types.js";
import Sortable from "sortablejs";
import A11yDialog from "a11y-dialog";
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
      <label>
        Type:
        <select
          value={block.type}
          onChange={(e) => {
            const newType = (e.target as HTMLSelectElement)
              .value as Block["type"];
            setBlock({
              ...(newType === "text"
                ? {
                  type: "text",
                  text: block.type === "text" ? block.text : block.html,
                  pre: false,
                }
                : {
                  type: "html",
                  html: block.type === "text" ? block.text : block.html,
                }),
              style: block.style,
              uuid: block.uuid,
            });
          }}
        >
          <option value="text">Text</option>
          <option value="html">HTML</option>
        </select>
      </label>
      {block.type === "text"
        ? (
          <label class="matter-input-filled">
            <textarea
              placeholder=" "
              value={block.text}
              onInput={(e) => {
                const newText = (e.target as HTMLTextAreaElement).value;
                setBlock({
                  ...block,
                  text: newText,
                });
              }}
            />
            <span>Text</span>
          </label>
        )
        : (
          <label class="matter-input-filled">
            <textarea
              placeholder=" "
              value={block.html}
              onInput={(e) => {
                const newHtml = (e.target as HTMLTextAreaElement).value;
                setBlock({
                  ...block,
                  html: newHtml,
                });
              }}
            />
            <span>HTML</span>
          </label>
        )}
      {block.type === "text" && (
        <label class="matter-checkbox">
          <input
            type="checkbox"
            checked={block.pre}
            onChange={(e) => {
              const newPre = (e.target as HTMLInputElement).checked;
              setBlock({ ...block, pre: newPre });
            }}
          />
          <span>Preformatted</span>
        </label>
      )}
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
          if (
            e.key === "Enter" || e.key === " " || e.key === "ArrowDown" ||
            e.key === "ArrowUp"
          ) {
            const t = e.target as HTMLElement;
            e.preventDefault();
            if (document.activeElement === t) {
              setTimeout(() => {
                // idk why this is needed but the button was losing focus without it :/
                t.focus();
              }, 0);
            }
            if (e.key === "Enter" || e.key === " ") {
              toggleEditing();
            } else if (e.key === "ArrowDown") {
              onMove(1);
            } else if (e.key === "ArrowUp") {
              onMove(-1);
            }
          }
        }}
      >
      </div>
    );
  }
  const Tag = block.type == "text" && block.pre ? "pre" : "div";
  if (editor) {
    useEffect(() => {
      console.log("created " + block.uuid);
    }, []);
    useEffect(() => {
      if (!editing) return;
      dialogs.current.edit!.show();
      const hideHandler = () => {
        setEditing(false);
        dialogs.current.edit!.off("hide", hideHandler);
      };
      dialogs.current.edit!.on("hide", hideHandler);
      return () => {
        console.log("cleanup");
        dialogs.current.edit!.hide();
        dialogs.current.setEditDialogContent(null);
      };
    }, [editing]);
    useEffect(() => {
      if (!editing) return;
      dialogs.current.setEditDialogContent(
        <BlockEditor block={block} setBlock={onUpdate} styles={styles} />,
      );
    }, [editing, block]);
  }
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
