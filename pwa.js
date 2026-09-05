// Direct file access remains supported; PWA features require HTTPS or localhost.
if ("serviceWorker" in navigator && window.isSecureContext &&
    ["https:", "http:"].includes(window.location.protocol)) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("オフライン機能を登録できませんでした。", error);
    });
  });
}
