export type Projeto = {
  id: string;
  nome: string;
  segmento: string;
  problema: string;
  solucao: string;
  resultado: string;
  imagem?: string;
};

// O portfólio público só deve exibir cases reais e aprovados para divulgação.
// Quando houver um case pronto, adicione-o aqui com dados verificáveis.
export const PROJETOS: Projeto[] = [];
