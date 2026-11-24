import { bancoConfigurado, obterBanco } from "@/src/lib/crm/servidor/banco";
import { gravarEnvio } from "@/src/lib/crm/servidor/leads";
import type { EnvioNormalizado } from "@/src/lib/formulario/tipos";

/**
 * Onde os envios do formulário ficam guardados.
 *
 * Com a variável DATABASE_URL definida, cada envio vira um lead no CRM (MySQL: tabelas "crm_*", veja
 * src/lib/crm/servidor/esquema.ts). Sem ela, não guarda nada e o e-mail é o único registro.
 */
export interface RepositorioDeEnvios {
  /** Há um banco ligado? Se não, a rota só depende do e-mail. */
  readonly ativo: boolean;
  /**
   * Guarda o envio já validado e normalizado. É atômico (tudo ou nada) e idempotente pelo id do envio:
   * repetir o mesmo id não duplica nada.
   */
  salvar(envio: EnvioNormalizado): Promise<void>;
}

/** Sem banco: não guarda nada. O e-mail é o único registro. */
export const repositorioSemBanco: RepositorioDeEnvios = {
  ativo: false,
  async salvar() {
    /* sem banco de dados */
  },
};

export const repositorioMysql: RepositorioDeEnvios = {
  ativo: true,
  async salvar(envio) {
    await gravarEnvio(obterBanco(), envio);
  },
};

export const repositorio: RepositorioDeEnvios = bancoConfigurado() ? repositorioMysql : repositorioSemBanco;