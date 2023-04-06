import saveAs from "https://esm.sh/file-saver@2.0.5";
import { Fragment, h, render } from "https://esm.sh/preact@10.13.1";
import {
  useEffect,
  useRef,
  useState,
} from "https://esm.sh/preact@10.13.1/hooks";
import { RenderPage } from "../components/RenderPage.tsx";
import type { Block, HtmlBlock, Page, TextBlock } from "../types.ts";
export function savePage(parsedPage: Page) {
    const doc = new DOMParser().parseFromString(
      String
        .raw`<!DOCTYPE html><html lang="__LANG__"><head><title>__TITLE__</title><meta charset="utf-8" /><meta content="IE=edge" http-equiv="X-UA-Compatible" /><meta content="width=device-width,initial-scale=1" name="viewport" /><link href="https://simple-page-editor.glitch.me/style.css" rel="stylesheet" /><link href="" rel="stylesheet" id="theme" /><script src="https://simple-page-editor.glitch.me/editor.js"></script></head><body><div id="page"><div id="main">__CONTENT__</div></div></body></html>`,
      "text/html",
    );
    doc.documentElement.lang = parsedPage.lang;
    doc.title = parsedPage.title;
    const mainPreact = <RenderPage page={parsedPage} editor={false} />;
    const f = document.createDocumentFragment();
    render(mainPreact, f);
    doc.body.children[0].children[0].innerHTML = f.children[0].innerHTML;
    doc.documentElement.setAttribute("style", parsedPage.cssProps);
    (doc.querySelector("link#theme") as HTMLLinkElement).href = parsedPage.theme;
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