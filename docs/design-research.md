# HubAcad — Pesquisa de Design (UI/UX Mobile 2025/2026)

> Relatório de pesquisa produzido em 02/07/2026. Fontes consultadas listadas na seção 6.
> Referências internas: tokens atuais em `src/theme/palette.ts` e `src/theme/layout.ts`.

---

## 1. Resumo executivo

O HubAcad já está alinhado com as duas maiores tendências de 2025/2026 — glassmorphism moderno (revivido pelo Liquid Glass da Apple) e cartões modulares tipo bento grid — mas a pesquisa mostra que os apps considerados "premium" (Things 3, Structured, Notion Calendar) se diferenciam menos pelo efeito visual e mais por: hierarquia tipográfica confiante, espaço em branco generoso, uma única cor de destaque usada com disciplina, microinterações com propósito e estados vazios que ensinam. Os maiores riscos do estilo atual são legibilidade sobre vidro (especialmente no tema escuro) e excesso de translucidez em telas densas de texto. As recomendações abaixo priorizam: (1) reservar o vidro para camadas flutuantes e usar superfícies quase-sólidas para conteúdo, (2) adotar bento grid real no Dashboard, (3) linha do tempo à la Structured, (4) gamificação leve sem culpa (streaks com "freeze", nada de vermelho punitivo), e (5) gráficos minimalistas de 1 pergunta por tela nas Estatísticas.

---

## 2. Recomendações concretas e priorizadas

Cada item traz **o que mudar**, **por quê** e **como aplicar** com a paleta atual (`#F6F7ED` creme, `#DBE64C` lima, `#74C365` verde, `#00804C` verde escuro, `#001F3F` navy, `#1E488F` azul).

### P1 — Alta prioridade (maior impacto percebido)

**R1. Reservar o vidro para camadas flutuantes; conteúdo em superfície quase sólida.**
- **Por quê:** NN/g e os guias de 2026 são unânimes: glassmorphism funciona em overlays, tab bars, modais e cartões flutuantes — em telas densas de texto ele "mata a legibilidade rápido". A tendência 2026 é "subtle translucent layers", não blur pesado em tudo.
- **Como:** manter blur apenas na tab bar flutuante, cabeçalhos sticky e bottom sheets. Para cartões de lista (atividades, notas, disciplinas), usar `surfaceStrong` (`rgba(255,255,255,0.88)` no claro) como padrão em vez de `surface` (0.62). No escuro, subir `surface` de `0.07` para `0.10–0.12` e adicionar borda `rgba(255,255,255,0.16)` — painéis escuros translúcidos "somem" sobre fundo escuro sem borda/sombra interna.

**R2. Aumentar o contraste do texto secundário.**
- **Por quê:** WCAG exige 4.5:1 para texto normal; `textMuted` claro (`rgba(0,31,63,0.42)`) sobre vidro translúcido sobre creme fica abaixo disso em várias áreas — problema clássico de glassmorphism apontado pela NN/g.
- **Como:** subir `textSecondary` para `rgba(0,31,63,0.74)` e `textMuted` para `rgba(0,31,63,0.55)`; usar `textMuted` só em texto ≥13px com peso 600+. No escuro, `textMuted` para `rgba(246,247,237,0.55)`. Nunca colocar texto lima (`#DBE64C`) sobre creme (contraste ~1.3:1) — lima só como fundo de chip/CTA com texto navy por cima (navy sobre lima ≈ 9:1, excelente).

**R3. Hierarquia tipográfica mais confiante (padrão Things 3).**
- **Por quê:** a tendência 2026 é "confident typography + meaningful negative space + material depth over decorative complexity". Things 3 parece premium porque os títulos dominam e os metadados somem até serem necessários.
- **Como:** em `layout.ts`, subir `largeTitle` para `fontSize: 34, fontWeight: "800", letterSpacing: -0.8` (saudação do Dashboard); `body` para `fontSize: 16` (o HIG da Apple usa 17pt como corpo padrão — 15 está apertado); adicionar um token `subheading: { fontSize: 14, fontWeight: "600", letterSpacing: 0.2, textTransform: "uppercase" }` para rótulos de seção ("HOJE", "ESTA SEMANA"), em `textMuted`. Uma tela = um título grande; o resto desce um degrau.

