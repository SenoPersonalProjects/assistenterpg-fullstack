export function adicionarCamadaDialogo(camadas: string[], id: string): string[] {
  return camadas.includes(id) ? camadas : [...camadas, id];
}

export function removerCamadaDialogo(camadas: string[], id: string): string[] {
  return camadas.filter((camada) => camada !== id);
}

export function indiceCamadaDialogo(camadas: string[], id: string): number {
  return camadas.indexOf(id);
}

export function zIndexCamadaDialogo(indice: number): number {
  const CAMADA_BASE = 50;
  const INTERVALO_ENTRE_CAMADAS = 10;
  return CAMADA_BASE + Math.max(0, indice) * INTERVALO_ENTRE_CAMADAS;
}
