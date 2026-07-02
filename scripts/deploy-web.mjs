/**
 * Publica a pasta dist/ na branch gh-pages.
 * Usa `git add -Af` para incluir assets/node_modules/, que ferramentas
 * como gh-pages pulam por causa das regras de ignore do git.
 */
import { execSync } from "node:child_process";
import { existsSync, rmSync, writeFileSync } from "node:fs";

const REMOTE = "https://github.com/JonasVoltdaSilva/Organiza-o-Acad-mica.git";

if (!existsSync("dist/index.html")) {
  console.error("dist/ não encontrado. Rode antes: npx expo export --platform web");
  process.exit(1);
}

writeFileSync("dist/.nojekyll", "");
rmSync("dist/.git", { recursive: true, force: true });

const run = (cmd) => execSync(cmd, { cwd: "dist", stdio: "inherit" });
run("git init -q -b gh-pages");
run("git add -Af");
run('git commit -qm "deploy: HubAcad web"');
run(`git push -qf ${REMOTE} gh-pages`);
rmSync("dist/.git", { recursive: true, force: true });

console.log("✔ Publicado em https://jonasvoltdasilva.github.io/Organiza-o-Acad-mica/");
