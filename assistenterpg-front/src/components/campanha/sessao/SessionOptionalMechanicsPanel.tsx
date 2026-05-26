'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type {
  AlvoEncontroSocialSessao,
  NpcSessaoCampanha,
  RegraOpcionalSessaoChave,
  RegrasOpcionaisSessao,
  SessaoCampanhaDetalhe,
} from '@/lib/types';

type GastoInspiracao = {
  custo: 1 | 2 | 3;
  efeito: 'BONUS_5' | 'MAXIMIZAR' | 'CRITICO';
  label: string;
};

const GASTOS_INSPIRACAO: GastoInspiracao[] = [
  { custo: 1, efeito: 'BONUS_5', label: '+5' },
  { custo: 2, efeito: 'MAXIMIZAR', label: 'Maximizar' },
  { custo: 3, efeito: 'CRITICO', label: 'Sucesso crítico' },
];

const REGRAS_TOGGLE: Array<[RegraOpcionalSessaoChave, string]> = [
  ['INSPIRACAO', 'Pontos de Inspiração'],
  ['ENCONTROS_SOCIAIS', 'Encontros Sociais Alternativos'],
  ['ESCALADA_DADOS', 'Escalada de Dados'],
  ['INICIATIVA_ALTERNADA', 'Iniciativa Alternada'],
  ['CONSUMIR_COM_CALMA', 'Consumir com Calma'],
];

type SessionOptionalMechanicsPanelProps = {
  regras?: RegrasOpcionaisSessao;
  podeControlarSessao: boolean;
  sessaoEncerrada: boolean;
  cenaTipo: string;
  rodadaAtual: number | null;
  cards: SessaoCampanhaDetalhe['cards'];
  npcs: NpcSessaoCampanha[];
  meuPersonagemCampanhaId?: number | null;
  atualizandoChave?: string | null;
  onAtualizarRegra: (
    chave: RegraOpcionalSessaoChave,
    ativo: boolean,
  ) => Promise<void>;
  onAjustarInspiracao: (
    personagemCampanhaId: number,
    delta: number,
  ) => Promise<void>;
  onGastarInspiracao: (
    personagemCampanhaId: number,
    gasto: GastoInspiracao,
  ) => Promise<void>;
  onAtualizarSocial: (alvos: AlvoEncontroSocialSessao[]) => Promise<void>;
  onAtualizarEscalada: (
    ativaNesteCombate: boolean,
    rodadaInicio?: number,
  ) => Promise<void>;
};

function clampBarra(valor: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.trunc(valor)));
}