**R4. Dashboard em bento grid de verdade.**
- **Por quê:** bento grid dominou 2025 e segue forte em 2026 (Apple, Samsung, Google usam); é o padrão ideal para dashboards com tipos de conteúdo variados — exatamente o caso do Dashboard do HubAcad (próximo prazo, progresso, semana).
- **Como:** grade de 2 colunas com gap `spacing.md` (12): cartão-herói do próximo prazo ocupando largura total (altura ~140px, fundo `#00804C` sólido com texto creme — o único cartão "cheio" da tela); abaixo, pares de células quadradas ~ (largura-52)/2: "Frequência" (anel de progresso), "Streak" (chama + número), "Semana" (7 pontinhos), "Pendentes" (número grande 28px/800). Raios `radius.lg` (26) nas células, `radius.xl` (30) no herói.

**R5. Uma cor de ação, usada com disciplina.**
- **Por quê:** apps premium usam 3–4 cores no máximo; o que os torna caros é a contenção. Lima é a assinatura visual do HubAcad — deve aparecer pouco para valer muito.
- **Como:** lima (`#DBE64C`) apenas em: FAB/CTA primário, item ativo da tab bar, indicador do dia atual no calendário e destaque do streak. Verde escuro (`#00804C`) para ações secundárias e links; verde (`#74C365`) só para estados de sucesso/concluído; azul (`#1E488F`) só informativo. Remover lima de bordas decorativas, ícones passivos e fundos de seção.

### P2 — Média prioridade

**R6. Swipe actions nas listas de atividades (com alternativa visível).**
- **Por quê:** padrão universal em TickTick/Things: swipe direito = concluir, swipe esquerdo = adiar/apagar. NN/g alerta: gestos devem complementar, nunca substituir controles visíveis, e precisam de dica visual.
- **Como:** swipe direito revela fundo `#74C365` com check branco (concluir); swipe esquerdo revela duas ações: adiar (fundo `#E8B93B`, ícone relógio) e apagar (`#D9534F`). Manter o checkbox tocável no item (alvo mínimo 44×44px) como caminho alternativo. Adicionar haptic leve (`Haptics.impactAsync(Light)`) ao cruzar o limiar do swipe.

**R7. Microinterações com propósito (não decorativas).**
- **Por quê:** haptics em momentos de conclusão reduzem tempo de recuperação de erro em ~27%; Things 3 é amado pelo "check" satisfatório. iOS espera haptics do sistema em momentos específicos.
- **Como:** ao concluir atividade: checkbox anima escala 1→1.15→1 (200ms, spring), risca o texto com fade para `textMuted`, haptic `notificationAsync(Success)` e o item sai da lista após 600ms (tempo de ver o check). Press-in de cartões: escala 0.97 com spring. Respeitar `prefers-reduced-motion` / `AccessibilityInfo.isReduceMotionEnabled` desativando animações de entrada.

**R8. Calendário: mês compacto + agenda embaixo.**
- **Por quê:** pesquisa de calendário mobile: grid mensal sozinho não é acionável em telas <360px; o padrão vencedor é mês compacto no topo como navegação + lista agenda cronológica abaixo. Swipe horizontal para trocar de mês é expectativa universal.
- **Como:** células do mês com no máximo 3 pontinhos coloridos (cor da disciplina) + "+N" quando estourar; dia atual com círculo lima preenchido e número navy 700; dia selecionado com anel de 2px `#00804C`. Abaixo de um divisor, agenda do dia selecionado com os cartões de atividade. Permitir colapsar o mês para 1 linha (semana) ao rolar a agenda — padrão Google Calendar/TickTick.

