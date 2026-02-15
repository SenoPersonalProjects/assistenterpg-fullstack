// components/personagem-base/create/wizard/PersonagemBaseStepTrilhaCaminho.tsx
'use client';

import type { TrilhaCatalogo, CaminhoCatalogo } from '@/lib/api';
import { SelectModal, type SelectModalOption } from '@/components/ui/SelectModal';
import { Icon } from '@/components/ui/Icon';
import { InfoTile } from '@/components/ui/InfoTile';

type Props = {
  trilhas: TrilhaCatalogo[];
  caminhos: CaminhoCatalogo[];
  trilhaId: string;
  caminhoId: string;
  onChangeTrilhaId: (v: string) => void;
  onChangeCaminhoId: (v: string) => void;
};

export function PersonagemBaseStepTrilhaCaminho({
  trilhas,
  caminhos,
  trilhaId,
  caminhoId,
  onChangeTrilhaId,
  onChangeCaminhoId,
}: Props) {
  const trilhaSelecionada = trilhas.find((t) => String(t.id) === trilhaId);

  // Mapa de bônus por trilha
  const bonusTrilha: Record<string, { bonus: string; icon: string }> = {
    'Especialista em Shikigami': {
      bonus: '+1 grau em Técnica de Shikigami',
      icon: 'sparkles',
    },
    'Mestre em Barreiras': {
      bonus: '+1 grau em Barreira',
      icon: 'shield',
    },
    'Graduado': {
      bonus: 'Vários graus livres de aprimoramento ao longo dos níveis (Saber Ampliado)',
      icon: 'chart',
    },
  };

  const bonusData = trilhaSelecionada ? bonusTrilha[trilhaSelecionada.nome] : null;

  // ✅ Preparar opções para SelectModal - TRILHA
  const trilhasOptions: SelectModalOption<TrilhaCatalogo>[] = trilhas.map((trilha) => {
    const bonus = bonusTrilha[trilha.nome];
    
    return {
      value: trilha.id,
      label: trilha.nome,
      description: trilha.descricao,
      badges: [{ text: 'Nível 2+', color: 'blue' as const }],
      details: bonus ? (
        <div className="text-xs space-y-2">
          <div className="flex items-start gap-2 text-app-success">
            <Icon name={bonus.icon as any} className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="font-medium">{bonus.bonus}</span>
          </div>
        </div>
      ) : undefined,
      data: trilha,
    };
  });

  // ✅ Preparar opções para SelectModal - CAMINHO
  const caminhosOptions: SelectModalOption<CaminhoCatalogo>[] = caminhos.map((caminho) => ({
    value: caminho.id,
    label: caminho.nome,
    description: caminho.descricao,
    badges: [{ text: 'Subtrilha', color: 'purple' as const }],
    data: caminho,
  }));

  const mostrarCaminho = !!trilhaSelecionada && (caminhos?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-app-fg mb-3 flex items-center gap-2">
          <Icon name="tag" className="w-4 h-4 text-app-primary" />
          Trilha e caminho
        </h3>

        <div className="space-y-3">
          <SelectModal
            label="Trilha (Nível 2+)"
            value={trilhaId}
            options={trilhasOptions}
            onChange={(v) => onChangeTrilhaId(String(v))}
            placeholder="Nenhuma trilha"
            helperText="Especialização principal (disponível a partir do nível 2)"
          />

          {trilhaSelecionada && bonusData && (
            <InfoTile
              label="Bônus da trilha"
              value={
                <span className="text-app-success flex items-center gap-1.5">
                  <Icon name="check" className="w-3.5 h-3.5" />
                  {bonusData.bonus}
                </span>
              }
            />
          )}

          {mostrarCaminho && (
            <SelectModal
              label="Caminho (subtrilha especializada)"
              value={caminhoId}
              options={caminhosOptions}
              onChange={(v) => onChangeCaminhoId(String(v))}
              placeholder="Nenhum caminho"
              helperText="Especialização avançada dentro da trilha escolhida"
            />
          )}

          {trilhaSelecionada && !mostrarCaminho && (
            <p className="text-xs text-app-muted">
              Não há caminhos disponíveis para esta trilha.
            </p>
          )}

          {!trilhaSelecionada && (
            <p className="text-xs text-app-muted">
              Selecione uma trilha para ver bônus e caminhos disponíveis.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