export function SessionOptionalMechanicsPanel({
  regras,
  podeControlarSessao,
  sessaoEncerrada,
  cenaTipo,
  rodadaAtual,
  cards,
  npcs,
  meuPersonagemCampanhaId,
  atualizandoChave,
  onAtualizarRegra,
  onAjustarInspiracao,
  onGastarInspiracao,
  onAtualizarSocial,
  onAtualizarEscalada,
}: SessionOptionalMechanicsPanelProps) {
  const regraInspiracao = regras?.INSPIRACAO;
  const regraSocial = regras?.ENCONTROS_SOCIAIS;
  const regraEscalada = regras?.ESCALADA_DADOS;
  const regraIniciativaAlternada = regras?.INICIATIVA_ALTERNADA;
  const regraConsumirComCalma = regras?.CONSUMIR_COM_CALMA;
  const [alvosSociais, setAlvosSociais] = useState<AlvoEncontroSocialSessao[]>(
    () => regraSocial?.estado.alvos ?? [],
  );
  const [npcSelecionadoId, setNpcSelecionadoId] = useState('');
  const [nomeAlvoCustom, setNomeAlvoCustom] = useState('');
  const pontosInspiracao = regraInspiracao?.estado.pontosPorPersonagem ?? {};
  const escaladaAtivaNoCombate =
    regraEscalada?.ativo === true &&
    regraEscalada.estado.ativaNesteCombate === true &&
    cenaTipo === 'COMBATE';
  const bonusEscalada = escaladaAtivaNoCombate
    ? regraEscalada.estado.bonusAtual
    : 0;

  const meuCard = useMemo(
    () =>
      typeof meuPersonagemCampanhaId === 'number'
        ? cards.find((card) => card.personagemCampanhaId === meuPersonagemCampanhaId)
        : null,
    [cards, meuPersonagemCampanhaId],
  );
  const meusPontos =
    meuCard ? pontosInspiracao[String(meuCard.personagemCampanhaId)] ?? 0 : 0;

  const atualizarAlvo = (
    index: number,
    patch: Partial<AlvoEncontroSocialSessao>,
  ) => {
    setAlvosSociais((atuais) =>
      atuais.map((alvo, alvoIndex) =>
        alvoIndex === index ? { ...alvo, ...patch } : alvo,
      ),
    );
  };

  const adicionarAlvoSocial = () => {
    const npc = npcs.find((item) => String(item.npcSessaoId) === npcSelecionadoId);
    const nome = npc?.nome ?? nomeAlvoCustom.trim();
    if (!nome) return;
    setAlvosSociais((atuais) => [
      ...atuais,
      {
        id: `${npc?.npcSessaoId ?? 'custom'}:${Date.now()}`,
        npcSessaoId: npc?.npcSessaoId ?? null,
        nome,
        interesseAtual: 0,
        interesseAlvo: 5,
        pacienciaAtual: 3,
        motivacoes: [],
      },
    ]);
    setNpcSelecionadoId('');
    setNomeAlvoCustom('');
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-app-border/50 bg-app-surface/60 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-app-primary">
              Mecânicas opcionais
            </h4>
            <p className="mt-1 text-xs font-medium leading-relaxed text-app-muted">
              Ative regras por sessão. Jogadores veem apenas o estado que afeta a mesa.
            </p>
          </div>
          {bonusEscalada > 0 ? (
            <span className="rounded-full bg-app-danger/15 px-3 py-1 text-xs font-black text-app-danger">
              Escalada +{bonusEscalada}
            </span>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3">
          {REGRAS_TOGGLE.map(([chave, label]) => {
            const regra = regras?.[chave];
            return (
              <label
                key={chave}
                className="flex items-center justify-between gap-3 rounded-xl border border-app-border/40 bg-app-card/70 p-3"
              >
                <span className="text-sm font-bold text-app-fg">{label}</span>
                <Checkbox
                  checked={regra?.ativo === true}
                  onChange={(event) =>
                    void onAtualizarRegra(chave, event.target.checked)
                  }
                  disabled={
                    !podeControlarSessao ||
                    sessaoEncerrada ||
                    atualizandoChave === chave
                  }
                />
              </label>
            );
          })}
        </div>

        {regraIniciativaAlternada?.ativo ? (
          <p className="mt-3 rounded-xl border border-app-primary/30 bg-app-primary/10 p-3 text-xs font-medium text-app-primary">
            A iniciativa alternada usa lados da cena no painel de turnos.
          </p>
        ) : null}
        {regraConsumirComCalma?.ativo ? (
          <p className="mt-3 rounded-xl border border-app-info/30 bg-app-info/10 p-3 text-xs font-medium text-app-info">
            Consumíveis automatizados ficam disponíveis no inventário dos personagens.
          </p>
        ) : null}
      </div>

      {regraInspiracao?.ativo ? (
        <div className="rounded-2xl border border-app-border/50 bg-app-surface/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h5 className="text-sm font-black text-app-fg">Inspiração</h5>
              <p className="text-xs text-app-muted">Limite de 3 pontos por personagem.</p>
            </div>
            {meuCard ? (
              <span className="rounded-full bg-app-primary/15 px-3 py-1 text-xs font-black text-app-primary">
                Seus pontos: {meusPontos}/3
              </span>
            ) : null}
          </div>

          {meuCard ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {GASTOS_INSPIRACAO.map((gasto) => (
                <Button
                  key={gasto.efeito}
                  size="xs"
                  variant="secondary"
                  disabled={sessaoEncerrada || meusPontos < gasto.custo}
                  onClick={() => void onGastarInspiracao(meuCard.personagemCampanhaId, gasto)}
                >
                  {gasto.label} ({gasto.custo})
                </Button>
              ))}
            </div>
          ) : null}

          {podeControlarSessao ? (
            <div className="mt-4 space-y-2">
              {cards.map((card) => {
                const pontos =
                  pontosInspiracao[String(card.personagemCampanhaId)] ?? 0;
                return (
                  <div
                    key={card.personagemCampanhaId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-app-border/40 bg-app-card/70 p-3"
                  >
                    <div>
                      <p className="text-sm font-bold text-app-fg">
                        {card.nomePersonagem}
                      </p>
                      <p className="text-xs text-app-muted">{card.nomeJogador}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="xs"
                        variant="ghost"
                        disabled={sessaoEncerrada || pontos <= 0}
                        onClick={() => void onAjustarInspiracao(card.personagemCampanhaId, -1)}
                      >
                        -1
                      </Button>
                      <span className="w-12 rounded-lg bg-app-primary/10 px-2 py-1 text-center text-xs font-black text-app-primary">
                        {pontos}/3
                      </span>
                      <Button
                        size="xs"
                        variant="ghost"
                        disabled={sessaoEncerrada || pontos >= 3}
                        onClick={() => void onAjustarInspiracao(card.personagemCampanhaId, 1)}
                      >
                        +1
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        disabled={sessaoEncerrada || pontos <= 0}
                        onClick={() =>
                          void onAjustarInspiracao(card.personagemCampanhaId, -pontos)
                        }
                      >
                        Zerar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : null}

      {regraEscalada?.ativo ? (
        <div className="rounded-2xl border border-app-border/50 bg-app-surface/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h5 className="text-sm font-black text-app-fg">Escalada de Dados</h5>
              <p className="text-xs text-app-muted">
                Ataques recebem +1 por rodada a partir da segunda rodada, até +6.
              </p>
            </div>
            <span className="rounded-full bg-app-danger/15 px-3 py-1 text-xs font-black text-app-danger">
              Bônus atual +{bonusEscalada}
            </span>
          </div>
          {podeControlarSessao ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                size="xs"
                variant={escaladaAtivaNoCombate ? 'secondary' : 'primary'}
                disabled={sessaoEncerrada || cenaTipo !== 'COMBATE'}
                onClick={() =>
                  void onAtualizarEscalada(!escaladaAtivaNoCombate, rodadaAtual ?? 1)
                }
              >
                {escaladaAtivaNoCombate ? 'Desativar neste combate' : 'Ativar neste combate'}
              </Button>
              {cenaTipo !== 'COMBATE' ? (
                <span className="text-xs font-medium text-app-muted">
                  Disponível em cenas de combate.
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {regraSocial?.ativo ? (
        <div className="rounded-2xl border border-app-border/50 bg-app-surface/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h5 className="text-sm font-black text-app-fg">Encontro social</h5>
              <p className="text-xs text-app-muted">
                Interesse chega ao alvo para sucesso. Paciência 0 encerra a abordagem.
              </p>
            </div>
            {cenaTipo === 'SOCIAL' ? (
              <span className="rounded-full bg-app-info/15 px-3 py-1 text-xs font-black text-app-info">
                Cena social
              </span>
            ) : null}
          </div>

          {podeControlarSessao ? (
            <div className="mt-4 grid gap-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Select
                  label="NPC da cena"
                  value={npcSelecionadoId}
                  onChange={(event) => setNpcSelecionadoId(event.target.value)}
                  options={[
                    { value: '', label: 'Escolher NPC' },
                    ...npcs.map((npc) => ({
                      value: String(npc.npcSessaoId),
                      label: npc.nome,
                    })),
                  ]}
                />
                <Input
                  label="Ou alvo manual"
                  value={nomeAlvoCustom}
                  onChange={(event) => setNomeAlvoCustom(event.target.value)}
                  placeholder="Ex.: Conselheiro"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="self-end"
                  onClick={adicionarAlvoSocial}
                  disabled={sessaoEncerrada}
                >
                  <Icon name="add" className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>

              {alvosSociais.map((alvo, index) => (
                <div
                  key={alvo.id ?? `${alvo.nome}-${index}`}
                  className="rounded-xl border border-app-border/40 bg-app-card/70 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-black text-app-fg">{alvo.nome}</p>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() =>
                        setAlvosSociais((atuais) =>
                          atuais.filter((_, alvoIndex) => alvoIndex !== index),
                        )
                      }
                      disabled={sessaoEncerrada}
                    >
                      Remover
                    </Button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <Input
                      label="Interesse"
                      type="number"
                      min={0}
                      max={4}
                      value={alvo.interesseAtual}
                      onChange={(event) =>
                        atualizarAlvo(index, {
                          interesseAtual: clampBarra(Number(event.target.value), 0, 4),
                        })
                      }
                    />
                    <Input
                      label="Alvo"
                      type="number"
                      min={1}
                      max={5}
                      value={alvo.interesseAlvo}
                      onChange={(event) =>
                        atualizarAlvo(index, {
                          interesseAlvo: clampBarra(Number(event.target.value), 1, 5),
                        })
                      }
                    />
                    <Input
                      label="Paciência"
                      type="number"
                      min={0}
                      max={5}
                      value={alvo.pacienciaAtual}
                      onChange={(event) =>
                        atualizarAlvo(index, {
                          pacienciaAtual: clampBarra(Number(event.target.value), 0, 5),
                        })
                      }
                    />
                  </div>
                </div>
              ))}

              <Button
                size="sm"
                variant="primary"
                onClick={() => void onAtualizarSocial(alvosSociais)}
                disabled={sessaoEncerrada}
              >
                Salvar encontro social
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {alvosSociais.length === 0 ? (
                <p className="text-xs font-medium text-app-muted">
                  O mestre ainda não configurou os alvos sociais.
                </p>
              ) : null}
              {alvosSociais.map((alvo, index) => (
                <div
                  key={alvo.id ?? `${alvo.nome}-${index}`}
                  className="rounded-xl border border-app-border/40 bg-app-card/70 p-3"
                >
                  <p className="text-sm font-black text-app-fg">{alvo.nome}</p>
                  <div className="mt-2 grid gap-2 text-xs font-bold text-app-muted sm:grid-cols-2">
                    <span>Interesse {alvo.interesseAtual}/{alvo.interesseAlvo}</span>
                    <span>Paciência {alvo.pacienciaAtual}/5</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
