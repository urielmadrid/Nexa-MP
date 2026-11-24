"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ESTILO_CRM } from "@/src/components/crm/estiloCrm";

type Props = { estado: "login" | "nao_configurado" };
type Canal = { id: "email" | "whatsapp"; destino: string };
type Etapa = "senha" | "canal" | "codigo";

const NOME_CANAL: Record<Canal["id"], string> = { email: "E-mail", whatsapp: "WhatsApp" };

async function lerJson(resp: Response): Promise<Record<string, unknown>> {
  try {
    const dado: unknown = await resp.json();
    return typeof dado === "object" && dado !== null ? (dado as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export default function CrmAcesso({ estado }: Props) {
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [etapa, setEtapa] = useState<Etapa>("senha");
  const [canais, setCanais] = useState<Canal[]>([]);
  const [canalEscolhido, setCanalEscolhido] = useState<Canal | null>(null);
  const [codigo, setCodigo] = useState("");
  const [espera, setEspera] = useState(0);

  // Contagem regressiva do "Reenviar código".
  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  function voltarParaSenha(mensagem = "") {
    setEtapa("senha");
    setCanais([]);
    setCanalEscolhido(null);
    setCodigo("");
    setEspera(0);
    setSenha("");
    setErro(mensagem);
  }

  async function entrar(e: FormEvent) {
    e.preventDefault();
    if (enviando || senha === "") return;
    setEnviando(true);
    setErro("");
    try {
      const resp = await fetch("/api/crm/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha }),
      });
      const corpo = await lerJson(resp);
      if (resp.ok) {
        if (corpo.etapa === "codigo" && Array.isArray(corpo.canais) && corpo.canais.length > 0) {
          setCanais(corpo.canais as Canal[]);
          setSenha("");
          setEtapa("canal");
          return;
        }
        window.location.reload();
        return;
      }
      if (resp.status === 401) setErro("Senha incorreta.");
      else if (resp.status === 429) setErro("Muitas tentativas. Aguarde alguns minutos e tente de novo.");
      else if (resp.status === 503 && corpo.erro === "doisfatores_nao_configurado") setErro("A verificação em duas etapas está ligada, mas o envio do código ainda não foi configurado no servidor.");
      else if (resp.status === 503) setErro("O acesso ainda não foi configurado no servidor.");
      else setErro("Não foi possível entrar agora. Tente novamente.");
    } catch {
      setErro("Sem conexão. Verifique a internet e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  async function enviarCodigo(canal: Canal) {
    if (enviando) return;
    setEnviando(true);
    setErro("");
    try {
      const resp = await fetch("/api/crm/codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canal: canal.id }),
      });
      const corpo = await lerJson(resp);
      if (resp.ok) {
        setCanalEscolhido({ id: canal.id, destino: typeof corpo.destino === "string" ? corpo.destino : canal.destino });
        setCodigo("");
        setEspera(typeof corpo.reenviarEm === "number" ? corpo.reenviarEm : 30);
        setEtapa("codigo");
        return;
      }
      if (resp.status === 401 || resp.status === 410) voltarParaSenha("O tempo para confirmar acabou. Digite a senha de novo.");
      else if (resp.status === 429 && corpo.erro === "aguarde") {
        const seg = typeof corpo.segundos === "number" ? corpo.segundos : 30;
        setEspera(seg);
        setErro(`Aguarde ${seg} segundos para pedir outro código.`);
      } else if (resp.status === 429) voltarParaSenha("Você já pediu o máximo de códigos. Entre de novo com a senha para recomeçar.");
      else if (resp.status === 502) setErro(`Não foi possível enviar o código por ${NOME_CANAL[canal.id]} agora.${canais.length > 1 ? " Tente o outro meio." : " Tente de novo em instantes."}`);
      else setErro("Não foi possível enviar o código agora. Tente novamente.");
    } catch {
      setErro("Sem conexão. Verifique a internet e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarCodigo(e: FormEvent) {
    e.preventDefault();
    if (enviando || codigo.replace(/\D/g, "").length !== 6) return;
    setEnviando(true);
    setErro("");
    try {
      const resp = await fetch("/api/crm/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo }),
      });
      if (resp.ok) {
        window.location.reload();
        return;
      }
      const corpo = await lerJson(resp);
      if (resp.status === 401 && corpo.erro === "codigo") {
        const r = typeof corpo.restantes === "number" ? corpo.restantes : 0;
        setErro(r > 0 ? `Código incorreto. Você ainda tem ${r} tentativa(s) com este código.` : "Código incorreto.");
        setCodigo("");
      } else if (resp.status === 401 || resp.status === 410) voltarParaSenha("O tempo para confirmar acabou. Digite a senha de novo.");
      else if (resp.status === 429) setErro("Tentativas esgotadas para este código. Peça um novo código.");
      else if (resp.status === 409) setErro("Peça o envio de um código antes de confirmar.");
      else setErro("Não foi possível confirmar agora. Tente novamente.");
    } catch {
      setErro("Sem conexão. Verifique a internet e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="crm">
      <style dangerouslySetInnerHTML={{ __html: ESTILO_CRM }} />
      <main className="crm-acesso">
        <div className="crm-acesso-caixa">
          <div className="crm-marca">
            <b>N</b>
            <span>Nexa MP</span>
            <span className="crm-selo-interno">Interno</span>
          </div>

          {estado === "nao_configurado" ? (
            <>
              <h1>Acesso ainda não configurado</h1>
              <p className="crm-sub">Por segurança, o CRM fica trancado até que duas variáveis de ambiente sejam definidas no servidor:</p>
              <ul className="crm-lista-simples" style={{ marginTop: 12 }}>
                <li>
                  <code>CRM_SENHA</code>: a senha dos diretores (mínimo 8 caracteres).
                </li>
                <li>
                  <code>CRM_SEGREDO</code>: um texto longo e aleatório (mínimo 32 caracteres) que protege o login.
                </li>
              </ul>
              <p className="crm-sub" style={{ marginTop: 12 }}>
                Coloque as duas no arquivo <code>.env.local</code> (para testar no computador) e nas variáveis de ambiente da Vercel (para o site publicado). Depois reinicie o servidor.
              </p>
            </>
          ) : etapa === "canal" ? (
            <div>
              <h1>Verificação em duas etapas</h1>
              <p className="crm-sub">Por onde você quer receber o código de 6 dígitos?</p>
              <div className="crm-canais">
                {canais.map((c) => (
                  <button key={c.id} type="button" className="crm-canal" disabled={enviando || espera > 0} onClick={() => void enviarCodigo(c)}>
                    <span>
                      <b>{NOME_CANAL[c.id]}</b>
                      <small>{c.destino}</small>
                    </span>
                  </button>
                ))}
              </div>
              <p className="crm-erro" role="alert">
                {erro}
              </p>
              <div className="crm-links">
                <button type="button" className="crm-link" onClick={() => voltarParaSenha()}>
                  Voltar
                </button>
                {espera > 0 ? <span className="crm-sub">Aguarde {espera}s</span> : null}
              </div>
            </div>
          ) : etapa === "codigo" && canalEscolhido ? (
            <form onSubmit={confirmarCodigo} noValidate>
              <h1>Digite o código</h1>
              <p className="crm-sub">
                Enviamos um código de 6 dígitos para o {NOME_CANAL[canalEscolhido.id]} da Nexa ({canalEscolhido.destino}). Ele vale por 10 minutos.
              </p>
              <label className="crm-campo" style={{ marginTop: 16 }}>
                Código
                <input
                  className="crm-codigo"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                />
              </label>
              <p className="crm-erro" role="alert">
                {erro}
              </p>
              <button type="submit" className="crm-btn crm-btn-p" style={{ width: "100%", marginTop: 8 }} disabled={enviando || codigo.length !== 6}>
                {enviando ? "Confirmando..." : "Confirmar e entrar"}
              </button>
              <div className="crm-links">
                <button type="button" className="crm-link" disabled={enviando || espera > 0} onClick={() => void enviarCodigo(canalEscolhido)}>
                  {espera > 0 ? `Reenviar código (${espera}s)` : "Reenviar código"}
                </button>
                <button type="button" className="crm-link" onClick={() => { setEtapa("canal"); setErro(""); setCodigo(""); }}>
                  {canais.length > 1 ? "Escolher outro meio" : "Voltar"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={entrar} noValidate>
              <h1>Acesso restrito</h1>
              <p className="crm-sub">Área exclusiva da diretoria.</p>
              <label className="crm-campo" style={{ marginTop: 16 }}>
                Senha
                <input type="password" autoComplete="current-password" autoFocus value={senha} onChange={(e) => setSenha(e.target.value)} maxLength={200} />
              </label>
              <p className="crm-erro" role="alert">
                {erro}
              </p>
              <button type="submit" className="crm-btn crm-btn-p" style={{ width: "100%", marginTop: 8 }} disabled={enviando || senha === ""}>
                {enviando ? "Entrando..." : "Entrar"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}