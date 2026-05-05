// src/components/suplemento/forms/equipamentos/ArmaFields.tsx
'use client';

import { useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import {
  ProficienciaArma,
  EmpunhaduraArma,
  TipoArma,
  SubtipoArmaDistancia,
  AlcanceArma,
  TipoDano,
  PROFICIENCIA_ARMA_LABELS,
  EMPUNHADURA_LABELS,
  TIPO_ARMA_LABELS,
  SUBTIPO_ARMA_DISTANCIA_LABELS,
  ALCANCE_ARMA_LABELS,
  TIPO_DANO_LABELS,
} from '@/lib/types/homebrew-enums';
import type { DadosDanoArma } from '@/lib/api/homebrews';
import type { HomebrewFormDados } from '../../hooks/useHomebrewForm';

type Props = {
  dados: HomebrewFormDados;
  onChange: (dados: Partial<HomebrewFormDados>) => void;
};

export function ArmaFields({ dados, onChange }: Props) {
  const danos: DadosDanoArma[] = dados.danos ?? [];
  const empunhaduras: EmpunhaduraArma[] = dados.empunhaduras ?? [];

  useEffect(() => {
    const defaults: Partial<HomebrewFormDados> = {};

    if (dados.agil == null) {
      defaults.agil = false;
    }
    if (dados.criticoValor == null) {
      defaults.criticoValor = 20;
    }
    if (dados.criticoMultiplicador == null) {
      defaults.criticoMultiplicador = 2;
    }
    if (!Array.isArray(dados.danos)) {
      defaults.danos = [];
    }
    if (!Array.isArray(dados.empunhaduras)) {
      defaults.empunhaduras = [];
    }

    if (Object.keys(defaults).length > 0) {
      onChange(defaults);
    }
  }, [
    dados.agil,
    dados.criticoMultiplicador,
    dados.criticoValor,
    dados.danos,
    dados.empunhaduras,
    onChange,
  ]);

  function addDano() {
    const novoDano: DadosDanoArma = {
      tipoDano: TipoDano.CORTANTE,
      rolagem: '1d6',
      valorFlat: 0,
    };
    onChange({ danos: [...danos, novoDano] });
  }

  function updateDano(index: number, campo: keyof DadosDanoArma, valor: unknown) {
    const novosDanos = [...danos];
    novosDanos[index] = { ...novosDanos[index], [campo]: valor };
    onChange({ danos: novosDanos });
  }

  function removeDano(index: number) {
    onChange({ danos: danos.filter((_, i) => i !== index) });
  }

  function toggleEmpunhadura(emp: EmpunhaduraArma) {
    if (empunhaduras.includes(emp)) {
      onChange({ empunhaduras: empunhaduras.filter((e) => e !== emp) });
    } else {
      onChange({ empunhaduras: [...empunhaduras, emp] });
    }
  }

  return (
    <div className="space-y-4">
      {/* Proficiência e Tipo */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Select
          label="Proficiência *"
          value={dados.proficienciaArma ?? ''}
          onChange={(e) => onChange({ proficienciaArma: e.target.value as ProficienciaArma })}
          required
        >
          <option value="">Selecione...</option>
          {Object.entries(PROFICIENCIA_ARMA_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <Select
          label="Tipo de arma *"
          value={dados.tipoArma ?? ''}
          onChange={(e) => onChange({ tipoArma: e.target.value as TipoArma })}
          required
        >
          <option value="">Selecione...</option>
          {Object.entries(TIPO_ARMA_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>

      {/* ✅ CORRIGIDO: TipoArma.A_DISTANCIA */}
      {dados.tipoArma === TipoArma.A_DISTANCIA && (
        <Select
          label="Subtipo (arma à distância)"
          value={dados.subtipoDistancia ?? ''}
          onChange={(e) => onChange({ subtipoDistancia: e.target.value as SubtipoArmaDistancia })}
        >
          <option value="">Selecione...</option>
          {Object.entries(SUBTIPO_ARMA_DISTANCIA_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      )}

      {/* Empunhaduras */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-app-fg">Empunhaduras *</label>
        <div className="flex flex-wrap gap-3">
          {Object.entries(EMPUNHADURA_LABELS).map(([value, label]) => (
            <Checkbox
              key={value}
              label={label}
              checked={empunhaduras.includes(value as EmpunhaduraArma)}
              onChange={() => toggleEmpunhadura(value as EmpunhaduraArma)}
            />
          ))}
        </div>
      </div>

      {/* Ágil */}
      <Checkbox
        label="Arma ágil (usa AGI para ataques)"
        checked={dados.agil ?? false}
        onChange={(e) => onChange({ agil: e.target.checked })}
      />

      {/* Alcance */}
      <Select
        label="Alcance *"
        value={dados.alcance ?? ''}
        onChange={(e) => onChange({ alcance: e.target.value as AlcanceArma })}
        required
      >
        <option value="">Selecione...</option>
        {Object.entries(ALCANCE_ARMA_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      {/* Crítico */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Input
          label="Crítico (valor) *"
          type="number"
          min={1}
          max={20}
          value={dados.criticoValor ?? 20}
          onChange={(e) => onChange({ criticoValor: Number(e.target.value) })}
          placeholder="20"
          required
        />

        <Input
          label="Crítico (multiplicador) *"
          type="number"
          min={2}
          max={5}
          value={dados.criticoMultiplicador ?? 2}
          onChange={(e) => onChange({ criticoMultiplicador: Number(e.target.value) })}
          placeholder="2"
          required
        />
      </div>

      {/* Danos */}
      <div className="space-y-3 pt-3 border-t border-app-border">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-app-fg">Danos *</label>
          <Button type="button" size="sm" variant="secondary" onClick={addDano}>
            <Icon name="add" className="w-4 h-4 mr-1" />
            Adicionar dano
          </Button>
        </div>

        {danos.length === 0 && (
          <p className="text-xs text-app-muted italic">Nenhum dano configurado</p>
        )}

        {danos.map((dano, idx) => (
          <div key={idx} className="p-3 border border-app-border rounded-lg bg-app-muted-surface space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-app-fg">Dano #{idx + 1}</span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => removeDano(idx)}
              >
                <Icon name="delete" className="w-4 h-4" />
              </Button>
            </div>

            {empunhaduras.length > 1 && (
              <Select
                label="Empunhadura (opcional)"
                value={dano.empunhadura ?? ''}
                onChange={(e) => updateDano(idx, 'empunhadura', e.target.value as EmpunhaduraArma)}
              >
                <option value="">Todas</option>
                {empunhaduras.map((emp) => (
                  <option key={emp} value={emp}>
                    {EMPUNHADURA_LABELS[emp]}
                  </option>
                ))}
              </Select>
            )}

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <Input
                label="Rolagem *"
                value={dano.rolagem}
                onChange={(e) => updateDano(idx, 'rolagem', e.target.value)}
                placeholder="1d6"
                required
              />

              <Select
                label="Tipo *"
                value={dano.tipoDano}
                onChange={(e) => updateDano(idx, 'tipoDano', e.target.value as TipoDano)}
                required
              >
                {Object.entries(TIPO_DANO_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>

              <Input
                label="Dano flat"
                type="number"
                min={0}
                value={dano.valorFlat ?? 0}
                onChange={(e) => updateDano(idx, 'valorFlat', Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>
        ))}
      </div>

      {/* ✅ CORRIGIDO: TipoArma.A_DISTANCIA */}
      {dados.tipoArma === TipoArma.A_DISTANCIA && (
        <Input
          label="Código do tipo de munição"
          value={dados.tipoMunicaoCodigo ?? ''}
          onChange={(e) => onChange({ tipoMunicaoCodigo: e.target.value })}
          placeholder="Ex: BALAS_CURTAS, FLECHAS"
        />
      )}

      {/* Habilidade especial */}
      <Textarea
        label="Habilidade especial"
        value={dados.habilidadeEspecial ?? ''}
        onChange={(e) => onChange({ habilidadeEspecial: e.target.value })}
        placeholder="Ex: Pode ser arremessada, ignora redução de dano..."
        rows={2}
        maxLength={500}
      />
    </div>
  );
}
