import { Platform } from "react-native";

/**
 * Torna a versão web instalável (PWA) e com comportamento de app nativo:
 * manifest, service worker, viewport travado (sem zoom de pinça ou de foco
 * em inputs) e ajustes de CSS. No nativo é um no-op.
 */
export function registerWebPwa(): void {
  if (Platform.OS !== "web" || typeof document === "undefined") return;

  const base = document.baseURI;

  // Viewport de app: sem zoom, ocupando a tela toda (inclusive notch).
  let viewport = document.querySelector<HTMLMetaElement>(
    'meta[name="viewport"]',
  );
  if (!viewport) {
    viewport = document.createElement("meta");
    viewport.name = "viewport";
    document.head.appendChild(viewport);
  }
  viewport.content =
    "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";

  const metas: [string, string][] = [
    ["theme-color", "#F6F7ED"],
    ["mobile-web-app-capable", "yes"],
    ["apple-mobile-web-app-capable", "yes"],
    ["apple-mobile-web-app-status-bar-style", "default"],
    ["apple-mobile-web-app-title", "HubAcad"],
  ];
  for (const [name, content] of metas) {
    if (!document.querySelector(`meta[name="${name}"]`)) {
      const meta = document.createElement("meta");
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    }
  }

  if (!document.querySelector('link[rel="manifest"]')) {
    const link = document.createElement("link");
    link.rel = "manifest";
    link.href = new URL("manifest.webmanifest", base).href;
    document.head.appendChild(link);
  }

  if (!document.querySelector('link[rel="apple-touch-icon"]')) {
    const appleIcon = document.createElement("link");
    appleIcon.rel = "apple-touch-icon";
    appleIcon.href = new URL("pwa-icon.png", base).href;
    document.head.appendChild(appleIcon);
  }

  // CSS de app: sem scroll horizontal, sem seleção de texto acidental,
  // sem zoom automático do iOS ao focar inputs (fonte >= 16px).
  if (!document.getElementById("hubacad-app-css")) {
    const style = document.createElement("style");
    style.id = "hubacad-app-css";
    style.textContent = `
      html, body {
        overflow-x: hidden;
        overscroll-behavior: none;
        touch-action: pan-x pan-y;
        -webkit-text-size-adjust: 100%;
        -webkit-tap-highlight-color: transparent;
      }
      body {
        user-select: none;
        -webkit-user-select: none;
      }
      input, textarea {
        user-select: text;
        -webkit-user-select: text;
        font-size: 16px !important;
      }
      #root {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
      }
    `;
    document.head.appendChild(style);
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
