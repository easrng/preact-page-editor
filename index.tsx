import { Fragment, h, render } from "https://esm.sh/preact@10.13.1";
import { parsePage } from "./convert/htmlToPage.ts";
import { App } from "./components/App.tsx";
import { useEffect, useRef } from "https://esm.sh/preact@10.13.1/hooks";
function EditButtonFooter() {
  const ele = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setTimeout(() => {
      ele.current!.style.opacity = "1";
    }, 1);
  }, []);
  return (
    <div class="editor-components">
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
render(<EditButtonFooter />, pageStuffFragment);
document.querySelector("#page")!.append(pageStuffFragment);
