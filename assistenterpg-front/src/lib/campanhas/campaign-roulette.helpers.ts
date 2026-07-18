export type RepeticaoRoleta = { nome: string; quantidade: number };

export function agruparRepeticoesRoleta(texto: string): RepeticaoRoleta[] {
  const mapa = new Map<string, RepeticaoRoleta>();
  for (const entrada of texto.split(';').map((item) => item.trim()).filter(Boolean)) {
    const chave = entrada.toLocaleLowerCase('pt-BR');
    const atual = mapa.get(chave);
    mapa.set(chave, {
      nome: atual?.nome ?? entrada,
      quantidade: (atual?.quantidade ?? 0) + 1,
    });
  }
  return [...mapa.values()].filter((item) => item.quantidade > 1);
}
