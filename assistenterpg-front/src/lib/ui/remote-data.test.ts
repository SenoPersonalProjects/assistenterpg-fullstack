import { describe, expect, it } from 'vitest';
import {
  concluirCarregamentoRemoto,
  criarEstadoDadosRemotos,
  estaAtualizandoDadosRemotos,
  falharCarregamentoRemoto,
  iniciarCarregamentoRemoto,
  temDadosRemotos,
} from './remote-data';

describe('estado de dados remotos', () => {
  it('distingue primeira carga de atualização com conteúdo preservado', () => {
    const inicial = criarEstadoDadosRemotos<number>();
    const carregandoInicial = iniciarCarregamentoRemoto(inicial);
    const comDados = concluirCarregamentoRemoto(12);
    const atualizando = iniciarCarregamentoRemoto(comDados);

    expect(temDadosRemotos(carregandoInicial)).toBe(false);
    expect(estaAtualizandoDadosRemotos(carregandoInicial)).toBe(false);
    expect(temDadosRemotos(atualizando)).toBe(true);
    expect(estaAtualizandoDadosRemotos(atualizando)).toBe(true);
  });

  it('preserva o último resultado válido quando a atualização falha', () => {
    const estado = iniciarCarregamentoRemoto(concluirCarregamentoRemoto(['convite']));
    const falho = falharCarregamentoRemoto(estado, 'Sem conexão.');

    expect(falho).toEqual({
      dados: ['convite'],
      erro: 'Sem conexão.',
      carregando: false,
    });
  });
});
