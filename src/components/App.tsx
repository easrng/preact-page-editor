import { RenderPage } from "./RenderPage.js";
import { savePage } from "../convert/pageToHtml.js";
import A11yDialog from "a11y-dialog";
import { useEffect, useRef, useState } from "preact/hooks";
import type { Block, Dialogs, HtmlBlock, Page, TextBlock } from "../types.js";
import { ThemePicker } from "./ThemePicker.js";
export function App({ parsedPage }: { parsedPage: Page }) {
  const [editDialogContent, setEditDialogContent] = useState(null);
  const dialogs = useRef<Dialogs>({ editDialogContent, setEditDialogContent });
  const [page, setPage] = useState(parsedPage);
  const [styles, setStyles] = useState<[string, string][]>([[
    "default",
    "Default",
  ]]);
  const editDialog = useRef<HTMLDivElement>(null);
  const settingsDialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function setupAnimations(dialog) {
      (dialog._listeners["hide"] = dialog._listeners["hide"] || []).unshift(
        async (event) => {
          const real = [...dialog._listeners["hide"]];
          while (dialog._listeners["hide"].pop()) {}
          const el = dialog.$el as HTMLElement;
          el.style.display = "flex";
          await new Promise((cb) => setTimeout(cb, 0));
          for (let item of real) dialog._listeners["hide"].push(item);
          if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
            const content = el.querySelector(".dialog-content") as HTMLElement;
            await Promise.all([
              el.querySelector(".dialog-overlay").animate([
                { opacity: "1" },
                { opacity: "0" },
              ], {
                duration: 150,
                iterations: 1,
                easing: "linear",
              }).finished,
              content.animate([
                { opacity: "1" },
                { opacity: "0" },
              ], {
                duration: 75,
                iterations: 1,
                easing: "linear",
              }).finished.then(() => {
                content.style.opacity = "0";
              }),
            ]);
            content.style.opacity = "";
          }
          el.style.display = "";
          for (const listener of real.slice(1)) {
            listener(dialog.$el, event);
          }
        },
      );
      dialog.on("show", async () => {
        const el = dialog.$el as HTMLElement;
        if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
          await Promise.all([
            el.querySelector(".dialog-overlay").animate([
              { opacity: "0" },
              { opacity: "1" },
            ], {
              duration: 150,
              iterations: 1,
              easing: "linear",
            }).finished,
            el.querySelector(".dialog-content").animate([
              { opacity: "0" },
              { opacity: "1" },
            ], {
              duration: 75,
              iterations: 1,
              easing: "linear",
            }).finished,
            el.querySelector(".dialog-content").animate([
              { transform: "scale(0.8)" },
              { transform: "scale(1)" },
            ], {
              duration: 150,
              iterations: 1,
              easing: "cubic-bezier(0, 0, 0.2, 1)",
            }).finished,
          ]);
        }
      });
      return dialog;
    }
    dialogs.current.edit = setupAnimations(
      new A11yDialog(
        editDialog.current!,
      ),
    );
    dialogs.current.settings = setupAnimations(
      new A11yDialog(
        settingsDialog.current!,
      ),
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
        dialogs={dialogs}
        styles={styles}
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
                uuid: crypto.randomUUID(),
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
              {editDialogContent?.header}
              <button
                class="matter-icon-button matter-button-text closebutton"
                data-a11y-dialog-hide
              >
                <span>Close dialog</span>
              </button>
            </div>
            {editDialogContent?.body}
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
            <ThemePicker
              page={page}
              onUpdate={(newPage) => setPage(newPage)}
              setStyles={setStyles}
            />
          </div>
        </div>
      </div>
    </>
  );
}
