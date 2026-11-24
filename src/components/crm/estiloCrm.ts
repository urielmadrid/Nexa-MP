/** Estilo do CRM (prefixo "crm-"). Em CSS comum, no mesmo tema escuro e laranja do site. */
export const ESTILO_CRM = `
.crm{--bg:#070707;--painel:#0f0f0f;--painel2:#141414;--linha:rgba(255,255,255,.09);--texto:#f7f7f5;--suave:rgba(255,255,255,.58);--fraco:rgba(255,255,255,.36);--laranja:#ff6a00;min-height:100vh;background:var(--bg);color:var(--texto);font-size:14px;line-height:1.5}
.crm *{box-sizing:border-box}
.crm button,.crm input,.crm select,.crm textarea{font:inherit;color:inherit}
.crm button{cursor:pointer}
.crm :focus-visible{outline:2px solid var(--laranja);outline-offset:2px}
.crm a{color:inherit}
.crm-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}

/* topo */
.crm-topo{position:sticky;top:0;z-index:40;display:flex;align-items:center;gap:12px;padding:10px 20px;background:rgba(10,10,10,.96);border-bottom:1px solid var(--linha)}
.crm-marca{display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:-.01em;white-space:nowrap}
.crm-marca b{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--laranja);color:#fff;font-size:13px}
.crm-selo-interno{padding:3px 8px;border:1px solid rgba(255,106,0,.4);border-radius:999px;color:#ff9a4d;font:700 9px/1 ui-monospace,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase}
.crm-busca{position:relative;flex:1;max-width:460px;margin-left:8px}
.crm-busca input{width:100%;padding:9px 12px 9px 34px;border:1px solid var(--linha);border-radius:10px;background:var(--painel);outline:none}
.crm-busca input:focus{border-color:var(--laranja)}
.crm-busca svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--fraco)}
.crm-topo-acoes{display:flex;align-items:center;gap:8px;margin-left:auto}
.crm-menu-filtros{display:none}

/* botões */
.crm-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:8px 13px;border:1px solid var(--linha);border-radius:10px;background:var(--painel2);font-weight:600;font-size:13px;white-space:nowrap;transition:border-color .15s,background .15s}
.crm-btn:hover{border-color:rgba(255,255,255,.28);background:#1a1a1a}
.crm-btn-p{background:var(--laranja);border-color:var(--laranja);color:#fff}
.crm-btn-p:hover{background:#ff7d26;border-color:#ff7d26}
.crm-btn-perigo{color:#ff8a7a;border-color:rgba(255,90,60,.35)}
.crm-btn-perigo:hover{background:rgba(255,90,60,.12);border-color:rgba(255,90,60,.6)}
.crm-btn-mini{padding:4px 9px;font-size:12px;border-radius:8px}
.crm-btn[disabled]{opacity:.45;pointer-events:none}
.crm-icone-btn{display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:8px;background:transparent;color:var(--fraco)}
.crm-icone-btn:hover{background:rgba(255,255,255,.08);color:#fff}

/* estrutura */
.crm-corpo{display:grid;grid-template-columns:268px minmax(0,1fr);align-items:start}
.crm-lateral{position:sticky;top:53px;height:calc(100vh - 53px);overflow:auto;padding:16px 12px 24px;border-right:1px solid var(--linha);background:#090909}
.crm-principal{min-width:0;padding:20px 24px 60px}
.crm-grupo-titulo{display:flex;align-items:center;justify-content:space-between;margin:18px 8px 6px;color:var(--fraco);font:700 10px/1 ui-monospace,Menlo,monospace;letter-spacing:.18em;text-transform:uppercase}
.crm-grupo-titulo:first-child{margin-top:4px}
.crm-item{display:flex;align-items:center;gap:9px;width:100%;padding:7px 8px;border:0;border-radius:9px;background:transparent;text-align:left;color:var(--suave)}
.crm-item:hover{background:rgba(255,255,255,.05);color:#fff}
.crm-item[aria-current="true"]{background:rgba(255,106,0,.13);color:#fff;box-shadow:inset 2px 0 0 var(--laranja)}
.crm-item-nome{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.crm-item-n{font:600 11px/1 ui-monospace,Menlo,monospace;color:var(--fraco)}
.crm-bolinha{flex:none;width:9px;height:9px;border-radius:50%}
.crm-pasta-linha{display:flex;align-items:center}
.crm-pasta-linha .crm-item{flex:1;min-width:0}
.crm-pasta-acoes{display:none;gap:0}
.crm-pasta-linha:hover .crm-pasta-acoes,.crm-pasta-linha:focus-within .crm-pasta-acoes{display:flex}

/* avisos */
.crm-aviso{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px;padding:10px 14px;border:1px solid var(--linha);border-radius:12px;background:var(--painel);color:var(--suave);font-size:12.5px}
.crm-aviso-laranja{border-color:rgba(255,106,0,.4);background:rgba(255,106,0,.07);color:#ffc9a3}
.crm-aviso-erro{border-color:rgba(255,90,60,.5);background:rgba(255,90,60,.09);color:#ffb3a6}
.crm-aviso .crm-btn{margin-left:auto}

/* cabeçalho da área principal */
.crm-cabeca{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:16px}
.crm-titulo{margin:0;font-size:22px;font-weight:800;letter-spacing:-.02em}
.crm-sub{margin:2px 0 0;color:var(--suave);font-size:13px}
.crm-abas{display:inline-flex;padding:3px;border:1px solid var(--linha);border-radius:12px;background:var(--painel)}
.crm-aba{display:inline-flex;align-items:center;gap:7px;padding:7px 14px;border:0;border-radius:9px;background:transparent;color:var(--suave);font-weight:600;font-size:13px}
.crm-aba:hover{color:#fff}
.crm-aba[aria-selected="true"]{background:var(--laranja);color:#fff}

/* painel */
.crm-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}
.crm-kpi{padding:14px 16px;border:1px solid var(--linha);border-radius:14px;background:var(--painel)}
.crm-kpi-rotulo{display:flex;align-items:center;gap:7px;color:var(--suave);font-size:12px}
.crm-kpi-valor{margin-top:6px;font-size:28px;line-height:1.1;font-weight:800;letter-spacing:-.03em}
.crm-kpi-valor small{font-size:15px;font-weight:700;color:var(--suave)}
.crm-kpi-nota{margin-top:4px;color:var(--fraco);font-size:11.5px}
.crm-kpi-destaque{border-color:rgba(255,106,0,.45);background:linear-gradient(160deg,rgba(255,106,0,.12),var(--painel) 60%)}
.crm-grade{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px;margin-top:12px}
.crm-card{grid-column:span 6;min-width:0;padding:16px 18px;border:1px solid var(--linha);border-radius:14px;background:var(--painel)}
.crm-card-4{grid-column:span 4}
.crm-card-8{grid-column:span 8}
.crm-card-12{grid-column:span 12}
.crm-card h3{margin:0;font-size:13.5px;font-weight:700}
.crm-card-dica{margin:2px 0 12px;color:var(--fraco);font-size:12px}
.crm-vazio-card{padding:18px 4px;color:var(--fraco);font-size:12.5px}

/* gráficos */
.crm-barras{display:grid;gap:9px}
.crm-barra-linha{display:grid;grid-template-columns:minmax(0,38%) minmax(0,1fr) 28px;align-items:center;gap:10px;font-size:12.5px}
.crm-barra-rotulo{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--suave)}
.crm-barra-trilho{display:block;height:9px;border-radius:99px;background:rgba(255,255,255,.07);overflow:hidden}
.crm-barra-preenche{display:block;height:100%;border-radius:99px;background:var(--laranja)}
.crm-barra-n{text-align:right;font:600 12px/1 ui-monospace,Menlo,monospace;color:var(--suave)}
.crm-serie{display:block;width:100%;height:130px}
.crm-serie-eixo{display:flex;justify-content:space-between;margin-top:4px;color:var(--fraco);font:600 10px/1 ui-monospace,Menlo,monospace}
.crm-funil{display:grid;gap:8px}
.crm-funil-linha{display:grid;grid-template-columns:96px minmax(0,1fr) 54px;align-items:center;gap:10px;font-size:12.5px}
.crm-funil-barra{height:26px;border-radius:7px;display:flex;align-items:center;padding-left:9px;font-weight:700;font-size:12px;color:#0b0b0b}
.crm-rosca-caixa{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.crm-rosca{position:relative;width:118px;height:118px;border-radius:50%}
.crm-rosca::after{content:"";position:absolute;inset:24px;border-radius:50%;background:var(--painel)}
.crm-rosca-centro{position:absolute;inset:0;z-index:1;display:grid;place-items:center;text-align:center;font-weight:800;font-size:20px;line-height:1}
.crm-rosca-centro small{display:block;margin-top:3px;color:var(--fraco);font:600 9px/1 ui-monospace,Menlo,monospace;letter-spacing:.1em;text-transform:uppercase}
.crm-legenda{display:grid;gap:7px;font-size:12.5px}
.crm-legenda div{display:flex;align-items:center;gap:8px;color:var(--suave)}
.crm-legenda b{margin-left:auto;padding-left:14px;color:#fff}

/* prioridades */
.crm-prio{display:grid;gap:8px}
.crm-prio-linha{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1.6fr) auto;align-items:center;gap:14px;width:100%;padding:10px 12px;border:1px solid var(--linha);border-radius:12px;background:var(--painel2);text-align:left}
.crm-prio-linha:hover{border-color:rgba(255,106,0,.5)}
.crm-prio-nome{min-width:0}
.crm-prio-nome strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.crm-prio-nome span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--fraco);font-size:12px}
.crm-prio-acao{color:var(--suave);font-size:12.5px}

/* selos e tag do sistema */
.crm-selo{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:999px;border:1px solid var(--linha);background:rgba(255,255,255,.04);color:var(--suave);font-size:11.5px;font-weight:600;white-space:nowrap}
.crm-selo i{width:7px;height:7px;border-radius:50%;display:inline-block}
.crm-tag-sistema{display:inline-block;max-width:100%;padding:3px 9px;border:1px solid rgba(255,106,0,.45);border-radius:8px;background:rgba(255,106,0,.1);color:#ffb07a;font-size:12px;font-weight:600;line-height:1.35}
.crm-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:7px;background:rgba(255,255,255,.07);color:var(--suave);font-size:11.5px}
.crm-tag button{border:0;background:none;padding:0;color:var(--fraco);line-height:1}
.crm-tag button:hover{color:#fff}

/* funil (kanban) */
.crm-kanban{display:grid;grid-template-columns:repeat(6,minmax(235px,1fr));gap:10px;overflow-x:auto;padding-bottom:10px}
.crm-coluna{display:flex;flex-direction:column;min-height:320px;padding:10px;border:1px solid var(--linha);border-radius:14px;background:var(--painel)}
.crm-coluna[data-alvo="true"]{border-color:var(--laranja);background:rgba(255,106,0,.06)}
.crm-coluna-topo{display:flex;align-items:center;gap:8px;margin-bottom:10px;font-weight:700;font-size:13px}
.crm-coluna-topo span:last-child{margin-left:auto;font:600 11px/1 ui-monospace,Menlo,monospace;color:var(--fraco)}
.crm-cartao{display:block;width:100%;margin-bottom:8px;padding:10px 11px;border:1px solid var(--linha);border-radius:11px;background:var(--painel2);text-align:left;cursor:grab}
.crm-cartao:hover{border-color:rgba(255,106,0,.5)}
.crm-cartao:active{cursor:grabbing}
.crm-cartao strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.crm-cartao .crm-sub{margin:1px 0 7px;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.crm-cartao-rodape{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:8px;color:var(--fraco);font-size:11.5px}

/* lista */
.crm-filtros{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.crm-select{padding:7px 10px;border:1px solid var(--linha);border-radius:10px;background:var(--painel);outline:none}
.crm-select:focus{border-color:var(--laranja)}
.crm-tabela-caixa{overflow-x:auto;border:1px solid var(--linha);border-radius:14px;background:var(--painel)}
.crm-tabela{width:100%;border-collapse:collapse;min-width:900px}
.crm-tabela th{padding:10px 12px;border-bottom:1px solid var(--linha);color:var(--fraco);font:700 10px/1 ui-monospace,Menlo,monospace;letter-spacing:.14em;text-align:left;text-transform:uppercase;white-space:nowrap}
.crm-tabela th button{border:0;background:none;padding:0;font:inherit;letter-spacing:inherit;text-transform:inherit;color:inherit}
.crm-tabela th button:hover{color:#fff}
.crm-tabela td{padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.05);vertical-align:middle}
.crm-tabela tr:last-child td{border-bottom:0}
.crm-tabela tbody tr{cursor:pointer}
.crm-tabela tbody tr:hover td{background:rgba(255,255,255,.03)}
.crm-tabela td strong{display:block}
.crm-tabela td small{display:block;color:var(--fraco);font-size:12px}
.crm-acoes-massa{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;padding:8px 12px;border:1px solid rgba(255,106,0,.4);border-radius:12px;background:rgba(255,106,0,.07)}
.crm-check{width:16px;height:16px;accent-color:var(--laranja)}

/* gaveta de detalhes */
.crm-fundo{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.6)}
.crm-gaveta{position:fixed;top:0;right:0;bottom:0;z-index:70;width:min(560px,100%);overflow:auto;padding:20px 22px 40px;border-left:1px solid var(--linha);background:#0b0b0b;box-shadow:-30px 0 80px rgba(0,0,0,.5)}
.crm-gaveta-topo{display:flex;align-items:flex-start;gap:12px}
.crm-gaveta-topo h2{margin:0;font-size:21px;font-weight:800;letter-spacing:-.02em}
.crm-bloco{margin-top:16px;padding:14px 16px;border:1px solid var(--linha);border-radius:14px;background:var(--painel)}
.crm-bloco h4{margin:0 0 8px;color:var(--fraco);font:700 10px/1 ui-monospace,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase}
.crm-sugestao{border-color:rgba(255,106,0,.45);background:linear-gradient(160deg,rgba(255,106,0,.1),var(--painel) 65%)}
.crm-sugestao .crm-tag-sistema{font-size:13.5px;padding:6px 11px}
.crm-lista-simples{margin:8px 0 0;padding:0;list-style:none;display:grid;gap:5px;color:var(--suave);font-size:12.5px}
.crm-lista-simples li{position:relative;padding-left:14px}
.crm-lista-simples li::before{content:"";position:absolute;left:0;top:8px;width:5px;height:5px;border-radius:50%;background:var(--laranja)}
.crm-lista-simples.alerta li::before{background:#ffb020}
.crm-campos{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.crm-campo{display:grid;gap:4px;font-size:12px;color:var(--suave)}
.crm-campo-largo{grid-column:1/-1}
.crm-campo input,.crm-campo select,.crm-campo textarea{width:100%;padding:8px 10px;border:1px solid var(--linha);border-radius:10px;background:var(--painel2);outline:none;color:#fff}
.crm-campo input:focus,.crm-campo select:focus,.crm-campo textarea:focus{border-color:var(--laranja)}
.crm-campo textarea{resize:vertical;min-height:70px}
.crm-resp{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.1fr);gap:4px 14px;font-size:12.5px}
.crm-resp dt{color:var(--fraco)}
.crm-resp dd{margin:0;color:#fff}
.crm-linha-tempo{display:grid;gap:10px;margin:10px 0 0;padding:0;list-style:none}
.crm-linha-tempo li{position:relative;padding-left:16px;font-size:12.5px;color:var(--suave)}
.crm-linha-tempo li::before{content:"";position:absolute;left:0;top:6px;width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.3)}
.crm-linha-tempo li.nota::before{background:var(--laranja)}
.crm-linha-tempo time{display:block;color:var(--fraco);font-size:11px}
.crm-acoes-linha{display:flex;gap:8px;flex-wrap:wrap}

/* modais */
.crm-modal{position:fixed;top:50%;left:50%;z-index:80;width:min(640px,calc(100% - 24px));max-height:calc(100vh - 32px);overflow:auto;transform:translate(-50%,-50%);padding:20px 22px;border:1px solid var(--linha);border-radius:18px;background:#0d0d0d;box-shadow:0 40px 120px rgba(0,0,0,.6)}
.crm-modal h2{margin:0 0 4px;font-size:19px;font-weight:800}
.crm-modal-rodape{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
.crm-cores{display:flex;gap:8px;flex-wrap:wrap}
.crm-cor{width:26px;height:26px;border:2px solid transparent;border-radius:50%}
.crm-cor[aria-pressed="true"]{border-color:#fff}
.crm-marcas{display:flex;gap:6px;flex-wrap:wrap}
.crm-marca-op{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border:1px solid var(--linha);border-radius:999px;background:var(--painel2);font-size:12.5px}
.crm-marca-op:has(input:checked){border-color:var(--laranja);background:rgba(255,106,0,.12)}

/* vazio, login, toast */
.crm-vazio{display:grid;place-items:center;gap:6px;padding:48px 20px;border:1px dashed rgba(255,255,255,.18);border-radius:18px;text-align:center}
.crm-vazio h3{margin:0;font-size:18px}
.crm-vazio p{max-width:440px;margin:0;color:var(--suave)}
.crm-toast{position:fixed;left:50%;bottom:22px;z-index:90;transform:translateX(-50%);padding:10px 16px;border:1px solid rgba(255,106,0,.5);border-radius:12px;background:#17120d;color:#ffd3b3;font-size:13px;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.crm-acesso{display:grid;place-items:center;min-height:100vh;padding:24px;background:radial-gradient(circle at 20% 10%,rgba(255,106,0,.12),transparent 40%),#070707}
.crm-acesso-caixa{width:min(400px,100%);padding:28px;border:1px solid var(--linha);border-radius:20px;background:#0d0d0d}
.crm-canais{display:grid;gap:10px;margin-top:16px}
.crm-canal{display:flex;align-items:center;width:100%;text-align:left;padding:13px 14px;border:1px solid var(--linha);border-radius:12px;background:var(--painel2)}
.crm-canal:hover:not(:disabled){border-color:var(--laranja)}
.crm-canal:disabled{opacity:.55;cursor:default}
.crm-canal b{display:block;font-size:15px}
.crm-canal small{display:block;margin-top:2px;color:var(--suave);font-size:12.5px}
.crm .crm-campo input.crm-codigo{text-align:center;font-size:24px;letter-spacing:.45em;font-variant-numeric:tabular-nums;padding:10px}
.crm-links{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:14px;flex-wrap:wrap}
.crm .crm-link{background:none;border:0;padding:0;color:var(--laranja);text-decoration:underline;font-size:13px}
.crm .crm-link:disabled{color:var(--fraco);text-decoration:none;cursor:default}
.crm-acesso-caixa h1{margin:14px 0 4px;font-size:22px;font-weight:800;letter-spacing:-.02em}
.crm-erro{min-height:18px;margin:8px 0 0;color:#ff9a7a;font-size:12.5px}


.crm-fundo-menu{display:none;position:fixed;inset:53px 0 0 0;z-index:45;background:rgba(0,0,0,.55)}
.crm-menu-pop{position:absolute;right:0;top:calc(100% + 6px);z-index:55;min-width:270px;padding:6px;border:1px solid var(--linha);border-radius:12px;background:#0d0d0d;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.crm-menu-item{display:block;width:100%;padding:9px 11px;border:0;border-radius:8px;background:transparent;text-align:left;font-size:13px}
.crm-menu-item:hover{background:rgba(255,255,255,.07)}
.crm-menu-item small{display:block;color:var(--fraco);font-size:11.5px}
.crm-rodape-lateral{margin:18px 4px 0;padding:12px;border:1px dashed rgba(255,255,255,.16);border-radius:12px;color:var(--suave);font-size:12px}
.crm-rodape-lateral p{margin:0 0 8px}


/* cartões clicáveis do painel */
.crm-kpi{transition:border-color .15s,transform .15s,background .15s}
button.crm-kpi{display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;width:100%;text-align:left;font:inherit;color:inherit}
.crm-kpi-link{cursor:pointer}
.crm-kpi-link:hover{border-color:rgba(255,106,0,.65);background:#141414;transform:translateY(-1px)}
.crm-kpi-ver{display:inline-block;margin-top:8px;color:#ff9a4d;font-size:11.5px;font-weight:700}
.crm-kpi-icone{display:grid;place-items:center;width:24px;height:24px;border-radius:8px;background:rgba(255,255,255,.07);color:var(--suave)}
.crm-kpi[data-tom="quente"] .crm-kpi-icone{background:rgba(255,90,60,.2);color:#ff8a70}
.crm-kpi[data-tom="atencao"] .crm-kpi-icone{background:rgba(255,176,32,.2);color:#ffc460}
.crm-kpi[data-tom="laranja"] .crm-kpi-icone{background:rgba(255,106,0,.2);color:#ff9a4d}
.crm-kpi[data-tom="ok"] .crm-kpi-icone{background:rgba(62,207,142,.2);color:#6fe0ac}
.crm-atencao{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:12px;padding:10px 14px;border:1px solid rgba(255,176,32,.38);border-radius:12px;background:rgba(255,176,32,.06);font-size:13px}
.crm-atencao-ok{border-color:rgba(62,207,142,.35);background:rgba(62,207,142,.06);color:#a6ecc9}
.crm-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(255,255,255,.06);font-size:12.5px;font-weight:600}
.crm-chip:hover{border-color:var(--laranja);background:rgba(255,106,0,.14)}
.crm-filtro-ativo{display:inline-flex;align-items:center;gap:8px;margin-top:8px;padding:4px 5px 4px 12px;border:1px solid rgba(255,106,0,.5);border-radius:999px;background:rgba(255,106,0,.1);color:#ffc9a3;font-size:12.5px}
.crm-filtro-ativo button{padding:3px 10px;border:0;border-radius:999px;background:rgba(255,255,255,.1);font-size:12px;font-weight:700}
.crm-filtro-ativo button:hover{background:rgba(255,255,255,.2)}
.crm-item-n[data-tom="quente"]{padding:2px 7px;border-radius:99px;background:rgba(255,90,60,.22);color:#ff9a85}
.crm-item-n[data-tom="atencao"]{padding:2px 7px;border-radius:99px;background:rgba(255,176,32,.22);color:#ffc460}
.crm-legenda-temp{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:10px;color:var(--suave);font-size:12px}
.crm-legenda-temp span{display:inline-flex;align-items:center;gap:6px}
.crm-legenda-temp i{width:4px;height:14px;border-radius:2px;display:inline-block}

.crm-selo-banco{display:inline-flex;align-items:center;gap:6px;padding:3px 9px;border:1px solid rgba(62,207,142,.4);border-radius:999px;color:#7fe3b3;font-size:11px;font-weight:700;white-space:nowrap}
.crm-selo-banco i{width:7px;height:7px;border-radius:50%;background:#3ecf8e;display:inline-block}

/* telas menores */
@media (max-width:1180px){.crm-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.crm-card-4,.crm-card-8{grid-column:span 6}}
@media (max-width:900px){
  .crm-corpo{grid-template-columns:minmax(0,1fr)}
  .crm-lateral{position:fixed;top:53px;left:0;bottom:0;z-index:50;width:min(300px,86vw);height:auto;transform:translateX(-102%);transition:transform .2s}
  .crm-lateral[data-aberta="true"]{transform:none;box-shadow:30px 0 80px rgba(0,0,0,.6)}
  .crm-menu-filtros{display:inline-flex}
  .crm-selo-banco{display:none}
  .crm-fundo-menu[data-aberta="true"]{display:block}
  .crm-principal{padding:16px 14px 60px}
  .crm-busca{order:5;flex-basis:100%;max-width:none;margin:0}
  .crm-topo{flex-wrap:wrap}
  .crm-card,.crm-card-4,.crm-card-8{grid-column:1/-1}
  .crm-prio-linha{grid-template-columns:minmax(0,1fr) auto;gap:8px 10px}
  .crm-prio-linha>:nth-child(2){grid-column:1/-1;order:3}
  .crm-prio-acao{display:none}
  .crm-campos{grid-template-columns:1fr}
  .crm-texto-btn{display:none}
}
@media (max-width:520px){.crm-kpis{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}.crm-kpi-valor{font-size:23px}.crm-resp{grid-template-columns:1fr}}
@media print{.crm-topo,.crm-lateral,.crm-gaveta,.crm-modal{display:none!important}}
`;