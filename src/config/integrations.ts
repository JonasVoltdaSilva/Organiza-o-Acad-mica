/**
 * URL do Cloudflare Worker que faz proxy das chamadas ao Moodle (AVA).
 * Necessário porque ava.ufr.edu.br não envia cabeçalhos CORS, então o
 * navegador bloqueia chamadas feitas diretamente da versão web do app.
 * Veja workers/moodle-proxy/README.md para o passo a passo de deploy.
 *
 * TODO: depois de rodar `wrangler deploy`, troque o valor abaixo pela URL
 * real que o Cloudflare gerar (algo como
 * "https://hubacad-moodle-proxy.SEU-USUARIO.workers.dev").
 */
export const MOODLE_PROXY_URL =
  "https://hubacad-moodle-proxy.jonasvolt.workers.dev";

export const MOODLE_BASE_URL = "https://ava.ufr.edu.br";

/**
 * URL base da API do SUAP da UFR. A integração chama a API v2 padrão do
 * SUAP (POST /api/v2/autenticacao/token/ para login, GET .../boletim/,
 * GET .../horarios/ etc.) diretamente do app nativo — sem proxy, então só
 * funciona fora da versão web (mesma limitação do Moodle acima).
 *
 * Atenção: os nomes de campo e o path exato do endpoint de horário ainda
 * não foram confirmados contra esta instância específica — foram
 * definidos com base na API v2 de referência do SUAP/IFRN. Ajuste
 * src/services/suap.ts assim que a primeira sincronização real mostrar a
 * resposta verdadeira.
 */
export const SUAP_BASE_URL = "https://suap.ufr.edu.br";
