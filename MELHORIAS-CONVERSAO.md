# Melhorias de conversão — Nexa MP

Revisão do site preservando identidade visual, arquitetura e dados reais. Nenhum depoimento, número, cliente ou desconto foi adicionado.

## Correções
- `src/components/sections/ComoFunciona.tsx`: a seção não tinha fundo próprio e usava texto preto sobre o fundo `#070707` do site, ou seja, ficava ilegível. Agora tem fundo escuro, textos claros e um bloco final de chamada para a fase 01.
- `src/components/sections/Planos.tsx`: o selo "Mais escolhido" afirmava um dado de popularidade que não existe no projeto. Trocado por "Recomendado".
- `app/globals.css`: a classe `.glow-blob` era usada (Portfolio) mas não existia. Criada, com movimento lento.
- `src/components/sections/Problema.tsx`: o CTA de conversão some se o mouse passa pelos outros cards; o hover não reinicia mais o estado "resolvido".

## Conversão e confiança
- Hero: CTA principal "Começar meu projeto", secundário "Ver planos e valores", linha de transparência (preço de entrada vindo de `planos.ts`, sem cobrança para conversar, atendimento pelo Instagram). H1 com descrição para SEO/leitores de tela.
- Problema: ao "resolver" um problema aparece o botão "Resolver isso com a Nexa MP".
- Serviços: cada card tem o link "Conversar sobre isso".
- Como funciona: bloco "Começar pela fase 01".
- Diferenciais: botão "Ver como isso vira plano".
- Planos: botão com o nome do plano + seta, microtexto "nenhuma cobrança", bloco "Quero ajuda para escolher", abas mobile em grade 2x2, `aria-pressed`/`aria-label` nos seletores.
- CTA final: segundo botão "Ver planos" e nota sobre canais de atendimento.
- Contato: introdução mais clara (4 perguntas), progresso "Pergunta X de 4", Enter envia no campo de mensagem (Shift+Enter quebra linha), `autocomplete` em nome/empresa, a conversa reconhece o plano vindo de `?plano=`, mostra o "Plano escolhido" e o botão principal agora copia o resumo e abre o Instagram em um clique.
- Novo `src/components/ui/CtaFlutuante.tsx` (montado em `app/page.tsx`): botão fixo "Falar com a Nexa MP" só no mobile, aparece depois do topo e some quando o contato/rodapé está visível.

## Microinterações e desempenho
- `.cta-press` (globals.css + `Button.tsx`): feedback de clique nos botões.
- Hero: rastreamento do mouse limitado a 1 atualização por frame e desligado com "reduzir movimento".
- `app/layout.tsx`: `viewport` com `themeColor` e `colorScheme` escuros.

## Pendências que dependem de você
- WhatsApp e e-mail reais (hoje "Em breve") e envio real do formulário.
- Primeiros cases reais para a seção Projetos.
- Imagem de compartilhamento (Open Graph) e `NEXT_PUBLIC_SITE_URL` configurado na Vercel.
