import saveAs from "file-saver";
import { render } from "preact";
import { RenderPage } from "../components/RenderPage.js";
import type { Block, Page } from "../types.js";
const base = new URL(".", import.meta.url).href;
export function savePage(parsedPage: Page) {
  const doc = new DOMParser().parseFromString(
    String
      .raw`<!DOCTYPE html><html lang="__LANG__"><head><title>__TITLE__</title><meta charset="utf-8" /><meta content="IE=edge" http-equiv="X-UA-Compatible" /><meta content="width=device-width,initial-scale=1" name="viewport" /><link rel="stylesheet" id="theme" /><script src="${base}editor.js"></script></head><body><div id="page"><div id="main">__CONTENT__</div></div></body></html>`,
    "text/html",
  );
  doc.documentElement.lang = parsedPage.lang;
  doc.title = parsedPage.title;
  const mainPreact = <RenderPage page={parsedPage} editor={false} />;
  const f = document.createDocumentFragment();
  render(mainPreact, f);
  doc.body.children[0].children[0].innerHTML = f.children[0].innerHTML;
  doc.documentElement.setAttribute("style", parsedPage.cssProps);
  (doc.querySelector("link#theme") as HTMLLinkElement).setAttribute(
    "href",
    parsedPage.theme,
  );
  saveAs(
    new Blob(["<!doctype html>" + doc.documentElement.outerHTML], {
      type: "text/html;charset=utf-8",
    }),
    (location.pathname.split("/").at(-1) || "index.html").replace(
      /\.html?$/,
      "",
    ) + ".html",
  );
}
