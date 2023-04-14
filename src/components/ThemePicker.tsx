import type { ComponentChildren } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import type { Page } from "../types.js";
function link(content: ComponentChildren, href?: string) {
  if (!href) return content;
  return <a href={href}>{content}</a>;
}
export function ThemePicker({ page, onUpdate }: {
  page: Page;
  onUpdate: (newPage: Page) => void;
}) {
  const themeLinkRef = useRef<HTMLLinkElement>(null);
  const [themeStatusContent, setThemeStatusContent] = useState<
    ComponentChildren
  >();
  const [themeStatusClass, setThemeStatusClass] = useState<string>("");
  useEffect(() => {
    const themeLink = themeLinkRef.current!;
    const handlerFor = (type: "load" | "error") =>
      function () {
        console.log(type);
        const oldThemeLink = document.querySelector("link#theme");
        if (oldThemeLink) oldThemeLink.remove();
        const getThemeMetadata = function (name: string, raw?: boolean) {
          const s = getComputedStyle(document.documentElement).getPropertyValue(
            "--" + name,
          );
          if (raw) return s;
          return s.trim().replace(/^['"]|['"]$/g, "");
        };
        const themeName = getThemeMetadata("theme-name");
        const themeOptions = document.querySelector(
          "div#themeoptions",
        ) as HTMLDivElement;
        themeOptions.textContent = "";
        if (themeName) {
          setThemeStatusClass("");
          setThemeStatusContent(
            <>
              Theme{" "}
              <b>
                {link(themeName, getThemeMetadata("theme-link"))}
              </b>{" "}
              by{" "}
              <b>
                {link(
                  getThemeMetadata("author-name"),
                  getThemeMetadata("author-link"),
                )}
              </b>
            </>,
          );
          const styles = getThemeMetadata("styles")
            .split(" ")
            .map((e) => ["s-" + e, getThemeMetadata("s-" + e)]);
          const options = getThemeMetadata("options")
            .split(" ")
            .map((e) => ({
              name: e,
              label: getThemeMetadata("o-" + e + "-label"),
              type: getThemeMetadata("o-" + e + "-type"),
              default: getThemeMetadata("o-" + e + "-default"),
              value: getThemeMetadata("o-" + e + "-value", true),
            }));
          options.map((e) => {
            const label = document.createElement("label");
            label.className = "matter-input-filled oi-type-" + e.type;
            const input = document.createElement("input");
            input.type = e.type;
            input.placeholder = " ";
            input.id = "oi-" + e.name;
            input.value = document.documentElement.style.getPropertyValue(
              "--o-" + e.name + "-value",
            ) || e.default;
            input.oninput = () => {
              document.documentElement.style.setProperty(
                "--o-" + e.name + "-value",
                input.value,
              );
              onUpdate({
                ...page,
                cssProps: document.documentElement.getAttribute("style") || "",
              });
            };
            const name = document.createElement("SPAN");
            name.textContent = e.label;
            label.appendChild(input);
            label.appendChild(name);
            themeOptions.appendChild(label);
          });
        } else if (themeLink.sheet && type !== "error") {
          setThemeStatusClass("warning");
          setThemeStatusContent("That CSS file doesn't include theme metadata");
        } else {
          setThemeStatusClass("error");
          setThemeStatusContent("It doesn't look like that's a CSS file");
        }
      };
    themeLink.addEventListener("error", handlerFor("error"));
    themeLink.addEventListener("load", handlerFor("load"));
    if (themeLink.sheet) themeLink.dispatchEvent(new Event("load"));
  }, []);
  return (
    <>
      <link
        rel="stylesheet"
        type="text/css"
        ref={themeLinkRef}
        href={page.theme}
      />
      <label class="matter-input-filled">
        <input
          value={page.theme}
          type="url"
          placeholder=" "
          onInput={(event) => {
            const themeLink = themeLinkRef.current!;
            let url;
            const value = (event.target as HTMLInputElement).value;
            onUpdate({
              ...page,
              theme: value,
            });
            try {
              url = new URL(value);
            } catch (_e) {
              // ignore
            }
            if (!(url && ["http:", "https:", "data:"].includes(url.protocol))) {
              setThemeStatusClass("error");
              setThemeStatusContent("That's not a valid URL");
            } else {
              setThemeStatusClass("");
              setThemeStatusContent("Loading theme...");
            }
          }}
        />
        <span>Theme CSS</span>
      </label>
      <div class={themeStatusClass} id="themestatus">
        {themeStatusContent}
      </div>
      <div id="themeoptions"></div>
    </>
  );
}
