/**
 * Visual das janelinhas de contato do site (a de "Quero este plano" e a de "Falar com a Nexa MP").
 * As duas usam as mesmas classes (prefixo cp-), então o estilo fica num lugar só.
 */
export const ESTILO_JANELA_CONTATO = `
.cp{position:fixed;inset:0;margin:auto;height:fit-content;width:calc(100vw - 24px);max-width:560px;max-height:calc(100dvh - 24px);padding:0;border:0;background:transparent;color:#f7f7f5;overflow:visible}
.cp *{box-sizing:border-box}
.cp::backdrop{background:rgba(0,0,0,.74);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.cp[open]{animation:cp-fade .25s ease-out}
.cp[open]::backdrop{animation:cp-fade .25s ease-out}
.cp-caixa{position:relative;max-height:calc(100dvh - 24px);overflow-y:auto;padding:30px 28px 28px;border:1px solid rgba(255,106,0,.4);border-radius:26px;background:linear-gradient(160deg,#141414,#0b0b0b);box-shadow:0 40px 120px rgba(0,0,0,.7),0 0 60px rgba(255,106,0,.1);overscroll-behavior:contain}
.cp[open] .cp-caixa{animation:cp-entra .35s cubic-bezier(.2,.9,.3,1)}
.cp-fechar{position:absolute;right:14px;top:14px;display:grid;place-items:center;width:38px;height:38px;border:1px solid rgba(255,255,255,.14);border-radius:50%;background:rgba(255,255,255,.04);color:#fff;cursor:pointer;transition:background-color .25s ease,border-color .25s ease}
.cp-fechar:hover{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.35)}
.cp-fechar:focus-visible{outline:2px solid #ff6a00;outline-offset:2px}
.cp-fechar svg{width:16px;height:16px}
.cp-mini{font:700 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.2em;text-transform:uppercase;color:#ff9a4d}
.cp-titulo{margin:12px 44px 0 0;font-size:clamp(22px,4vw,28px);line-height:1.15;font-weight:800;letter-spacing:-.01em}
.cp-detalhe{margin:6px 0 0;font-size:14px;color:rgba(255,255,255,.55)}
.cp-pergunta{margin:22px 0 12px;font-size:15px;font-weight:700;color:rgba(255,255,255,.9)}

.cp-opcao{margin:0;padding:20px;border:1px solid rgba(255,255,255,.12);border-radius:20px;background:rgba(255,255,255,.03)}
.cp-opcao + .cp-opcao{margin-top:12px}
.cp-opcao-topo{display:flex;gap:14px;align-items:flex-start}
.cp-num{flex:none;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,106,0,.55);background:rgba(255,106,0,.12);color:#ff6a00;font-size:13px;font-weight:800}
.cp-opcao h3{margin:0;font-size:16px;font-weight:800;color:#fff}
.cp-opcao-topo p{margin:4px 0 0;font-size:13px;line-height:1.55;color:rgba(255,255,255,.55)}

.cp-canais{margin:18px 0 0;padding:0;border:0;min-width:0}
.cp-canais legend{padding:0;margin:0 0 10px;font-size:13px;font-weight:700;color:rgba(255,255,255,.8)}
.cp-chips{display:flex;flex-wrap:wrap;gap:8px}
.cp-chip{position:relative;display:inline-block;cursor:pointer}
.cp-radio{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:pointer}
.cp-chip span{display:inline-block;padding:10px 14px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(255,255,255,.03);font-size:13px;font-weight:700;color:rgba(255,255,255,.75);transition:background-color .25s ease,border-color .25s ease,color .25s ease}
.cp-chip:hover span{border-color:rgba(255,106,0,.6);color:#fff}
.cp-radio:checked + span{background:#ff6a00;border-color:#ff6a00;color:#fff}
.cp-radio:focus-visible + span{outline:2px solid #fff;outline-offset:2px}

.cp-contato{margin-top:16px}
.cp-contato label.cp-rot{display:block;font-size:13px;font-weight:700;color:rgba(255,255,255,.8)}
.cp-campo{width:100%;margin-top:8px;padding:13px 14px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(255,255,255,.04);color:#fff;font-family:inherit;font-size:15px;outline:none;transition:border-color .25s ease}
.cp-campo::placeholder{color:rgba(255,255,255,.3)}
.cp-campo:focus-visible{border-color:#ff6a00;box-shadow:0 0 0 3px rgba(255,106,0,.25)}
.cp-dica{margin:6px 0 0;font-size:12px;color:rgba(255,255,255,.42)}
.cp-aceite{display:flex;gap:10px;align-items:flex-start;margin-top:14px;font-size:12.5px;line-height:1.55;color:rgba(255,255,255,.65);cursor:pointer}
.cp-aceite input{flex:none;width:18px;height:18px;margin:1px 0 0;accent-color:#ff6a00}
.cp-aceite a{color:#ff9a4d;text-underline-offset:3px}

.cp-previa{margin-top:16px;padding:14px 16px;border-left:2px solid #ff6a00;border-radius:0 12px 12px 0;background:rgba(255,106,0,.06)}
.cp-previa p{margin:8px 0 0;font-size:13.5px;line-height:1.6;color:rgba(255,255,255,.8);white-space:pre-line;overflow-wrap:anywhere}

.cp-botao{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:16px;padding:14px 20px;border:0;border-radius:12px;font-family:inherit;font-size:14px;font-weight:700;line-height:1.2;text-align:center;text-decoration:none;cursor:pointer;transition:transform .3s ease,background-color .3s ease,color .3s ease,opacity .3s ease}
.cp-botao:hover{transform:translateY(-2px)}
.cp-botao:active{transform:translateY(0) scale(.98)}
.cp-botao:focus-visible{outline:2px solid #fff;outline-offset:3px}
.cp-botao-p{background:#ff6a00;color:#fff;box-shadow:0 0 30px rgba(255,106,0,.22)}
.cp-botao-p:hover{background:#fff;color:#000}
.cp-botao-o{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.04);color:#fff}
.cp-botao-o:hover{border-color:rgba(255,255,255,.45);background:rgba(255,255,255,.1)}
.cp-botao[disabled]{opacity:.55;cursor:not-allowed}
.cp-botao[disabled]:hover{transform:none;background:#ff6a00;color:#fff}

.cp-status{min-height:1.4rem;margin-top:12px;font-size:12.5px;line-height:1.55}
.cp-aviso{margin:0;padding:11px 13px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(255,255,255,.05);color:rgba(255,255,255,.8)}
.cp-erro{border-color:rgba(255,106,0,.6);background:rgba(255,106,0,.1);color:#fff}
.cp-ok{border-color:rgba(255,106,0,.45);background:rgba(255,106,0,.1);color:#fff;font-weight:600}
.cp-status a{color:#ff9a4d;text-underline-offset:3px}
.cp-isca{position:absolute;left:-9999px;width:0;height:0;overflow:hidden}
.cp-nota{margin:12px 0 0;font-size:11.5px;line-height:1.55;color:rgba(255,255,255,.4)}

.cp:focus,.cp:focus-visible{outline:none}
.cp-pagar{margin-top:20px;padding:20px;border:1px solid rgba(255,106,0,.65);border-radius:20px;background:linear-gradient(160deg,rgba(255,106,0,.18),rgba(255,106,0,.04));box-shadow:0 0 40px rgba(255,106,0,.12)}
.cp-pagar h3{margin:10px 0 0;font-size:19px;font-weight:800;color:#fff}
.cp-pagar p{margin:6px 0 0;font-size:13px;line-height:1.55;color:rgba(255,255,255,.62)}
.cp-botao svg{flex:none;width:16px;height:16px}
.cp-separador{display:flex;align-items:center;gap:12px;margin:22px 0 14px;font-size:14px;font-weight:700;color:rgba(255,255,255,.85)}
.cp-separador::before,.cp-separador::after{content:"";flex:1;height:1px;background:rgba(255,255,255,.14)}
@keyframes cp-fade{from{opacity:0}to{opacity:1}}
@keyframes cp-entra{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:none}}
@media (max-width:480px){
  .cp-caixa{padding:26px 18px 20px;border-radius:22px}
  .cp-opcao{padding:16px}
  .cp-chip span{padding:9px 12px}
}
@media (prefers-reduced-motion:reduce){
  .cp,.cp::backdrop,.cp .cp-caixa{animation:none!important}
  .cp *{transition:none!important}
}
`;