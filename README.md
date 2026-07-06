# HubAcad 🎓

Aplicativo mobile de organização acadêmica para estudantes universitários. Um único lugar para gerenciar toda a vida universitária.

## Conceito

Cada disciplina funciona como um **mini ambiente acadêmico próprio** (Hub da Disciplina), reunindo em uma única tela:

- 📚 Informações da disciplina (professor, carga horária, semestre, sala)
- 📋 Atividades com prioridade, checklist, anexos e prazo
- 📝 Provas com contagem regressiva
- 📊 Notas com média atual, situação e "quanto preciso tirar"
- 📈 Frequência com a regra da UFR (mínimo 75% de presença)
- 📒 Anotações exclusivas por disciplina
- 🎯 Objetivos com progresso visual

## Destaques

- **Notificações inteligentes**: lembretes múltiplos configuráveis (30 dias a 15 minutos antes), persistentes até a atividade ser concluída.
- **Calculadora de notas**: média simples ou ponderada, configurável por disciplina.
- **Controle de faltas**: cálculo automático do limite (25% da carga horária), alertas em amarelo/vermelho.
- **Visual premium**: glassmorphism, animações spring 60fps (Reanimated), feedback tátil, tema claro/escuro.
- **Dados locais**: persistência offline com AsyncStorage.

## Usar no navegador (GitHub Pages)

A versão web fica publicada em:

**https://jonasvoltdasilva.github.io/Organiza-o-Acad-mica/**

### 📌 Instalar na área de trabalho / tela inicial

O HubAcad é um **PWA** — pode ser instalado como um app de verdade:

- **No PC (Chrome/Edge)**: abra o link acima e clique no ícone de **instalar** (⊕) na barra de endereço, ou menu ⋮ → *Instalar HubAcad*. Ele vira um app com atalho na área de trabalho, janela própria e funciona offline.
- **No Android (Chrome)**: menu ⋮ → *Adicionar à tela inicial* → *Instalar*.
- **No iPhone (Safari)**: botão compartilhar → *Adicionar à Tela de Início*.

Os dados ficam salvos localmente no dispositivo. ⚠ Na versão web as **notificações de lembrete não funcionam** — para lembretes, use a versão nativa (Expo Go ou build Android/iOS).

### Republicar a versão web

```bash
npm run deploy:web
```

(O script gera o build, cria o `.nojekyll` — sem ele o GitHub Pages bloqueia a pasta `_expo/` — e publica na branch `gh-pages`.)

## Rodando o projeto (nativo)

```bash
npm install
npx expo start
```

Escaneie o QR code com o app **Expo Go** (Android/iOS).

## Stack

- React Native 0.86 + Expo SDK 57 + TypeScript
- React Navigation (tabs + stack)
- Reanimated 4 · Gesture Handler · expo-blur · expo-haptics · expo-notifications
- date-fns (pt-BR)

## Arquitetura

```
src/
  components/   # ui/ (design system), cards/, form/, hub/
  constants/    # regra UFR, lembretes, prioridades, feriados
  hooks/        # useDashboard, useDisciplineHub
  navigation/   # tabs em vidro + stack tipada
  providers/    # AppProvider (estado global + persistência)
  screens/      # 11 telas
  services/     # storage (AsyncStorage), notifications
  theme/        # paleta, temas claro/escuro, tipografia
  types/        # modelos de domínio
  utils/        # datas, faltas, médias
```

## Paleta

| Cor | Uso |
| --- | --- |
| `#F6F7ED` | Background principal |
| `#DBE64C` | Destaque (cartão de próximo prazo, tab ativa) |
| `#74C365` | Verde (sucesso) |
| `#00804C` | Verde escuro (primário) |
| `#001F3F` | Azul escuro (texto) |
| `#1E488F` | Azul secundário (informação) |
