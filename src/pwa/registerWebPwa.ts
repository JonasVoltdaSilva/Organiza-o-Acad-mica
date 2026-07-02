import { Platform } from "react-native";

/**
 * Torna a versão web instalável (PWA): vincula o manifest e registra
 * o service worker. No nativo é um no-op.
 */
export function registerWebPwa(): void {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

  const base = document.baseURI;

  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = new URL("manifest.webmanifest", base).href;
    document.head.appendChild(link);
  }

  if (!document.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#F6F7ED";
    document.head.appendChild(meta);
  }

  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const appleIcon = document.createElement("link");
    appleIcon.rel = "apple-touch-icon";
    appleIcon.href = new URL("pwa-icon.png", base).href;
    document.head.appendChild(appleIcon);
  }

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register(new URL("sw.js", base).href)
        .catch((err) =>
          console.warn("[HubAcad] Falha ao registrar service worker", err),
        );
    });
  }
}
