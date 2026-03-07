// src/components/personagem-base/sections/SecaoInfoBasicas.tsx
'use client';

import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { AttributesDisplay } from '@/components/personagem-base/sections/AttributesDisplay';
import { AtributosDerivadosCard } from '@/components/personagem-base/sections/AtributosDerivadosCard';
import { PassivasAtributosCard } from '@/components/personagem-base/sections/PassivasAtributosCard';
import { SkillsList } from '@/components/personagem-base/sections/SkillsList';
import type { PersonagemBaseDetalhe, PassivaAtributoCatalogo } from '@/lib/api';

type SecaoInfoBasicasProps = {
  personagem: PersonagemBaseDetalhe;
  alinhamento?: { id: number; nome: string; descricao?: string | null };
  tecnicaInata?: { id: number; nome: string; descricao?: string | null };
  classeCatalogo?: { id: number; nome: string; descricao?: string | null };
  passivasSelecionadas: PassivaAtributoCatalogo[];
};

export function SecaoInfoBasicas({
  personagem,
  alinhamento,
  tecnicaInata,
  classeCatalogo,
  passivasSelecionadas,
}: SecaoInfoBasicasProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* COLUNA ESQUERDA (2/3) - Info Básicas + Atributos */}
      <div className="lg:col-span-2 space-y-6">
        {/* Info Gerais */}
        <div className="p-6 rounded-lg border border-app-border bg-app-surface">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="info" className="w-5 h-5 text-app-primary" />
            <span className="font-semibold text-app-fg text-lg">Informações Gerais</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-app-muted block text-xs uppercase tracking-wider mb-1">Nível</span>
              <span className="font-semibold text-app-fg text-lg">{personagem.nivel}</span>
            </div>
            <div>
              <span className="text-app-muted block text-xs uppercase tracking-wider mb-1">Idade</span>
              <span className="font-semibold text-app-fg text-lg">{personagem.idade ?? '—'}</span>
            </div>
            <div>
              <span className="text-app-muted block text-xs uppercase tracking-wider mb-1">Alinhamento</span>
              <span className="font-semibold text-app-fg text-sm">{alinhamento?.nome ?? '—'}</span>
            </div>
            <div>
              <span className="text-app-muted block text-xs uppercase tracking-wider mb-1">Prestígio</span>
              <span className="font-semibold text-app-fg text-lg">{personagem.prestigioBase ?? 0}</span>
            </div>
            <div>
              <span className="text-app-muted block text-xs uppercase tracking-wider mb-1">Prestígio do Clã</span>
              <span className="font-semibold text-app-fg text-lg">
                {personagem.prestigioClaBase != null ? personagem.prestigioClaBase : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-app-muted block text-xs uppercase tracking-wider mb-1">Escola Técnica</span>
              <Badge color={personagem.estudouEscolaTecnica ? 'green' : 'gray'} size="sm" className="mt-1">
                {personagem.estudouEscolaTecnica ? 'Sim' : 'Não'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Clã, Origem, Classe, Técnica */}
        <div className="p-6 rounded-lg border border-app-border bg-app-surface">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="clan" className="w-5 h-5 text-app-primary" />
            <span className="font-semibold text-app-fg text-lg">Clã, Origem & Classe</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-app-muted block text-xs uppercase tracking-wider mb-1">Clã</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-app-fg">{personagem.cla.nome}</span>
                {personagem.cla.grandeCla && <Badge color="yellow" size="sm">Grande Clã</Badge>}
              </div>
            </div>
            <div>
              <span className="text-app-muted block text-xs uppercase tracking-wider mb-1">Origem</span>
              <span className="font-semibold text-app-fg">{personagem.origem.nome}</span>
            </div>
            <div>
              <span className="text-app-muted block text-xs uppercase tracking-wider mb-1">Classe</span>
              <span className="font-semibold text-app-fg">{classeCatalogo?.nome ?? personagem.classe.nome}</span>
            </div>
            <div>
              <span className="text-app-muted block text-xs uppercase tracking-wider mb-1">Técnica Inata</span>
              <span className="font-semibold text-app-fg">{tecnicaInata?.nome ?? '—'}</span>
            </div>
          </div>

          {personagem.trilha && (
            <div className="mt-4 pt-4 border-t border-app-border">
              <span className="text-app-muted block text-xs uppercase tracking-wider mb-2">Especialização</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-app-muted text-sm">Trilha</span>
                  <span className="text-app-fg font-medium">{personagem.trilha.nome}</span>
                </div>
                {personagem.caminho && (
                  <div className="flex items-center justify-between">
                    <span className="text-app-muted text-sm">Caminho</span>
                    <span className="text-app-fg font-medium">{personagem.caminho.nome}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Atributos */}
        <div className="p-6 rounded-lg border border-app-border bg-app-surface">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="strength" className="w-5 h-5 text-app-primary" />
            <span className="font-semibold text-app-fg text-lg">Atributos Base</span>
          </div>
          <AttributesDisplay
            agilidade={personagem.agilidade}
            forca={personagem.forca}
            intelecto={personagem.intelecto}
            presenca={personagem.presenca}
            vigor={personagem.vigor}
            atributoChave={personagem.atributoChaveEa}
          />
        </div>

        {/* ✅ Atributos Derivados (já inclui resistências automaticamente) */}
        <AtributosDerivadosCard derivados={personagem.atributosDerivados ?? null} />

        {/* Passivas */}
        <PassivasAtributosCard
          passivasAtributosAtivos={personagem.passivasAtributosAtivos ?? []}
          passivasSelecionadas={passivasSelecionadas}
        />

        {/* Background */}
        {personagem.background ? (
          <div className="p-6 rounded-lg border border-app-border bg-app-surface">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="story" className="w-5 h-5 text-app-muted" />
              <span className="font-semibold text-app-fg">Background</span>
            </div>
            <p className="text-sm text-app-fg whitespace-pre-wrap leading-relaxed">{personagem.background}</p>
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-app-border rounded-lg bg-app-surface/50">
            <Icon name="story" className="w-12 h-12 mx-auto mb-3 text-app-muted" />
            <p className="text-sm text-app-muted">Nenhum background informado</p>
          </div>
        )}
      </div>

      {/* COLUNA DIREITA (1/3) - Perícias */}
      <div className="lg:col-span-1">
        <div className="p-6 rounded-lg border border-app-border bg-app-surface">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="skills" className="w-5 h-5 text-app-primary" />
            <span className="font-semibold text-app-fg text-lg">Perícias</span>
          </div>
          <SkillsList skills={personagem.pericias ?? []} />
        </div>
      </div>
    </div>
  );
}
