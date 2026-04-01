// src/components/personagem-base/sections/AtributosDerivadosCard.tsx
'use client';

import React from 'react';
import { SectionCard } from '@/components/ui/SectionCard';
import { Icon, type IconName } from '@/components/ui/Icon';
import { EmptyState } from '@/components/ui/EmptyState';

// ✅ CORRIGIDO: Tipo alinhado com o backend
type ResistenciaSimplificada = {
  codigo: string;
  nome: string;
  descricao: string | null;
  valor: number;
};

type AtributosDerivados = {
  pvMaximo: number;
  pvBarrasTotal?: number;
  peMaximo: number;
  eaMaximo: number;
  sanMaximo: number;
  defesaBase: number;
  defesaEquipamento: number;
  defesaTotal: number;
  defesa: number;
  deslocamento: number;
  limitePeEaPorTurno: number;
  reacoesBasePorTurno: number;
  turnosMorrendo: number;
  turnosEnlouquecendo: number;
  bloqueio: number;
  esquiva: number;
  resistencias?: ResistenciaSimplificada[];
};

type Props = {
  derivados?: AtributosDerivados | null;
};

type TileProps = {
  icon: IconName;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  footer?: string;
};

function Tile({ icon, label, value, valueClassName, footer }: TileProps) {
  return (
    <div className="rounded border border-app-border bg-app-surface p-3">
      <div className="mb-1 flex items-center gap-2">
        <Icon name={icon} className="h-4 w-4 text-app-muted" />
        <p className="text-xs font-medium text-app-muted">{label}</p>
      </div>

      <p className={['text-2xl font-bold', valueClassName ?? 'text-app-fg'].join(' ')}>{value}</p>

      {footer ? <p className="mt-1 text-[10px] text-app-muted">{footer}</p> : null}
    </div>
  );
}

export function AtributosDerivadosCard({ derivados }: Props) {
  if (!derivados) {
    return (
      <SectionCard title="Atributos derivados" right={<Icon name="info" className="h-5 w-5 text-app-muted" />}>
        <EmptyState title="Sem atributos derivados" description="Nada para exibir para este personagem." />
      </SectionCard>
    );
  }

  const defesaFinal = derivados.defesaTotal ?? derivados.defesa;
  const defesaBase = derivados.defesaBase ?? derivados.defesa;
  const defesaEquip = derivados.defesaEquipamento ?? 0;
  const pvBarrasTotal = derivados.pvBarrasTotal ?? 1;
  const pvBarraBase = Math.floor(derivados.pvMaximo / pvBarrasTotal);
  const pvBarraUltima =
    derivados.pvMaximo - pvBarraBase * (pvBarrasTotal - 1);
  const pvFooter =
    pvBarrasTotal > 1
      ? `Barras: ${pvBarrasTotal} • PV por nucleo: ${pvBarraBase}${
          pvBarraUltima !== pvBarraBase ? ` (ultima ${pvBarraUltima})` : ''
        }`
      : undefined;

  return (
    <SectionCard title="Atributos derivados" right={<Icon name="chart" className="h-5 w-5 text-app-muted" />}>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Tile
          icon="heart"
          label="PV Máximo"
          value={derivados.pvMaximo}
          valueClassName="text-app-danger"
          footer={pvFooter}
        />
        <Tile icon="bolt" label="PE Máximo" value={derivados.peMaximo} valueClassName="text-app-info" />
        <Tile icon="sparkles" label="EA Máximo" value={derivados.eaMaximo} valueClassName="text-app-secondary" />
        <Tile icon="skills" label="SAN Máximo" value={derivados.sanMaximo} valueClassName="text-app-success" />
        
        <Tile 
          icon="shield" 
          label="Defesa Total" 
          value={defesaFinal} 
          valueClassName="text-app-warning" 
          footer={defesaEquip > 0 ? `Base: ${defesaBase} + Equip: ${defesaEquip}` : undefined}
        />
        
        <Tile icon="training" label="Deslocamento" value={`${derivados.deslocamento}m`} valueClassName="text-app-info" />

        <Tile 
          icon="shield" 
          label="Bloqueio" 
          value={derivados.bloqueio} 
          valueClassName="text-app-warning" 
          footer="Bônus de Fortitude"
        />
        <Tile 
          icon="bolt" 
          label="Esquiva" 
          value={derivados.esquiva} 
          valueClassName="text-app-info" 
          footer="Defesa + Reflexos"
        />

        <Tile
          icon="tag"
          label="Limite PE/EA"
          value={derivados.limitePeEaPorTurno}
          valueClassName="text-app-primary"
          footer="por turno"
        />

        <Tile
          icon="check"
          label="Reações"
          value={derivados.reacoesBasePorTurno}
          valueClassName="text-app-success"
          footer="por turno"
        />

        <Tile icon="info" label="Morrendo" value={derivados.turnosMorrendo} valueClassName="text-app-danger" footer="turnos" />

        <Tile
          icon="info"
          label="Enlouquecendo"
          value={derivados.turnosEnlouquecendo}
          valueClassName="text-app-warning"
          footer="turnos"
        />
      </div>

      {/* ✅ CORRIGIDO: Resistências sem campo "origem" */}
      {derivados.resistencias && derivados.resistencias.length > 0 && (
        <div className="mt-6 border-t border-app-border pt-4">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="shield" className="h-5 w-5 text-app-primary" />
            <h3 className="text-sm font-semibold text-app-fg">Resistências</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {derivados.resistencias.map((res) => (
              <div
                key={res.codigo}
                className="flex items-center justify-between rounded border border-app-border bg-app-surface p-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-app-fg">{res.nome}</p>
                  {res.descricao && (
                    <p className="mt-1 text-xs text-app-muted line-clamp-2" title={res.descricao}>
                      {res.descricao}
                    </p>
                  )}
                </div>
                <div className="ml-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-app-primary/10">
                  <span className="text-lg font-bold text-app-primary">{res.valor}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded border border-app-info/30 bg-app-info/5 p-3">
            <p className="text-xs text-app-info">
              <Icon name="info" className="mr-1 inline h-3 w-3" />
              <strong>Resistências</strong> reduzem o dano recebido de tipos específicos. Equipar ou desequipar
              itens atualiza esses valores automaticamente.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-app-border pt-3">
        <p className="text-[10px] italic text-app-muted">
          Valores calculados automaticamente com base em classe, atributos, nível, passivas e equipamentos.
        </p>
      </div>
    </SectionCard>
  );
}
