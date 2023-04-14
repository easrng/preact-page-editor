import { RenderPage } from "./RenderPage.js";
import { savePage } from "../convert/pageToHtml.js";
import A11yDialog from "a11y-dialog";
import { useEffect, useRef, useState } from "preact/hooks";
import type { Block, HtmlBlock, Page, TextBlock } from "../types.js";
import { ThemePicker } from "./ThemePicker.js";
export function App({ parsedPage }: { parsedPage: Page }) {
  const dialogs = useRef<{ edit?: A11yDialog; settings?: A11yDialog }>({});
  const [page, setPage] = useState(parsedPage);
  const editDialog = useRef<HTMLDivElement>(null);
  const settingsDialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    dialogs.current.edit = new A11yDialog(
      editDialog.current!,
    );
    dialogs.current.settings = new A11yDialog(
      settingsDialog.current!,
    );
  }, []);
  useEffect(() => {
    document.title = page.title;
  }, [page.title]);
  useEffect(() => {
    document.documentElement.lang = page.lang;
  }, [page.lang]);
  useEffect(() => {
    document.documentElement.setAttribute("style", page.cssProps);
  }, [page.cssProps]);
  return (
    <>
      <RenderPage
        page={page}
        editor={true}
        onUpdate={(newPage) => setPage(newPage)}
      />
      <div class="editor-components">
        <div class="edit-footer">
          <button
            class="matter-icon-button matter-button-contained"
            id="savebutton"
            onClick={() => {
              savePage(page);
            }}
          >
            <span>Save</span>
          </button>
          <button
            class="matter-icon-button matter-button-contained"
            id="addblockbutton"
            onClick={() => {
              const newData: TextBlock = {
                style: "default",
                type: "text",
                text: "New Block",
                pre: false,
              };
              setPage({ ...page, blocks: [...page.blocks, newData] });
            }}
          >
            <span>Add</span>
          </button>
          <button
            class="matter-icon-button matter-button-contained"
            id="settingsbutton"
            onClick={() => dialogs.current.settings?.show()}
          >
            <span>Settings</span>
          </button>
        </div>
        <div
          aria-labelledby="edit-block-title"
          aria-hidden="true"
          class="dialog-container"
          ref={editDialog}
        >
          <div class="dialog-overlay" data-a11y-dialog-hide></div>
          <div class="dialog-content" role="document">
            <div class="dialog-header">
              <h1 id="edit-block-title">Edit</h1>
              <button
                class="matter-icon-button matter-button-text closebutton"
                data-a11y-dialog-hide
              >
                <span>Close dialog</span>
              </button>
            </div>
          </div>
        </div>
        <div
          aria-labelledby="page-settings-title"
          aria-hidden="true"
          class="dialog-container"
          ref={settingsDialog}
          id="page-settings"
        >
          <div class="dialog-overlay" data-a11y-dialog-hide></div>
          <div class="dialog-content" role="document">
            <div class="dialog-header">
              <h1 id="page-settings-title">Settings</h1>
              <button
                class="matter-icon-button matter-button-text closebutton"
                data-a11y-dialog-hide
              >
                <span>Close dialog</span>
              </button>
            </div>
            <label class="matter-input-filled">
              <input
                type="text"
                placeholder=" "
                value={page.title}
                onInput={function (event) {
                  setPage({
                    ...page,
                    title: (event.target as HTMLInputElement).value,
                  });
                }}
              />
              <span>Title</span>
            </label>
            <ThemePicker page={page} onUpdate={(newPage) => setPage(newPage)} />
          </div>
        </div>
      </div>
    </>
  );
}
