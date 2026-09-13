'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  concluirCarregamentoRemoto,
  criarEstadoDadosRemotos,
  estaAtualizandoDadosRemotos,
  falharCarregamentoRemoto,
  iniciarCarregamentoRemoto,
  temDadosRemotos,
  type EstadoDadosRemotos,
} from '@/lib/ui/remote-data';

type OpcoesUseRemoteData<T> = {
  ativo?: boolean;
  dadosIniciais?: T;
  mensagemErro?: (erro: unknown) => string;
};

const MENSAGEM_ERRO_PADRAO = 'Não foi possível atualizar estes dados.';

export function useRemoteData<T>(
  carregar: () => Promise<T>,
  {
    ativo = true,
    dadosIniciais,
    mensagemErro = () => MENSAGEM_ERRO_PADRAO,
  }: OpcoesUseRemoteData<T> = {},
) {
  const [estado, setEstado] = useState<EstadoDadosRemotos<T>>(() =>
    criarEstadoDadosRemotos(dadosIniciais),
  );
  const requisicaoAtualRef = useRef(0);
  const mensagemErroRef = useRef(mensagemErro);

  useEffect(() => {
    mensagemErroRef.current = mensagemErro;
  }, [mensagemErro]);

  const recarregar = useCallback(async () => {
    const requisicao = ++requisicaoAtualRef.current;
    setEstado((atual) => iniciarCarregamentoRemoto(atual));

    try {
      const dados = await carregar();
      if (requisicao === requisicaoAtualRef.current) {
        setEstado(concluirCarregamentoRemoto(dados));
      }
      return dados;
    } catch (erro) {
      if (requisicao === requisicaoAtualRef.current) {
        setEstado((atual) =>
          falharCarregamentoRemoto(atual, mensagemErroRef.current(erro)),
        );
      }
      return undefined;
    }
  }, [carregar]);

  useEffect(() => {
    if (!ativo) {
      requisicaoAtualRef.current += 1;
      setEstado(criarEstadoDadosRemotos(dadosIniciais));
      return;
    }

    void recarregar();
  }, [ativo, dadosIniciais, recarregar]);

  useEffect(() => {
    return () => {
      requisicaoAtualRef.current += 1;
    };
  }, []);

  return {
    ...estado,
    temDados: temDadosRemotos(estado),
    atualizando: estaAtualizandoDadosRemotos(estado),
    recarregar,
    definirDados: useCallback(
      (dados: T) => setEstado(concluirCarregamentoRemoto(dados)),
      [],
    ),
  };
}