**R9. Streaks e gamificação leve sem punição.**
- **Por quê:** streaks aumentam comprometimento (~60% no caso Duolingo; 7 dias de streak = 3.6× mais retenção) e o "streak freeze" reduziu churn em 21%. Mas Things 3 prova que o público de produtividade rejeita pressão: nada de badges vermelhos e culpa. O arXiv documenta "gamification misuse" quando vira ansiedade.
- **Como:** streak de dias com estudo/atividade concluída, mostrado no bento do Dashboard (chama em lima, número navy 800). Dar 1 "proteção" automática por semana (fim de semana não quebra streak — estudante tem vida). Atividades atrasadas: nunca vermelhas gritantes — usar âmbar `#E8B93B` e empurrar para "Hoje" (padrão Things 3). Marcos discretos: 7, 14, 30 dias com um toast `aria-live="polite"` e confete sutil (desativável).

**R10. Estatísticas: uma pergunta por tela/cartão, número grande primeiro.**
- **Por quê:** melhores dashboards mobile "mostram menos dados com mais clareza"; cada cartão deve responder exatamente uma pergunta; KPI com número grande + indicador de direção; máx. 5–7 barras, 2–3 séries em linhas; legendas acima do gráfico; tap em vez de hover.
- **Como:** cartão "Frequência" = anel de progresso 120px com número central 32px/800 e a regra dos 75% como linha de referência tracejada em `#D9534F` — texto auxiliar "pode faltar mais X aulas" (a informação que o aluno quer de verdade). Cartão "Notas por disciplina" = barras horizontais (nome legível) com no máx. 7 disciplinas, cor da disciplina + valor numérico na ponta (nunca só cor — daltonismo). Gráficos sem eixos/gridlines pesados: fundo limpo, 1 label por extremo.

### P3 — Refinamento

**R11. Empty states que ensinam (2 partes instrução, 1 parte encanto).**
- **Por quê:** empty states são a primeira tela que o usuário novo vê; a regra citada na pesquisa é "two parts instruction, one part delight"; mostrar como a tela ficará quando cheia + 1 CTA imediato (padrão Dropbox).
- **Como:** cada tela vazia (Disciplinas, Hub, Calendário, Stats) com: ilustração simples nas cores da marca (traço navy, preenchimento lima/verde a 20%), 1 frase de valor ("Cada disciplina vira um hub com provas, notas e frequência"), 1 botão primário ("Adicionar disciplina", fundo lima, texto navy 700, raio pill, altura 52px). Nas Stats vazias, mostrar um gráfico fantasma (skeleton) do que virá.

**R12. Ícone + cor por disciplina em tudo (padrão Structured).**
- **Por quê:** o que faz o Structured "legível de relance" é ícone + cor em cada bloco da timeline; o HubAcad já tem `disciplineColors` e `disciplineIcons` — falta usá-los consistentemente como sistema de identidade.
- **Como:** todo cartão/linha ligado a uma disciplina leva um "chip" de 32×32 (raio 10) com fundo da cor da disciplina a 15% de opacidade e ícone na cor cheia; a mesma dupla aparece nos pontinhos do calendário, nas barras das stats e no header do Hub. Nunca comunicar disciplina só por cor (acessibilidade): sempre ícone ou texto junto.

**R13. Hub da Disciplina com header colapsável e seções em cartões.**
- **Por quê:** padrão dos hubs premium (Notion, apps de banco): header grande com identidade que colapsa em barra compacta ao rolar, mantendo contexto sem gastar tela.
- **Como:** header inicial ~180px com fundo na cor da disciplina a 12% sobre o creme, ícone 48px, nome em `title` (22/700), e 3 stats inline (média, frequência %, pendentes); ao rolar, colapsa para barra de 56px com blur (aqui o vidro é bem-vindo) mostrando ícone 24px + nome. Seções (Atividades, Provas, Notas, Frequência, Anotações, Objetivos) como cartões `surfaceStrong` com `subheading` uppercase e chevron.

**R14. Dark mode como cidadão de primeira classe.**
- **Por quê:** dark glassmorphism é a estética apontada para 2026, mas é onde o vidro mais falha: painéis somem, texto perde contraste. Regras da pesquisa: aumentar opacidade dos painéis, bordas mais visíveis, texto sempre claro sobre vidro escuro.
- **Como:** no `darkTheme`, `surface: rgba(255,255,255,0.10)`, `surfaceBorder: rgba(255,255,255,0.16)`, e adicionar um leve gradiente no topo dos cartões (`rgba(255,255,255,0.05)` → transparente) para simular reflexo. Trocar lima puro por versão 10% dessaturada no escuro se ofuscar (testar). Cores das disciplinas: usar as mesmas com +10–15% de luminosidade no escuro (ex.: `#1E488F` → `#6C9BE0`, como já feito no `info`).

