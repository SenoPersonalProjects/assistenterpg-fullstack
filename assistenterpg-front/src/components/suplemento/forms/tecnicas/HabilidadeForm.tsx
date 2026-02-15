// src/components/suplemento/forms/tecnicas/HabilidadeForm.tsx

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import {
  TipoExecucao,
  AreaEfeito,
  TipoDano,
  TIPO_EXECUCAO_LABELS,
  AREA_EFEITO_LABELS,
  TIPO_DANO_LABELS,
} from '@/lib/types/homebrew-enums';
import type { HabilidadeTecnica, DadoDanoTecnica, EscalonamentoDano } from '@/lib/api/homebrews';
import { VariacoesList } from './VariacoesList';

type Props = {
  habilidade: HabilidadeTecnica;
  index: number;
  totalHabilidades: number;
  onChange: (habilidade: Partial<HabilidadeTecnica>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
};

export function HabilidadeForm({
  habilidade,
  index,
  totalHabilidades,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const dadosDano: DadoDanoTecnica[] = habilidade.dadosDano ?? [];

  function addDadoDano() {
    const novoDado: DadoDanoTecnica = {
      quantidade: 1,
      dado: 'd6',
      tipo: TipoDano.ENERGIA_AMALDICOADA,
    };
    onChange({ dadosDano: [...dadosDano, novoDado] });
  }

  function updateDadoDano(dadoIndex: number, campo: keyof DadoDanoTecnica, valor: any) {
    const novosDados = [...dadosDano];
    novosDados[dadoIndex] = { ...novosDados[dadoIndex], [campo]: valor };
    onChange({ dadosDano: novosDados });
  }

  function removeDadoDano(dadoIndex: number) {
    onChange({ dadosDano: dadosDano.filter((_, i) => i !== dadoIndex) });
  }

  const nomeExibido = habilidade.nome || `Habilidade #${index + 1}`;

  return (
    <div className="border border-app-border rounded-lg bg-app-card overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-app-muted-surface border-b border-app-border flex items-center justify-between">
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
              <span className="text-sm font-semibold text-app-fg">{nomeExibido}</span>
              {habilidade.codigo && (
                <Badge color="blue" size="sm">
                  {habilidade.codigo}
                </Badge>
              )}
            </div>
            {habilidade.custoPE > 0 || habilidade.custoEA > 0 ? (
              <p className="text-xs text-app-muted">
                Custo: {habilidade.custoPE} PE / {habilidade.custoEA} EA
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
            disabled={index === totalHabilidades - 1}
            title="Mover para baixo"
          >
            <Icon name="chevron-down" className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onRemove}
            title="Remover habilidade"
          >
            <Icon name="delete" className="w-4 h-4 text-app-danger" />
          </Button>
        </div>
      </div>

      {/* Body (collapsible) */}
      {!collapsed && (
        <div className="p-4 space-y-4">
          {/* Identificação */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Código *"
              value={habilidade.codigo}
              onChange={(e) => onChange({ codigo: e.target.value })}
              placeholder="Ex: MANIPULACAO_SANGUE_CONVERGENCIA"
              required
            />

            <Input
              label="Nome *"
              value={habilidade.nome}
              onChange={(e) => onChange({ nome: e.target.value })}
              placeholder="Ex: Convergência"
              required
            />
          </div>

          <Textarea
            label="Descrição *"
            value={habilidade.descricao}
            onChange={(e) => onChange({ descricao: e.target.value })}
            placeholder="Descreva o funcionamento da habilidade..."
            rows={3}
            maxLength={2000}
            required
          />

          {/* Execução */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Select
              label="Execução *"
              value={habilidade.execucao}
              onChange={(e) => onChange({ execucao: e.target.value as TipoExecucao })}
              required
            >
              {(Object.entries(TIPO_EXECUCAO_LABELS) as [TipoExecucao, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>

            <Select
              label="Área de efeito"
              value={habilidade.area ?? ''}
              onChange={(e) => onChange({ area: e.target.value as AreaEfeito })}
            >
              <option value="">Nenhuma</option>
              {(Object.entries(AREA_EFEITO_LABELS) as [AreaEfeito, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          {/* Alcance, Alvo, Duração */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input
              label="Alcance"
              value={habilidade.alcance ?? ''}
              onChange={(e) => onChange({ alcance: e.target.value })}
              placeholder="Ex: CURTO, 12m"
            />

            <Input
              label="Alvo"
              value={habilidade.alvo ?? ''}
              onChange={(e) => onChange({ alvo: e.target.value })}
              placeholder="Ex: 1 criatura, Você"
            />

            <Input
              label="Duração"
              value={habilidade.duracao ?? ''}
              onChange={(e) => onChange({ duracao: e.target.value })}
              placeholder="Ex: Instantâneo, 3 turnos"
            />
          </div>

          {/* Resistência */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Resistência"
              value={habilidade.resistencia ?? ''}
              onChange={(e) => onChange({ resistencia: e.target.value })}
              placeholder="Ex: Fortitude, Reflexos"
            />

            <Input
              label="DT de resistência"
              value={habilidade.dtResistencia ?? ''}
              onChange={(e) => onChange({ dtResistencia: e.target.value })}
              placeholder="Ex: 10 + Limite PE/EA + INT"
            />
          </div>

          {/* Custos */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Custo PE *"
              type="number"
              min={0}
              value={habilidade.custoPE}
              onChange={(e) => onChange({ custoPE: Number(e.target.value) })}
              placeholder="0"
              required
            />

            <Input
              label="Custo EA *"
              type="number"
              min={0}
              value={habilidade.custoEA}
              onChange={(e) => onChange({ custoEA: Number(e.target.value) })}
              placeholder="0"
              required
            />
          </div>

          {/* Crítico */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Crítico (valor)"
              type="number"
              min={1}
              max={20}
              value={habilidade.criticoValor ?? ''}
              onChange={(e) => onChange({ criticoValor: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="19"
            />

            <Input
              label="Crítico (multiplicador)"
              type="number"
              min={2}
              max={5}
              value={habilidade.criticoMultiplicador ?? ''}
              onChange={(e) => onChange({ criticoMultiplicador: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="2"
            />
          </div>

          {/* Dano Flat */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Input
              label="Dano flat"
              type="number"
              min={0}
              value={habilidade.danoFlat ?? ''}
              onChange={(e) => onChange({ danoFlat: e.target.value ? Number(e.target.value) : undefined })}
              placeholder="0"
            />

            <Select
              label="Tipo de dano flat"
              value={habilidade.danoFlatTipo ?? ''}
              onChange={(e) => onChange({ danoFlatTipo: e.target.value as TipoDano })}
            >
              <option value="">Nenhum</option>
              {(Object.entries(TIPO_DANO_LABELS) as [TipoDano, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          {/* Dados de dano */}
          <div className="space-y-3 pt-3 border-t border-app-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-app-fg">Dados de dano</label>
              <Button type="button" size="sm" variant="secondary" onClick={addDadoDano}>
                <Icon name="add" className="w-4 h-4 mr-1" />
                Adicionar dado
              </Button>
            </div>

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

          {/* Escalonamento */}
          <div className="space-y-3 pt-3 border-t border-app-border">
            <Checkbox
              label="Escalona por grau"
              checked={habilidade.escalonaPorGrau ?? false}
              onChange={(e) => onChange({ escalonaPorGrau: e.target.checked })}
            />

            {habilidade.escalonaPorGrau && (
              <>
                <Input
                  label="Tipo de grau (código)"
                  value={habilidade.grauTipoGrauCodigo ?? ''}
                  onChange={(e) => onChange({ grauTipoGrauCodigo: e.target.value })}
                  placeholder="Ex: TECNICA_AMALDICOADA"
                />

                <Input
                  label="Escalonamento custo EA"
                  type="number"
                  min={0}
                  value={habilidade.escalonamentoCustoEA ?? ''}
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
                      value={habilidade.escalonamentoDano?.quantidade ?? ''}
                      onChange={(e) =>
                        onChange({
                          escalonamentoDano: {
                            ...(habilidade.escalonamentoDano || {}),
                            quantidade: Number(e.target.value),
                          } as EscalonamentoDano,
                        })
                      }
                      placeholder="1"
                    />

                    <Input
                      label="Dado"
                      value={habilidade.escalonamentoDano?.dado ?? ''}
                      onChange={(e) =>
                        onChange({
                          escalonamentoDano: {
                            ...(habilidade.escalonamentoDano || {}),
                            dado: e.target.value,
                          } as EscalonamentoDano,
                        })
                      }
                      placeholder="d6"
                    />

                    <Select
                      label="Tipo"
                      value={habilidade.escalonamentoDano?.tipo ?? ''}
                      onChange={(e) =>
                        onChange({
                          escalonamentoDano: {
                            ...(habilidade.escalonamentoDano || {}),
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

          {/* Efeito */}
          <Textarea
            label="Efeito *"
            value={habilidade.efeito}
            onChange={(e) => onChange({ efeito: e.target.value })}
            placeholder="Descreva o efeito mecânico da habilidade..."
            rows={4}
            maxLength={2000}
            required
          />

          {/* Variações (Liberações) */}
          <div className="pt-3 border-t border-app-border">
            <VariacoesList
              variacoes={habilidade.variacoes ?? []}
              onChange={(variacoes) => onChange({ variacoes })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
