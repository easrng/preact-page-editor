const loaded = new Promise((cb) => self.addEventListener("load", cb));
(async () => {
  try {
    const registration = await navigator.serviceWorker.register("./sw.js"); // u may want to use /sw.js instead
    if (!registration.active) {
      await new Promise((cb) => {
        const sw = registration.installing || registration.waiting;
        const handler = () => {
          if (sw.state === "activated") {
            sw.removeEventListener("statechange", handler);
            cb();
          }
        };
        sw.addEventListener("statechange", handler);
      });
    }
    await loaded;
    await import("./index.tsx");
  } catch (err) {
    console.error(err);
    document.body.textContent = "there was an error loading the page sorry :/";
  }
})();