**R15. Sistema de espaçamento 8pt e respiro deliberado.**
- **Por quê:** grids de 8pt criam ritmo visual e são o padrão citado nos design systems 2026 ("active breathing room"); Things 3 e Notion Calendar parecem caros por causa do espaço, não apesar dele.
- **Como:** normalizar `spacing` para múltiplos de 4/8: manter xs 4, sm 8, md 12, lg 16, mas subir `xl` 20→24 e `xxl` 28→32; padding interno de cartão: 16–20; gap entre cartões de lista: 12; entre seções: 32; margem de tela: manter 20. Nunca encostar dois blocos de texto com menos de 8px.

---

## 3. O que os apps premium fazem que o HubAcad deve copiar — por tela

### Dashboard
- **Structured:** o dia como linha do tempo vertical — considerar um bloco "Hoje" no Dashboard com 3–5 itens em mini-timeline (linha vertical de 2px na cor da disciplina, hora à esquerda), em vez de lista plana. Ícone + cor tornam a leitura instantânea.
- **Things 3:** saudação e data grandes, zero badge vermelho; o que está atrasado simplesmente aparece em "Hoje" com um marcador âmbar discreto.
- **TickTick:** o resumo de hábito/streak com check rápido direto do dashboard (concluir sem abrir detalhe).
- **Notion:** blocos modulares reordenáveis — em versão futura, deixar o aluno escolher quais bentos aparecem.

### Calendário
- **Notion Calendar:** sensação de linha contínua (scroll fluido entre meses, sem "flip" de página); minimalismo extremo — só números, pontinhos e o dia atual destacado; transições rápidas <200ms.
- **TickTick:** mês colapsável para semana ao rolar a agenda; arrastar tarefa para outro dia (v2).
- **Structured:** cor + ícone da disciplina nos eventos; provas com peso visual maior que atividades (borda 2px na cor + ícone de alerta).
- **Apple Calendar:** "+2 more" quando estourar 3 eventos no dia; bottom sheet (não modal central) para criar evento a partir de um long-press no dia.

### Hub da Disciplina
- **Things 3:** o "abrir tarefa" que expande no lugar como um pedaço de papel — abrir atividade do Hub como bottom sheet expansível, campos secundários escondidos até precisar ("Adicionar lembrete", "Adicionar nota") em vez de formulário longo.
- **Notion:** hierarquia de página: título grande, propriedades discretas em linha (média · frequência · pendentes), conteúdo abaixo; ícone/emoji por página → ícone por disciplina no header.
- **TickTick:** progresso da disciplina como barra fina no topo do card (atividades concluídas/total) — feedback passivo constante.

### Estatísticas
- **TickTick:** tela de estatísticas com score do dia, streak, histograma semanal simples e heatmap mensal de conclusões (estilo GitHub, com os verdes da marca: `#74C365` → `#00804C`) — o heatmap é barato de implementar e muito "compartilhável".
- **Structured (padrão geral de dados):** nada de gráfico com 2 eixos e legenda: número grande + tendência ("↑ 12% vs. semana passada" em `#74C365`).
- **Things 3 (o anti-exemplo deliberado):** eles não têm stats — lição: as stats do HubAcad devem motivar (frequência que "sobra", streak) e não fiscalizar (nunca "você falhou 40%").

---

## 4. Erros comuns a evitar

