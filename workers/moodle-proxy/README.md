# Proxy CORS do Moodle (AVA) para o HubAcad

O `ava.ufr.edu.br` (Moodle) não envia cabeçalhos CORS, então o navegador
bloqueia chamadas feitas diretamente pela versão web do HubAcad. Este worker
gratuito da Cloudflare só repassa a chamada e adiciona o cabeçalho —
**não guarda usuário, senha nem token em nenhum lugar**, é só um "cano".

## Deploy (uma vez, leva ~2 minutos)

1. Crie uma conta gratuita em https://dash.cloudflare.com/sign-up (se ainda não tiver).
2. Nesta pasta, rode:
   ```bash
   npm install -g wrangler
   wrangler login
   wrangler deploy
   ```
3. O terminal vai mostrar a URL final, algo como:
   ```
   https://hubacad-moodle-proxy.SEU-USUARIO.workers.dev
   ```
4. Copie essa URL e cole em `src/config/integrations.ts`, na constante
   `MOODLE_PROXY_URL`, substituindo o valor placeholder.
5. Rode `npm run deploy:web` de novo na raiz do projeto para publicar o app
   já apontando pro proxy.

## Verificar se está no ar

```bash
curl -X POST "https://hubacad-moodle-proxy.SEU-USUARIO.workers.dev/token" \
  --data-urlencode "username=teste" \
  --data-urlencode "password=teste" \
  --data-urlencode "service=moodle_mobile_app"
```
Deve retornar um JSON de erro do Moodle (`invalidlogin`), não um erro do
Cloudflare — isso confirma que o proxy está repassando corretamente.
