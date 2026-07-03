/**
 * Proxy CORS para a API de Web Services do Moodle (AVA da UFR).
 *
 * O ava.ufr.edu.br não envia cabeçalhos Access-Control-Allow-Origin, então o
 * navegador bloqueia chamadas feitas diretamente pelo app web do HubAcad.
 * Este worker só repassa a requisição para o Moodle e devolve a resposta com
 * o cabeçalho CORS adicionado — não grava, não loga e não guarda usuário,
 * senha nem token em nenhum lugar. É só um "cano" transparente.
 */

const MOODLE_HOST = "https://ava.ufr.edu.br";

// Adicione aqui as origens que podem usar este proxy.
const ALLOWED_ORIGINS = [
  "https://jonasvoltdasilva.github.io",
  "http://localhost:8081",
  "http://localhost:19006",
];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    const url = new URL(request.url);
    let targetPath;
    if (url.pathname === "/token") {
      targetPath = "/login/token.php";
    } else if (url.pathname === "/rest") {
      targetPath = "/webservice/rest/server.php";
    } else {
      return new Response("Not found", { status: 404, headers });
    }

    const target = new URL(MOODLE_HOST + targetPath);

    let upstream;
    if (request.method === "POST") {
      const body = await request.text();
      upstream = await fetch(target.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
    } else {
      target.search = url.search;
      upstream = await fetch(target.toString(), { method: "GET" });
    }

    const responseBody = await upstream.text();
    return new Response(responseBody, {
      status: upstream.status,
      headers: {
        ...headers,
        "Content-Type":
          upstream.headers.get("Content-Type") || "application/json",
      },
    });
  },
};