1. **Vidro sobre vidro sobre vidro** — empilhar camadas translúcidas destrói contraste e performance (blur é caro em React Native/Android; usar `experimentalBlurMethod` com parcimônia ou fallback sólido no Android).
2. **Texto sobre blur sem tint** — sempre um véu de 10–30% de opacidade entre o blur e o texto.
3. **Comunicar estado só por cor** — atrasado/pendente/concluído precisam de ícone ou texto além da cor (daltonismo; regra WCAG 1.4.1).
4. **Gamificação punitiva** — badge vermelho acumulando, streak que quebra sem perdão, notificação de culpa. O público que ama Things 3 abandona apps que gritam.
5. **Grid mensal como tela principal de trabalho** — o grid navega, a agenda trabalha.
6. **Swipe como único caminho** — toda ação por gesto precisa de botão visível equivalente (acessibilidade e descobribilidade).
7. **Gráficos de desktop encolhidos** — pizza com 10 fatias, eixos duplos, legendas laterais. Mobile = 1 pergunta, 1 número grande, 1 gráfico simples.
8. **Excesso de raio + excesso de sombra juntos** — com raios 26–30 já generosos, sombras devem ser suaves (`shadowOpacity` ≤ 0.10 no claro, elevação pequena); sombra dura + raio grande = visual "sticker".
9. **Ignorar reduce motion e reduce transparency** — oferecer fallback sólido e animações desativáveis (o próprio iOS faz isso com o Liquid Glass).
10. **Formulários modais longos** — pedir 8 campos para criar uma atividade. Padrão premium: 1 campo (título) + chips de atalho (hoje/amanhã/data, disciplina), resto opcional e progressivo.

---

## 5. Ordem de implementação sugerida

| Fase | Itens | Esforço |
|------|-------|---------|
| 1. Fundamentos | R2 (contraste), R3 (tipografia), R15 (espaçamento), R5 (disciplina de cor) | Baixo — só tokens em `src/theme` |
| 2. Impacto visual | R1 (vidro seletivo), R4 (bento Dashboard), R14 (dark mode) | Médio |
| 3. Interação | R6 (swipe), R7 (microinterações), R8 (calendário) | Médio |
| 4. Retenção | R9 (streaks), R10 (stats), R11 (empty states), R12 (identidade por disciplina), R13 (hub colapsável) | Médio/Alto |

---

## 6. Fontes consultadas

