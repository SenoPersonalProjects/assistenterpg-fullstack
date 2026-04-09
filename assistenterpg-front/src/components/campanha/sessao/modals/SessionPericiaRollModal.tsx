'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { DiceMessageCard } from '@/components/campanha/sessao/DiceMessageCard';
import { DiceScene } from '@/components/campanha/sessao/dice/DiceScene';
import { STORAGE_ANIMACAO_ROLAGEM_KEY } from '@/lib/constants/rolagem';
import { calcularResultadoDice } from '@/lib/campanha/sessao-dice';
import type { DiceRollPayload } from '@/lib/campanha/sessao-dice';
import type {
  HabilidadeRollContext,
  RolagemDanoHabilidadeSessaoPayload,
} from '@/components/campanha/sessao/types';

const ANIMACAO_PADRAO_MS = 500;

type SessionPericiaRollModalProps = {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  subtitulo?: string;
  alvoNome?: string;
  alvoTipo?: 'PERSONAGEM' | 'NPC';
  habilidadeContext?: HabilidadeRollContext | null;
  payload: DiceRollPayload | null;
  payloads?: DiceRollPayload[];
  expression?: string;
  expressions?: string[];
  enviando?: boolean;
  enviado?: boolean;
  erro?: string | null;
  duracaoMs?: number;
  onRolarDano?: (payload: RolagemDanoHabilidadeSessaoPayload) => void;
};

