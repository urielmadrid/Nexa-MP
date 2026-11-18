# Segunda auditoria técnica — Nexa MP

## Escopo

Hardening, QA, performance, SEO, acessibilidade e preparação para produção da versão recebida em 27/09/2026.

## Principais problemas encontrados

- Não havia página App Router dedicada para 404.
- Não havia headers de segurança configurados no Next.js.
- Google Analytics não estava preparado de forma centralizada.
- Não havia variável para verificação do Google Search Console.
- `framer-motion` era usado em várias seções puramente visuais, transformando conteúdo estático em Client Components sem necessidade.
- O botão reutilizável era Client Component apenas para animações de hover/tap.
- O CTA final usava canvas + `requestAnimationFrame` para uma decoração visual, gerando JavaScript contínuo sem necessidade funcional.
- A Política de Privacidade dizia que não havia analytics, mas o projeto precisava de uma forma segura de preparar a integração futura.
- Não existe backend/API no projeto atual; portanto não havia local tecnicamente correto para aplicar rate limiting server-side.

## Correções realizadas

### 404

Criado `app/not-found.tsx` com:

- Header e Footer do site.
- Mensagem clara de erro.
- CTA para início, serviços e contato.
- `robots: { index: false, follow: true }`.
- Layout responsivo e acessível.
- Nenhum redirect automático de URLs inexistentes.

A validação HTTP real depende do build/deploy, pois o ambiente de auditoria não conseguiu obter o pacote SWC Linux necessário ao `next build`.

### Domínio e SEO

- `NEXT_PUBLIC_SITE_URL` continua sendo a fonte única do domínio canônico.
- `GOOGLE_SITE_VERIFICATION` foi adicionado como variável opcional.
- Canonicals foram definidos também nas páginas legais.
- Sitemap continua limitado a URLs públicas reais.
- Robots continua permitindo crawling público e apontando para o sitemap quando o domínio está configurado.
- Não foram adicionadas URLs Vercel, localhost ou preview ao código de produção.
- `llms.txt` permanece sem clientes, resultados ou cases fictícios.
- Não foram criadas rotas artificiais apenas para evitar 404.

### Security headers

Configurados em `next.config.ts`:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `poweredByHeader: false`

A CSP permite os recursos necessários ao Next.js e deixa o Google Tag Manager/Analytics permitido somente para a integração opcional. A política usa `unsafe-inline` para manter compatibilidade com os scripts/estilos inline do Next.js; uma CSP baseada em nonce pode ser adotada posteriormente se o projeto precisar de uma política ainda mais restritiva.

### Rate limiting

Não foi criado rate limiting falso no frontend.

A auditoria identificou que o contato/chatbot atual funciona no navegador e não possui endpoint próprio de API, banco ou servidor de recebimento de mensagens. Portanto:

- não existe endpoint server-side para proteger com `429`;
- não foram inventadas credenciais ou serviços externos;
- o fluxo atual não envia automaticamente os dados do chatbot para um backend.

Se futuramente houver `/api/*`, envio de e-mail, CRM, newsletter ou outro endpoint, o rate limiting deve ser implementado no servidor/edge, preferencialmente na infraestrutura que realmente recebe a requisição.

### Google Analytics 4

Criado `src/components/analytics/GoogleAnalytics.tsx`.

Comportamento:

- só carrega em produção;
- só carrega se `NEXT_PUBLIC_GA_ID` estiver configurado;
- usa `next/script` com `afterInteractive`;
- não cria erro quando o ID está vazio;
- o ID não fica espalhado pelo código.

Configuração:

`NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX`

O projeto não inventa um Measurement ID.

Como o Analytics altera a coleta de dados, a Política de Privacidade foi ajustada para deixar claro que a integração permanece desativada enquanto a variável não estiver configurada.

Antes de ativar rastreamento, revisar consentimento/cookies conforme a forma efetiva de coleta adotada no domínio.

### Google Search Console

Adicionada:

`GOOGLE_SITE_VERIFICATION=`

Quando preenchida no ambiente de produção, o valor é exposto pela metadata de verificação do Google.

Não foi inventado nenhum código.

### JavaScript e performance

As seguintes áreas foram convertidas para Server Components:

- `Hero`
- `Problema`
- `Solucao`
- `Servicos`
- `CtaFinal`
- `Button`

Isso removeu `framer-motion` dessas áreas.

O `CtaFinal` deixou de usar canvas, `requestAnimationFrame`, pontos, cálculo de distância e listeners de mouse para produzir uma decoração visual. A decoração agora é feita com CSS.

As animações decorativas do Hero também passaram para CSS e respeitam `prefers-reduced-motion`.

Client Components restantes são justificados por interação real:

- Header/menu mobile
- Diferenciais/baralho interativo
- Portfolio/modal
- Contato/chatbot
- ComoFunciona/modal
- Planos/seletor
- Google Analytics

`framer-motion` continua instalado porque ainda é usado por esses componentes interativos.

### Acessibilidade

Mantidos/melhorados:

- `lang="pt-BR"`;
- skip link;
- foco visível;
- menu mobile com ARIA;
- labels no chatbot;
- `aria-live` na conversa;
- suporte a `prefers-reduced-motion`;
- 404 com navegação clara;
- HTML semântico nas novas seções server-side.

### Integridade de conteúdo

Não foram adicionados:

- clientes;
- avaliações;
- depoimentos;
- números de resultados;
- certificados;
- prêmios;
- endereços;
- telefones;
- credenciais;
- cases fictícios.

O portfólio continua sem projetos públicos fictícios.

## Testes executados

### TypeScript

`npx tsc --noEmit`

**PASSOU**

### ESLint

`npm run lint`

**PASSOU**, sem erros ou warnings reportados.

### Dependências

`npm audit --offline --audit-level=high`

**0 vulnerabilidades encontradas** no conjunto que pôde ser auditado localmente.

`npm outdated` não foi concluído de forma confiável porque depende de acesso ao registry e o ambiente apresentou falha de rede/DNS.

### Build

`npm run build`

**BLOQUEADO PELO AMBIENTE**, não pelo código detectado até este ponto.

O Next.js tentou baixar:

`@next/swc-linux-x64-gnu`

mas o ambiente não conseguiu resolver `registry.npmjs.org` (`EAI_AGAIN`).

Portanto o build final precisa ser executado em CI/deploy com acesso ao npm. Não foi mascarado nem tratado como sucesso.

## Rotas

Rotas de página existentes no código:

- `/`
- `/politica-de-privacidade`
- `/termos`

O site usa seções por âncora para:

- `#servicos`
- `#planos`
- `#projetos`
- `#como-funciona`
- `#contato`

Não existe uma página `/servicos`; portanto ela não foi criada artificialmente só para eliminar um 404.

## Segurança

Busca estática não encontrou:

- `console.log`
- `console.error`
- TODO/FIXME
- API keys
- secrets aparentes
- `localhost`/`127.0.0.1` em código de produção
- endpoints privados
- tokens de autenticação expostos

O único `dangerouslySetInnerHTML` é o JSON-LD gerado pelo próprio código. A serialização foi protegida contra `<` antes de entrar no script para reduzir risco de quebra do contexto HTML.

## Arquivos principais modificados/criados

- `next.config.ts`
- `.env.example`
- `app/layout.tsx`
- `app/not-found.tsx`
- `app/politica-de-privacidade/page.tsx`
- `app/termos/page.tsx`
- `src/components/analytics/GoogleAnalytics.tsx`
- `src/components/ui/Button.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/sections/Problema.tsx`
- `src/components/sections/Solucao.tsx`
- `src/components/sections/Servicos.tsx`
- `src/components/sections/CtaFinal.tsx`
- `app/globals.css`

## Pendências externas antes do domínio `.com`

1. Definir `NEXT_PUBLIC_SITE_URL` com o domínio real, sem barra final.
2. Configurar DNS no provedor/Cloudflare/Vercel conforme a infraestrutura escolhida.
3. Garantir HTTPS e redirecionamento HTTP → HTTPS na infraestrutura.
4. Definir qual variante será canônica (`www` ou raiz) e apontar a outra para ela com redirect permanente no provedor.
5. Configurar `GOOGLE_SITE_VERIFICATION`, se for usada a verificação por metadata.
6. Criar/configurar GA4 e só então preencher `NEXT_PUBLIC_GA_ID`.
7. Se o Analytics for ativado, revisar o mecanismo de consentimento e a política de privacidade de acordo com a implementação efetiva.
8. Executar `npm install`, `npm run build` e `npm run start`/deploy em ambiente com acesso ao npm.
9. Após publicação, testar diretamente as respostas HTTP de `/`, páginas legais e URLs inexistentes como `/abc`, `/teste`, `/pagina-inexistente` e `/servico-que-nao-existe`.
10. Enviar o sitemap real ao Google Search Console após o domínio estar publicado.

## Conclusão técnica

A segunda auditoria reduziu JavaScript onde ele não agregava funcionalidade, adicionou hardening de headers, 404 dedicado, preparação de Analytics/Search Console, canonicalização configurável e revisão de conteúdo/segurança.

O principal ponto ainda não comprovado localmente é o comportamento final de runtime/build porque o ambiente de auditoria não conseguiu baixar o SWC Linux do npm. TypeScript, ESLint e auditoria offline de dependências passaram.
