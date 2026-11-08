# Crédito "Site criado pela Nexa MP" nos sites de clientes

Um link discreto no rodapé de cada site entregue. É gratuito, honesto (o site foi mesmo feito pela Nexa MP) e ajuda a Nexa MP a ser encontrada: cada link vindo de um site real de cliente é um sinal de que a Nexa MP existe e faz esse trabalho.

## Regras para o link valer a pena

1. **Link comum, sem `nofollow`.** O crédito é uma indicação legítima do autor do site; não use `rel="nofollow"` nem `rel="sponsored"`.
2. **Abrir em outra aba** (`target="_blank"` com `rel="noopener"`), para o visitante não sair do site do cliente.
3. **Texto claro:** "Site criado pela Nexa MP". Evite repetir palavras-chave (por exemplo, "Nexa MP marketing digital barato"): isso parece manipulação e prejudica.
4. **Um link por site, no rodapé.** Não espalhe em várias páginas nem em textos escondidos.
5. **Aponte para a página inicial:** `https://www.nexa-mp.com.br/`.
6. **Combine com o cliente** (veja o texto sugerido mais abaixo). O cliente pode pedir para tirar; nesse caso, tire.

## Versão 1: HTML puro

Cole no rodapé (`footer`) do site do cliente:

```html
<p style="font-size:12px;opacity:.7">
  Site criado pela
  <a href="https://www.nexa-mp.com.br/" target="_blank" rel="noopener"
     title="Nexa MP: gestão digital, sites, tráfego pago e redes sociais">Nexa MP</a>
</p>
```

Ajuste `font-size`, cor e `opacity` ao visual do site do cliente.

## Versão 2: React / Next.js (site do cliente feito em outro projeto)

Crie `src/components/CreditoNexaMP.tsx` no projeto do cliente:

```tsx
export default function CreditoNexaMP({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs opacity-70 ${className}`}>
      Site criado pela{" "}
      <a
        href="https://www.nexa-mp.com.br/"
        target="_blank"
        rel="noopener"
        title="Nexa MP: gestão digital, sites, tráfego pago e redes sociais"
        className="font-semibold underline-offset-4 hover:underline"
      >
        Nexa MP
      </a>
    </p>
  );
}
```

E use no rodapé do cliente:

```tsx
import CreditoNexaMP from "@/src/components/CreditoNexaMP";

<footer>
  {/* ... */}
  <CreditoNexaMP />
</footer>
```

## Dentro deste projeto (modelos de demonstração)

Os modelos `/m/salao` e `/m/barbearia` já usam `src/components/ui/CreditoNexaMP.tsx`, que lê o endereço do site em `src/lib/site.ts` (`SITE_URL`). Para um novo modelo, importe o componente e coloque no rodapé:

```tsx
import CreditoNexaMP from "@/src/components/ui/CreditoNexaMP";

<CreditoNexaMP tom="claro" />   {/* rodapé escuro */}
<CreditoNexaMP tom="escuro" />  {/* rodapé claro */}
```

## Texto sugerido para a proposta ou o contrato

> O site entregue inclui, no rodapé, o crédito "Site criado pela Nexa MP", com link para o site da Nexa MP. O crédito pode ser removido a qualquer momento, a pedido do cliente.

Deixar isso escrito evita surpresa e mostra transparência. Use o texto apenas se refletir o que vocês combinaram: ele não faz parte dos Termos de Uso do site hoje.

## Conferência rápida depois de publicar

- O link aparece no rodapé e abre `https://www.nexa-mp.com.br/` em outra aba?
- Não há `nofollow` no `<a>`? (Clique com o botão direito no link, "Inspecionar".)
- O texto está legível no celular, sem cobrir botões (por exemplo, o do WhatsApp)?