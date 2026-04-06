'use client';

import { useEffect, useMemo, useState } from 'react';
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

const ANIMACAO_PADRAO_MS = 900;

type SessionPericiaRollModalProps = {
  isOpen: boolean;
  onClose: () => void;
  titulo: string;
  subtitulo?: string;
  alvoNome?: string;
  alvoTipo?: 'PERSONAGEM' | 'NPC';
  habilidadeContext?: HabilidadeRollContext | null;
  payload: DiceRollPayload | null;
  expression?: string;
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
  expression,
  enviando = false,
  enviado = false,
  erro = null,
  duracaoMs = ANIMACAO_PADRAO_MS,
  onRolarDano,
}: SessionPericiaRollModalProps) {
  const [mostrandoResultado, setMostrandoResultado] = useState(false);
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

  const resultadoCalculado = useMemo(() => {
    if (!payload) return null;
    return calcularResultadoDice(payload);
  }, [payload]);

  const valorDado = useMemo(() => {
    if (!payload || !resultadoCalculado) return null;
    if (resultadoCalculado.keepMode !== 'SUM') {
      const indice = resultadoCalculado.indiceEscolhido ?? 0;
      return (
        resultadoCalculado.rolagensBase[indice] ??
        payload.rolagens[0] ??
        null
      );
    }
    return payload.rolagens[0] ?? null;
  }, [payload, resultadoCalculado]);

  const facesExibidas = payload?.faces ?? 20;
  const danoDisponivel = Boolean(habilidadeContext?.dano);
  const podeRolarDano =
    Boolean(onRolarDano) &&
    Boolean(habilidadeContext) &&
    Boolean(alvoNome) &&
    Boolean(alvoTipo) &&
    danoDisponivel;

  useEffect(() => {
    if (!isOpen || !payload) {
      const reset = window.setTimeout(() => setMostrandoResultado(false), 0);
      return () => window.clearTimeout(reset);
    }
    const reset = window.setTimeout(() => setMostrandoResultado(false), 0);
    const timer = window.setTimeout(
      () => setMostrandoResultado(true),
      duracaoAnimacao,
    );
    return () => {
      window.clearTimeout(reset);
      window.clearTimeout(timer);
    };
  }, [isOpen, payload, duracaoAnimacao]);

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
            <p className="session-roll-modal__title">{titulo}</p>
            {subtitulo ? (
              <p className="session-roll-modal__subtitle">{subtitulo}</p>
            ) : null}
            {expression ? (
              <span className="session-roll-modal__expr">{expression}</span>
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
          <div className="session-roll-modal__dice-card">
            <DiceScene
              faces={facesExibidas}
              isRolling={Boolean(payload) && animacaoAtiva && !mostrandoResultado}
              result={mostrandoResultado ? valorDado : null}
              reducedMotion={!animacaoAtiva}
            />
            {!mostrandoResultado && payload ? (
              <div className="session-roll-modal__dice-overlay">
                <span className="session-roll-modal__dice-label">{titulo}</span>
                {expression ? (
                  <span className="session-roll-modal__dice-expr">{expression}</span>
                ) : null}
                <span className="session-roll-modal__dice-status">
                  {animacaoAtiva ? 'Rolando teste...' : 'Preparando resultado...'}
                </span>
              </div>
            ) : null}
          </div>

          {!payload ? (
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
              <DiceMessageCard payload={payload} expression={expression} />
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