**Tendências 2025/2026**
- [App Design Trends 2026 — Intuitia](https://www.intuitia.tech/blog/app-design-trends)
- [UI Design Trends for 2026 — Midrocket](https://midrocket.com/en/guides/ui-design-trends-2026/)
- [UI Design Trends 2026: Glassmorphism Evolution, Dark Mode — Lucky Graphics](https://lucky.graphics/learn/ui-design-trends-2026/)
- [Beyond the Glass: 7 Mobile UI Trends Defining 2026 — Abdul Aziz Ahwan](https://www.abdulazizahwan.com/2026/02/beyond-the-glass-7-mobile-ui-trends-defining-2026.html)
- [15 UI/UX Design Trends of 2026 — Tenet](https://www.wearetenet.com/blog/ui-ux-design-trends)
- [iOS UX Design Trends 2026 — Asapp Studio](https://asappstudio.com/ios-ux-design-trends-2026/)
- [Best Mobile App UI/UX Design Trends for 2026 — Natively](https://natively.dev/blog/best-mobile-app-design-trends-2026)

**Glassmorphism e dark mode**
- [Glassmorphism: Definition and Best Practices — Nielsen Norman Group](https://www.nngroup.com/articles/glassmorphism/)
- [Dark Mode Glassmorphism — Alpha Efficiency](https://alphaefficiency.com/dark-mode-glassmorphism)
- [Dark Glassmorphism 2026 — Medium/MustBeWebCode](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f)
- [Glassmorphism Meets Accessibility — Axess Lab](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/)
- [Inclusive Dark Mode — Smashing Magazine](https://www.smashingmagazine.com/2025/04/inclusive-dark-mode-designing-accessible-dark-themes/)
- [Glassmorphism UI: Features, Best Practices — UX Pilot](https://uxpilot.ai/blogs/glassmorphism-ui)

**Apps de referência**
- [Things 3 — Cultured Code (features)](https://culturedcode.com/things/features/)
- [Things 3 Review — Productive with Chris](https://productivewithchris.com/tools/things-3/)
- ["Things 3, the best of Material Design to iOS" — Grey Patterson](https://greypatterson.me/2017/06/things-3/)
- [Structured — Daily Planner (site oficial)](https://structured.app/)
- [App Showcase: Structured — ScreensDesign](https://screensdesign.com/showcase/structured-daily-planner)
- [Structured redesign case study — Medium/Yunus Karaca](https://medium.com/@yunus.karaca/structured-daily-planner-redesign-case-study-ca404fb5fc6a)
- [Notion Calendar Review — Efficient App](https://efficient.app/apps/notion-calendar)
- [Notion Calendar (ex-Cron) — Medium/hejrene](https://medium.com/@hejrene/notion-has-finally-its-own-calendar-app-and-it-is-really-great-c56828e901a5)
- [TickTick vs Notion — Efficient App](https://efficient.app/compare/ticktick-vs-notion)
- [TickTick vs Notion Calendar — Akiflow](https://akiflow.com/blog/ticktick-vs-notion-calendar)

**Padrões: calendário, listas, swipe**
- [Calendar UI Examples: 33 Inspiring Designs — Eleken](https://www.eleken.co/blog-posts/calendar-ui)
- [Calendar View Pattern — UX Patterns for Developers](https://uxpatterns.dev/patterns/data-display/calendar)
- [Best calendar apps and design best practices — Justinmind](https://www.justinmind.com/ui-design/best-calendar-app-designs-how-prototype)
- [Mobile Calendar UI — Mobbin](https://mobbin.com/explore/mobile/screens/calendar)
- [Using Swipe to Trigger Contextual Actions — Nielsen Norman Group](https://www.nngroup.com/articles/contextual-swipe/)
- [Designing swipe-to-delete/reveal — LogRocket](https://blog.logrocket.com/ux-design/accessible-swipe-contextual-action-triggers/)
- [Gestures — Material Design](https://m2.material.io/design/interaction/gestures.html)

**Dados e estatísticas em mobile**
- [Mobile Data Visualization: Chart Design Best Practices — Boundev](https://www.boundev.com/blog/mobile-data-visualization-design-guide)
- [Data visualization — Material Design](https://m2.material.io/design/communication/data-visualization.html)
- [How to shape data visualisation for mobile — Xwerx/Medium](https://medium.com/xwerx-ideas/how-to-shape-data-visualisation-for-mobile-b7adb032f5d9)
- [Designing Humanist Data Visualization for Mobile — Create with Swift](https://www.createwithswift.com/designing-humanist-data-visualization-for-mobile/)

**Gamificação e streaks**
- [Duolingo Streak System Breakdown — Medium/Premjit Singha](https://medium.com/@salamprem49/duolingo-streak-system-detailed-breakdown-design-flow-886f591c953f)
- [Duolingo Gamification Case Study — Trophy](https://trophy.so/blog/duolingo-gamification-case-study)
- [Duolingo's Gamification Secrets — Orizon](https://www.orizon.co/blog/duolingos-gamification-secrets)
- [Streaks and Milestones for Gamification — Plotline](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps)
- [When Gamification Spoils Your Learning — arXiv](https://arxiv.org/pdf/2203.16175)

**Empty states e onboarding**
- [Empty state UX examples — Eleken](https://www.eleken.co/blog-posts/empty-state-ux)
- [Empty States: The Most Overlooked Aspect of UX — Toptal](https://www.toptal.com/designers/ux/empty-state-ux-design)
- [Empty States in User Onboarding — Smashing Magazine](https://www.smashingmagazine.com/2017/02/user-onboarding-empty-states-mobile-apps/)
- [Empty State UI Design — Mobbin](https://mobbin.com/glossary/empty-state)

**Inspiração visual (galerias)**
- [Student Dashboard — Dribbble](https://dribbble.com/tags/student-dashboard)
- [Student Planner — Dribbble](https://dribbble.com/tags/student_planner)
- [Education Dashboard — Dribbble](https://dribbble.com/tags/education-dashboard)
- [Calendar UI/UX Inspiration — Muzli](https://muz.li/inspiration/calendar/)

**Tipografia, espaçamento e microinterações**
- [Mobile App Typography: Best Practices — Zignuts](https://www.zignuts.com/blog/mastering-mobile-app-typography-best-practices-pro-tips)
- [The Ultimate Design System Guide — Hooman](https://hooman.com/blogs/design-system-guide)
