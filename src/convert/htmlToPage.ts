import type { Block, Page } from "../types.js";
import { htmlToMarkdown } from "./markdown.js";

export function parsePage(): Page {
  const main = document.querySelector("#main");
  if (!main) {
    throw new Error("malformed page");
  }
  const blocks: Block[] = Array.from(main.children).map((child) => {
    let block: Block;
    let style = "default";
    let type;
    child.classList.forEach((className) => {
      if (className.startsWith("b-")) {
        type = className.slice(2);
      }
      if (className.startsWith("s-")) {
        style = className.slice(2);
      }
    });
    if (type === "html") {
      block = {
        type: "markdown",
        markdown: htmlToMarkdown(child.children[0].innerHTML),
        style,
        uuid: crypto.randomUUID(),
      };
    } else if (type === "text") {
      block = {
        type: "markdown",
        markdown: htmlToMarkdown(
          (child.children[0] instanceof HTMLPreElement ? "<pre>" : "") +
            Object.assign(document.createElement("div"), {
              innerText: child.children[0].textContent || "",
            }).innerHTML +
            (child.children[0] instanceof HTMLPreElement ? "</pre>" : ""),
        ),
        style,
        uuid: crypto.randomUUID(),
      };
    } else {
      throw new Error("unknown block type");
    }
    return block;
  });
  const themeLink = document.querySelector<HTMLLinkElement>("link#theme");
  if (!themeLink) {
    throw new Error("malformed page");
  }
  return {
    blocks,
    title: document.title,
    lang: document.documentElement.lang,
    theme: themeLink.href,
    cssProps: document.documentElement.getAttribute("style") || "",
  };
}