export function SessionPericiaRollModal({
  isOpen,
  onClose,
  titulo,
  subtitulo,
  alvoNome,
  alvoTipo,
  habilidadeContext = null,
  payload,
  payloads,
  expression,
  expressions,
  enviando = false,
  enviado = false,
  erro = null,
  duracaoMs = ANIMACAO_PADRAO_MS,
  onRolarDano,
}: SessionPericiaRollModalProps) {
  const [mostrandoResultado, setMostrandoResultado] = useState(false);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [indicesAnimados, setIndicesAnimados] = useState<number[]>([]);
  const [criticoValor, setCriticoValor] = useState(() => {
    const base = habilidadeContext?.criticoValor;
    return Number.isFinite(base) ? Math.trunc(base as number) : 20;
  });
  const [aplicarCritico, setAplicarCritico] = useState(false);
  const [animacaoAtiva, setAnimacaoAtiva] = useState(() => {
    if (typeof window === 'undefined') return true;
    const armazenado = window.localStorage.getItem(STORAGE_ANIMACAO_ROLAGEM_KEY);
    return armazenado !== 'off';
  });

  const criticoMultiplicador = useMemo(() => {
    const base = habilidadeContext?.criticoMultiplicador;
    return Number.isFinite(base) && Number(base) > 1 ? Math.trunc(base as number) : 2;
  }, [habilidadeContext?.criticoMultiplicador]);

  const duracaoAnimacao = useMemo(() => {
    if (!animacaoAtiva) return 0;
    return duracaoMs;
  }, [animacaoAtiva, duracaoMs]);

  const payloadList = useMemo(
    () => (payloads && payloads.length > 0 ? payloads : payload ? [payload] : []),
    [payload, payloads],
  );

  const expressionList = useMemo(() => {
    if (expressions && expressions.length > 0) return expressions;
    if (expression) return [expression];
    return [];
  }, [expression, expressions]);

  const payloadAtual = payloadList[indiceAtual] ?? null;
  const expressionAtual = expressionList[indiceAtual];
  const podeNavegar = payloadList.length > 1;
  const animarEsteIndice = animacaoAtiva && !indicesAnimados.includes(indiceAtual);
  const tituloExibido =
    titulo === 'Rolagem livre' && payloadAtual?.label ? payloadAtual.label : titulo;

  const resultadoCalculado = useMemo(() => {
    if (!payloadAtual) return null;
    return calcularResultadoDice(payloadAtual);
  }, [payloadAtual]);

  const valorDado = useMemo(() => {
    if (!payloadAtual || !resultadoCalculado) return null;
    if (resultadoCalculado.keepMode !== 'SUM') {
      const indice = resultadoCalculado.indiceEscolhido ?? 0;
      return (
        resultadoCalculado.rolagensBase[indice] ??
        payloadAtual.rolagens[0] ??
        null
      );
    }
    return payloadAtual.rolagens[0] ?? null;
  }, [payloadAtual, resultadoCalculado]);

  const facesExibidas = payloadAtual?.faces ?? 20;
  const danoDisponivel = Boolean(habilidadeContext?.dano);
  const podeRolarDano =
    Boolean(onRolarDano) &&
    Boolean(habilidadeContext) &&
    Boolean(alvoNome) &&
    Boolean(alvoTipo) &&
    danoDisponivel;

  const handleRollComplete = useCallback(() => {
    if (!payloadAtual || !animacaoAtiva) return;
    setIndicesAnimados((prev) =>
      prev.includes(indiceAtual) ? prev : [...prev, indiceAtual],
    );
    setMostrandoResultado(true);
  }, [animacaoAtiva, indiceAtual, payloadAtual]);

  useEffect(() => {
    if (!isOpen || payloadList.length === 0) {
      const reset = window.setTimeout(() => {
        setMostrandoResultado(false);
        setIndiceAtual(0);
        setIndicesAnimados([]);
      }, 0);
      return () => window.clearTimeout(reset);
    }

    setMostrandoResultado(false);

    if (!animarEsteIndice) {
      const instant = window.setTimeout(() => {
        setIndicesAnimados((prev) =>
          prev.includes(indiceAtual) ? prev : [...prev, indiceAtual],
        );
        setMostrandoResultado(true);
      }, 0);
      return () => window.clearTimeout(instant);
    }

    const fallback = window.setTimeout(() => {
      setMostrandoResultado((current) => (current ? current : true));
    }, Math.max(duracaoAnimacao + 300, 900));

    return () => window.clearTimeout(fallback);
  }, [animarEsteIndice, duracaoAnimacao, isOpen, payloadList.length]);

  useEffect(() => {
    if (!isOpen) return;
    setIndiceAtual(0);
    setIndicesAnimados([]);
  }, [isOpen, payloadList]);

  useEffect(() => {
    if (!isOpen) return;
    const base = habilidadeContext?.criticoValor;
    const valorInicial = Number.isFinite(base) ? Math.trunc(base as number) : 20;
    setCriticoValor(valorInicial);
    setAplicarCritico(false);
  }, [habilidadeContext?.criticoValor, isOpen]);

  useEffect(() => {
    if (!mostrandoResultado || !habilidadeContext) return;
    if (!valorDado || !Number.isFinite(criticoValor)) {
      setAplicarCritico(false);
      return;
    }
    setAplicarCritico(valorDado >= criticoValor);
  }, [mostrandoResultado, valorDado, criticoValor, habilidadeContext]);

  const handleProximaRolagem = () => {
    if (indiceAtual >= payloadList.length - 1) return;
    setIndiceAtual((prev) => Math.min(prev + 1, payloadList.length - 1));
    setMostrandoResultado(false);
  };

  const handleRolagemAnterior = () => {
    if (indiceAtual <= 0) return;
    setIndiceAtual((prev) => Math.max(prev - 1, 0));
    setMostrandoResultado(false);
  };

  const handleToggleAnimacao = (checked: boolean) => {
    setAnimacaoAtiva(checked);
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      STORAGE_ANIMACAO_ROLAGEM_KEY,
      checked ? 'on' : 'off',
    );
  };

  const handleRolarDano = () => {
    if (!podeRolarDano || !habilidadeContext || !alvoNome || !alvoTipo || !onRolarDano) {
      return;
    }
    onRolarDano({
      alvoNome,
      alvoTipo,
      habilidade: habilidadeContext,
      aplicarCritico: aplicarCritico ? true : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rolagem de pericia"
      size="md"
      footer={null}
    >
      <div className="session-roll-modal">
        <div className="session-roll-modal__head">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="session-roll-modal__title">{tituloExibido}</p>
              {podeNavegar ? (
                <span className="session-roll-modal__badge">
                  Rolagem {indiceAtual + 1}/{payloadList.length}
                </span>
              ) : null}
            </div>
            {subtitulo ? (
              <p className="session-roll-modal__subtitle">{subtitulo}</p>
            ) : null}
            {expressionAtual ? (
              <span className="session-roll-modal__expr">{expressionAtual}</span>
            ) : null}
          </div>
          <div className="session-roll-modal__head-actions">
            <Checkbox
              checked={animacaoAtiva}
              onChange={(event) => handleToggleAnimacao(event.target.checked)}
              label={animacaoAtiva ? 'Modo animado' : 'Modo rapido'}
              className="session-roll-modal__toggle"
            />
            <span className="session-roll-modal__badge">
              <Icon name="dice" className="h-4 w-4" />
              Rolagem
            </span>
          </div>
        </div>

        <div className="session-roll-modal__viewer">
          {podeNavegar ? (
            <div className="flex items-center justify-between gap-3 text-xs text-app-muted">
              <Button
                type="button"
                size="xs"
                variant="secondary"
                onClick={handleRolagemAnterior}
                disabled={indiceAtual === 0}
              >
                <Icon name="chevron-left" className="h-3.5 w-3.5 mr-1" />
                Anterior
              </Button>
              <span>
                Rolagem {indiceAtual + 1} de {payloadList.length}
              </span>
              <Button
                type="button"
                size="xs"
                variant="secondary"
                onClick={handleProximaRolagem}
                disabled={indiceAtual >= payloadList.length - 1}
              >
                Próxima
                <Icon name="chevron-right" className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          ) : null}
          <div className="session-roll-modal__dice-card">
            <DiceScene
              faces={facesExibidas}
              isRolling={Boolean(payloadAtual) && animarEsteIndice && !mostrandoResultado}
              result={mostrandoResultado ? valorDado : null}
              onRollComplete={handleRollComplete}
              reducedMotion={!animacaoAtiva}
              rollDurationMs={duracaoAnimacao}
            />
            {!mostrandoResultado && payloadAtual ? (
              <div className="session-roll-modal__dice-overlay">
                <span className="session-roll-modal__dice-label">{tituloExibido}</span>
                {expressionAtual ? (
                  <span className="session-roll-modal__dice-expr">{expressionAtual}</span>
                ) : null}
                <span className="session-roll-modal__dice-status">
                  {animarEsteIndice
                    ? 'Rolando teste...'
                    : 'Preparando resultado...'}
                </span>
              </div>
            ) : null}
          </div>

          {!payloadAtual ? (
            <div className="session-roll-modal__empty">
              <Icon name="dice" className="h-5 w-5" />
              <div>
                <p className="session-roll-modal__empty-title">
                  Nenhuma rolagem disponivel
                </p>
                <p className="session-roll-modal__empty-subtitle">
                  Faca uma rolagem para ver o resultado aqui.
                </p>
              </div>
            </div>
          ) : mostrandoResultado ? (
            <div className="space-y-3">
              <DiceMessageCard payload={payloadAtual} expression={expressionAtual} />
              {habilidadeContext ? (
                <div className="session-roll-modal__crit">
                  <div className="session-roll-modal__crit-header">
                    <div>
                      <p className="session-roll-modal__crit-title">
                        Critico da habilidade
                      </p>
                      <p className="session-roll-modal__crit-subtitle">
                        Multiplicador x{criticoMultiplicador} (dados apenas)
                      </p>
                    </div>
                    {aplicarCritico ? (
                      <span className="session-roll-modal__crit-badge">
                        Critico ativo
                      </span>
                    ) : null}
                  </div>
                  <div className="session-roll-modal__crit-controls">
                    <label className="session-roll-modal__crit-label">
                      Crita em
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={criticoValor}
                        onChange={(event) => {
                          const valor = Number(event.target.value);
                          if (!Number.isFinite(valor)) {
                            setCriticoValor(20);
                            return;
                          }
                          setCriticoValor(Math.max(1, Math.trunc(valor)));
                        }}
                        className="session-roll-modal__crit-input"
                      />
                    </label>
                    <Checkbox
                      checked={aplicarCritico}
                      onChange={(event) => setAplicarCritico(event.target.checked)}
                      label="Aplicar critico"
                      className="session-roll-modal__crit-toggle"
                    />
                  </div>
                  {podeRolarDano ? (
                    <div className="session-roll-modal__crit-actions">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={handleRolarDano}
                        disabled={enviando}
                      >
                        <Icon name="sparkles" className="h-4 w-4" />
                        Rolar dano/efeito
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="session-roll-modal__status">
          {erro ? (
            <span className="session-roll-modal__status-error">
              <Icon name="close" className="h-3.5 w-3.5" />
              Falha ao enviar resultado
            </span>
          ) : enviado ? (
            <span className="session-roll-modal__status-ok">
              <Icon name="check" className="h-3.5 w-3.5" />
              Resultado enviado ao chat
            </span>
          ) : enviando ? (
            <span className="session-roll-modal__status-warn">
              <Icon name="info" className="h-3.5 w-3.5" />
              Enviando ao chat...
            </span>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
