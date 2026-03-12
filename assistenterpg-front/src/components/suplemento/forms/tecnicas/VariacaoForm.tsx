// src/components/suplemento/forms/tecnicas/VariacaoForm.tsx

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import {
  TipoExecucao,
  AreaEfeito,
  TipoDano,
  TIPO_EXECUCAO_LABELS,
  AREA_EFEITO_LABELS,
  TIPO_DANO_LABELS,
} from '@/lib/types/homebrew-enums';
import type { VariacaoHabilidade, DadoDanoTecnica, EscalonamentoDano } from '@/lib/api/homebrews';
import {
  ALCANCE_PRESET_OPTIONS,
  DURACAO_PRESET_OPTIONS,
  parseAlcancePreset,
  parseDuracaoPreset,
  serializeAlcancePreset,
  serializeDuracaoPreset,
  type AlcancePresetValue,
  type DuracaoPresetValue,
} from './alcance-duracao-presets';

type Props = {
  variacao: VariacaoHabilidade;
  index: number;
  totalVariacoes: number;
  onChange: (variacao: Partial<VariacaoHabilidade>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

export function VariacaoForm({
  variacao,
  index,
  totalVariacoes,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [alcanceCustomMode, setAlcanceCustomMode] = useState(false);
  const [duracaoCustomMode, setDuracaoCustomMode] = useState(false);
  const dadosDano: DadoDanoTecnica[] = variacao.dadosDano ?? [];
  const alcanceParsed = parseAlcancePreset(variacao.alcance);
  const duracaoParsed = parseDuracaoPreset(variacao.duracao);
  const alcanceSelectValue: AlcancePresetValue | 'MANTER_ORIGINAL' = alcanceCustomMode
    ? 'PERSONALIZADO'
    : variacao.alcance === undefined
      ? 'MANTER_ORIGINAL'
      : alcanceParsed.preset;
  const duracaoSelectValue: DuracaoPresetValue | 'MANTER_ORIGINAL' = duracaoCustomMode
    ? 'PERSONALIZADA'
    : variacao.duracao === undefined
      ? 'MANTER_ORIGINAL'
      : duracaoParsed.preset;
  const alcanceCustomValue =
    alcanceParsed.preset === 'PERSONALIZADO'
      ? alcanceParsed.custom
      : alcanceCustomMode
        ? (variacao.alcance ?? '')
        : '';
  const duracaoCustomValue =
    duracaoParsed.preset === 'PERSONALIZADA'
      ? duracaoParsed.custom
      : duracaoCustomMode
        ? (variacao.duracao ?? '')
        : '';

  function addDadoDano() {
    const novoDado: DadoDanoTecnica = {
      quantidade: 1,
      dado: 'd6',
      tipo: TipoDano.ENERGIA_AMALDICOADA,
    };
    onChange({ dadosDano: [...dadosDano, novoDado] });
  }

  function updateDadoDano(dadoIndex: number, campo: keyof DadoDanoTecnica, valor: unknown) {
    const novosDados = [...dadosDano];
    novosDados[dadoIndex] = { ...novosDados[dadoIndex], [campo]: valor };
    onChange({ dadosDano: novosDados });
  }

  function removeDadoDano(dadoIndex: number) {
    onChange({ dadosDano: dadosDano.filter((_, i) => i !== dadoIndex) });
  }

  function handleAlcancePresetChange(
    nextValue: AlcancePresetValue | 'MANTER_ORIGINAL',
  ) {
    if (nextValue === 'MANTER_ORIGINAL') {
      setAlcanceCustomMode(false);
      onChange({ alcance: undefined });
      return;
    }

    if (nextValue === 'PERSONALIZADO') {
      setAlcanceCustomMode(true);
      if (alcanceParsed.preset !== 'PERSONALIZADO') {
        onChange({ alcance: '' });
      }
      return;
    }

    setAlcanceCustomMode(false);
    onChange({ alcance: serializeAlcancePreset(nextValue) });
  }

  function handleDuracaoPresetChange(
    nextValue: DuracaoPresetValue | 'MANTER_ORIGINAL',
  ) {
    if (nextValue === 'MANTER_ORIGINAL') {
      setDuracaoCustomMode(false);
      onChange({ duracao: undefined });
      return;
    }

    if (nextValue === 'PERSONALIZADA') {
      setDuracaoCustomMode(true);
      if (duracaoParsed.preset !== 'PERSONALIZADA') {
        onChange({ duracao: '' });
      }
      return;
    }

    setDuracaoCustomMode(false);
    onChange({ duracao: serializeDuracaoPreset(nextValue) });
  }

  const nomeExibido = variacao.nome || `Variação #${index + 1}`;

  return (
    <div className="border border-app-secondary/30 rounded-lg bg-app-card overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-app-secondary/10 border-b border-app-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Icon
              name={collapsed ? 'chevron-down' : 'chevron-up'}
              className="w-4 h-4"
            />
          </Button>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Icon name="sparkles" className="w-4 h-4 text-app-secondary" />
              <span className="text-sm font-semibold text-app-fg">{nomeExibido}</span>
            </div>
            {variacao.custoPE || variacao.custoEA ? (
              <p className="text-xs text-app-muted">
                {variacao.substituiCustos ? 'Substitui' : 'Adiciona'}: {variacao.custoPE || 0} PE / {variacao.custoEA || 0} EA
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onMoveUp}
            disabled={index === 0}
            title="Mover para cima"
          >
            <Icon name="chevron-up" className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onMoveDown}
            disabled={index === totalVariacoes - 1}
            title="Mover para baixo"
          >
            <Icon name="chevron-down" className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onRemove}
            title="Remover variação"
          >
            <Icon name="delete" className="w-4 h-4 text-app-danger" />
          </Button>
        </div>
      </div>

      {/* Body (collapsible) */}
      {!collapsed && (
        <div className="p-4 space-y-4">
          {/* Identificação */}
          <Input
            label="Nome *"
            value={variacao.nome}
            onChange={(e) => onChange({ nome: e.target.value })}
            placeholder="Ex: Liberação Superior, Liberação Máxima"
            required
          />

          <Textarea
            label="Descrição *"
            value={variacao.descricao}
            onChange={(e) => onChange({ descricao: e.target.value })}
            placeholder="Descreva as mudanças em relação à versão base..."
            rows={3}
            maxLength={1000}
            required
          />

          {/* Custos */}
          <div className="space-y-3 pt-3 border-t border-app-border">
            <Checkbox
              label="Substitui custos (se desmarcado, adiciona aos custos base)"
              checked={variacao.substituiCustos ?? false}
              onChange={(e) => onChange({ substituiCustos: e.target.checked })}
            />

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                label="Custo PE"
                type="number"
                min={0}
                value={variacao.custoPE ?? ''}
                onChange={(e) => onChange({ custoPE: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0"
              />

              <Input
                label="Custo EA"
                type="number"
                min={0}
                value={variacao.custoEA ?? ''}
                onChange={(e) => onChange({ custoEA: e.target.value ? Number(e.target.value) : undefined })}
                placeholder="0"
              />
            </div>
          </div>

          {/* Execução (sobrescreve se definido) */}
          <div className="space-y-3 pt-3 border-t border-app-border">
            <p className="text-xs font-medium text-app-fg">Sobrescrever execução (opcional)</p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Select
                label="Execução"
                value={variacao.execucao ?? ''}
                onChange={(e) => onChange({ execucao: e.target.value as TipoExecucao })}
              >
                <option value="">Manter original</option>
                {(Object.entries(TIPO_EXECUCAO_LABELS) as [TipoExecucao, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>

              <Select
                label="Área de efeito"
                value={variacao.area ?? ''}
                onChange={(e) => onChange({ area: e.target.value as AreaEfeito })}
              >
                <option value="">Manter original</option>
                {(Object.entries(AREA_EFEITO_LABELS) as [AreaEfeito, string][]).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Select
                label="Alcance"
                value={alcanceSelectValue}
                onChange={(e) =>
                  handleAlcancePresetChange(
                    e.target.value as AlcancePresetValue | 'MANTER_ORIGINAL',
                  )
                }
              >
                <option value="MANTER_ORIGINAL">Manter original</option>
                {ALCANCE_PRESET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Input
                label="Alvo"
                value={variacao.alvo ?? ''}
                onChange={(e) => onChange({ alvo: e.target.value })}
                placeholder="Manter original"
              />

              <Select
                label="Duração"
                value={duracaoSelectValue}
                onChange={(e) =>
                  handleDuracaoPresetChange(
                    e.target.value as DuracaoPresetValue | 'MANTER_ORIGINAL',
                  )
                }
              >
                <option value="MANTER_ORIGINAL">Manter original</option>
                {DURACAO_PRESET_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {(alcanceSelectValue === 'PERSONALIZADO' ||
              duracaoSelectValue === 'PERSONALIZADA') && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {alcanceSelectValue === 'PERSONALIZADO' ? (
                  <Input
                    label="Alcance personalizado"
                    value={alcanceCustomValue}
                    onChange={(e) => {
                      setAlcanceCustomMode(true);
                      onChange({ alcance: e.target.value });
                    }}
                    placeholder="Ex: 12m, 30m, linha de visão"
                  />
                ) : (
                  <div />
                )}

                {duracaoSelectValue === 'PERSONALIZADA' ? (
                  <Input
                    label="Duração personalizada"
                    value={duracaoCustomValue}
                    onChange={(e) => {
                      setDuracaoCustomMode(true);
                      onChange({ duracao: e.target.value });
                    }}
                    placeholder="Ex: 3 turnos, 1 hora, até fim da cena"
                  />
                ) : null}
              </div>
            )}
          </div>

          {/* Resistência (sobrescreve se definido) */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Resistência"
              value={variacao.resistencia ?? ''}
              onChange={(e) => onChange({ resistencia: e.target.value })}
              placeholder="Manter original"
            />

            <Input
              label="DT de resistência"
              value={variacao.dtResistencia ?? ''}
              onChange={(e) => onChange({ dtResistencia: e.target.value })}
              placeholder="Manter original"
            />
          </div>

          {/* Crítico (sobrescreve se definido) */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Crítico (valor)"
              type="number"
              min={1}
              max={20}
              value={variacao.criticoValor ?? ''}
              onChange={(e) => onChange({ criticoValor: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Manter original"
            />

            <Input
              label="Crítico (multiplicador)"
              type="number"
              min={2}
              max={5}
              value={variacao.criticoMultiplicador ?? ''}
              onChange={(e) => onChange({ criticoMultiplicador: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Manter original"
            />
          </div>

          {/* Dano Flat (sobrescreve se definido) */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Dano flat"
              type="number"
              min={0}
              value={variacao.danoFlat ?? ''}
              onChange={(e) => onChange({ danoFlat: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="Manter original"
            />

            <Select
              label="Tipo de dano flat"
              value={variacao.danoFlatTipo ?? ''}
              onChange={(e) => onChange({ danoFlatTipo: e.target.value as TipoDano })}
            >
              <option value="">Manter original</option>
              {(Object.entries(TIPO_DANO_LABELS) as [TipoDano, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          {/* Dados de dano (sobrescreve COMPLETAMENTE se definido) */}
          <div className="space-y-3 pt-3 border-t border-app-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-app-fg">
                Dados de dano (sobrescreve original)
              </label>
              <Button type="button" size="sm" variant="secondary" onClick={addDadoDano}>
                <Icon name="add" className="w-4 h-4 mr-1" />
                Adicionar dado
              </Button>
            </div>

            {dadosDano.length === 0 && (
              <p className="text-xs text-app-muted italic">Mantém danos originais</p>
            )}

            {dadosDano.map((dado, dadoIdx) => (
              <div key={dadoIdx} className="p-3 border border-app-border rounded-lg bg-app-muted-surface">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-app-fg">Dado #{dadoIdx + 1}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => removeDadoDano(dadoIdx)}
                  >
                    <Icon name="delete" className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <Input
                    label="Quantidade *"
                    type="number"
                    min={1}
                    value={dado.quantidade}
                    onChange={(e) => updateDadoDano(dadoIdx, 'quantidade', Number(e.target.value))}
                    placeholder="1"
                    required
                  />

                  <Input
                    label="Dado *"
                    value={dado.dado}
                    onChange={(e) => updateDadoDano(dadoIdx, 'dado', e.target.value)}
                    placeholder="d6"
                    required
                  />

                  <Select
                    label="Tipo *"
                    value={dado.tipo}
                    onChange={(e) => updateDadoDano(dadoIdx, 'tipo', e.target.value as TipoDano)}
                    required
                  >
                    {(Object.entries(TIPO_DANO_LABELS) as [TipoDano, string][]).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            ))}
          </div>

          {/* Escalonamento (sobrescreve se definido) */}
          <div className="space-y-3 pt-3 border-t border-app-border">
            <Checkbox
              label="Escalona por grau (sobrescreve original)"
              checked={variacao.escalonaPorGrau ?? false}
              onChange={(e) => onChange({ escalonaPorGrau: e.target.checked })}
            />

            {variacao.escalonaPorGrau && (
              <>
                <Input
                  label="Escalonamento custo EA"
                  type="number"
                  min={0}
                  value={variacao.escalonamentoCustoEA ?? ''}
                  onChange={(e) => onChange({ escalonamentoCustoEA: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Ex: 2"
                />

                <div className="p-3 border border-app-border rounded-lg bg-app-muted-surface space-y-2">
                  <label className="text-xs font-medium text-app-fg">Escalonamento de dano</label>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <Input
                      label="Quantidade"
                      type="number"
                      min={0}
                      value={variacao.escalonamentoDano?.quantidade ?? ''}
                      onChange={(e) =>
                        onChange({
                          escalonamentoDano: {
                            ...(variacao.escalonamentoDano || {}),
                            quantidade: Number(e.target.value),
                          } as EscalonamentoDano,
                        })
                      }
                      placeholder="1"
                    />

                    <Input
                      label="Dado"
                      value={variacao.escalonamentoDano?.dado ?? ''}
                      onChange={(e) =>
                        onChange({
                          escalonamentoDano: {
                            ...(variacao.escalonamentoDano || {}),
                            dado: e.target.value,
                          } as EscalonamentoDano,
                        })
                      }
                      placeholder="d6"
                    />

                    <Select
                      label="Tipo"
                      value={variacao.escalonamentoDano?.tipo ?? ''}
                      onChange={(e) =>
                        onChange({
                          escalonamentoDano: {
                            ...(variacao.escalonamentoDano || {}),
                            tipo: e.target.value as TipoDano,
                          } as EscalonamentoDano,
                        })
                      }
                    >
                      <option value="">Selecione...</option>
                      {(Object.entries(TIPO_DANO_LABELS) as [TipoDano, string][]).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Efeito adicional */}
          <Textarea
            label="Efeito adicional"
            value={variacao.efeitoAdicional ?? ''}
            onChange={(e) => onChange({ efeitoAdicional: e.target.value })}
            placeholder="Efeitos que se adicionam ao original..."
            rows={3}
            maxLength={1000}
          />

          {/* Requisitos específicos */}
          <Textarea
            label="Requisitos específicos (JSON)"
            value={typeof variacao.requisitos === 'string' ? variacao.requisitos : JSON.stringify(variacao.requisitos || {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange({ requisitos: parsed });
              } catch {
                onChange({ requisitos: e.target.value });
              }
            }}
            placeholder='Ex: { "nivel": 10 }'
            rows={2}
          />
        </div>
      )}
    </div>
  );
}
