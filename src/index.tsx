import { render } from "preact";
import { parsePage } from "./convert/htmlToPage.js";
import { App } from "./components/App.js";
import { useEffect, useRef } from "preact/hooks";
import domLoaded from "dom-loaded";
function EditButtonFooter() {
  const ele = useRef<HTMLDivElement>(null);
  const styles = useRef<HTMLLinkElement>(null);
  useEffect(() => {
    document.head.appendChild(styles.current);
    styles.current.addEventListener("load", () => {
      ele.current!.style.opacity = "1";
    });
  }, []);
  return (
    <div class="editor-components">
      <link
        href={new URL("style/editor.css", import.meta.url).href}
        rel="stylesheet"
        ref={styles}
      />
      <div ref={ele} class="edit-button-footer" style="opacity:0">
        <button
          class="matter-button-outlined"
          onClick={() => {
            const parsedPage = parsePage();
            const pageEle = document.querySelector("#page")!;
            pageEle.textContent = "";
            render(
              <App parsedPage={parsedPage} />,
              pageEle,
            );
          }}
        >
          Edit
        </button>
      </div>
    </div>
  );
}
const pageStuffFragment = document.createDocumentFragment();
render(
  <>
    <EditButtonFooter />
  </>,
  pageStuffFragment,
);
domLoaded.then(() => {
  document.querySelector("#page")!.append(pageStuffFragment);
});
