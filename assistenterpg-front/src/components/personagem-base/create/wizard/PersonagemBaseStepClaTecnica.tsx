// components/personagem-base/create/wizard/PersonagemBaseStepClaTecnica.tsx (REFATORADO)
'use client';

import type { ClaCatalogo, TecnicaInataCatalogo } from '@/lib/api';
import { SelectModal, type SelectModalOption } from '@/components/ui/SelectModal';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { InfoTile } from '@/components/ui/InfoTile';
import { Alert } from '@/components/ui/Alert';
import { getNivelPrestigioCla } from '@/lib/utils/prestigio';

type Props = {
  clas: ClaCatalogo[];
  tecnicasInatas: TecnicaInataCatalogo[];
  claId: string;
  tecnicaInataId: string;
  prestigioClaBase: string;
  origemRequerTecnicaHeriditaria: boolean;
  origemBloqueiaTecnicaHeriditaria: boolean;
  onChangeClaId: (v: string) => void;
  onChangeTecnicaInataId: (v: string) => void;
  onChangePrestigioClaBase: (v: string) => void;
};

function formatarCustoEAePE(custoEA: number, custoPE: number): string {
  if (custoEA <= 0 && custoPE <= 0) return 'Sem custo';
  if (custoEA > 0 && custoPE > 0) return `${custoEA} EA / ${custoPE} PE`;
  if (custoEA > 0) return `${custoEA} EA`;
  return `${custoPE} PE`;
}

export function PersonagemBaseStepClaTecnica({
  clas,
  tecnicasInatas,
  claId,
  tecnicaInataId,
  prestigioClaBase,
  origemRequerTecnicaHeriditaria,
  origemBloqueiaTecnicaHeriditaria,
  onChangeClaId,
  onChangeTecnicaInataId,
  onChangePrestigioClaBase,
}: Props) {
  const claSelecionado = clas.find((c) => String(c.id) === claId);
  const claIdNumber = claId ? Number(claId) : null;

  // Opções de clãs para o SelectModal
  const clasOptions: SelectModalOption<ClaCatalogo>[] = clas.map((cla) => ({
    value: cla.id,
    label: cla.nome,
    description: cla.descricao,
    badges: cla.grandeCla ? [{ text: 'Grande Clã', color: 'yellow' as const }] : [],
    data: cla,
  }));

  // Filtrar técnicas disponíveis
  const tecnicasDisponiveis = tecnicasInatas.filter((t) => {
    if (origemBloqueiaTecnicaHeriditaria && t.hereditaria) return false;

    if (origemRequerTecnicaHeriditaria) {
      if (!claIdNumber) return false;
      return t.hereditaria && t.clasHereditarios.some((rel) => rel.claId === claIdNumber);
    }

    if (!t.hereditaria) return true;

    if (!claIdNumber) return false;
    return t.clasHereditarios.some((rel) => rel.claId === claIdNumber);
  });
  const tecnicaSelecionada = tecnicasDisponiveis.find(
    (t) => String(t.id) === tecnicaInataId,
  );
  const habilidadesTecnicaSelecionada = tecnicaSelecionada?.habilidades ?? [];

  // Opções de técnicas para o SelectModal
  const tecnicasOptions: SelectModalOption<TecnicaInataCatalogo>[] = tecnicasDisponiveis.map((tec) => {
    const clasHereditarios = tec.clasHereditarios.map((rel) => rel.claNome).join(', ');
    
    return {
      value: tec.id,
      label: tec.nome,
      description: tec.descricao,
      badges: tec.hereditaria ? [{ text: 'Hereditária', color: 'purple' as const }] : [],
      details: tec.hereditaria && clasHereditarios ? (
        <div className="text-xs space-y-1">
          <p className="text-app-muted">
            <span className="font-medium text-app-fg">Clãs hereditários:</span>{' '}
            {clasHereditarios}
          </p>
        </div>
      ) : undefined,
      data: tec,
    };
  });

  const prestigioClaNum = prestigioClaBase === '' ? 0 : Number(prestigioClaBase);
  const nivelPrestigioCla = getNivelPrestigioCla(prestigioClaNum);

  return (
    <div className="space-y-6">
      {/* Clã */}
      <div>
        <h3 className="text-sm font-semibold text-app-fg mb-3 flex items-center gap-2">
          <Icon name="tag" className="w-4 h-4 text-app-primary" />
          Clã
        </h3>

        <div className="space-y-3">
          <SelectModal
            label="Selecionar clã *"
            value={claId}
            options={clasOptions}
            onChange={(v) => onChangeClaId(String(v))}
            placeholder="Selecione um clã..."
            helperText="Define prestígio hereditário e acesso a técnicas específicas"
          />

          {claSelecionado && claSelecionado.grandeCla && (
            <div className="space-y-3">
              <Input
                label="Prestígio de clã base"
                type="number"
                min={0}
                value={prestigioClaBase}
                onChange={(e) => onChangePrestigioClaBase(e.target.value)}
                placeholder="0"
                helperText="Define status e influência dentro do grande clã"
              />

              {prestigioClaNum > 0 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoTile
                    label="Nível de prestígio"
                    value={
                      <span className="text-app-success font-semibold">
                        {nivelPrestigioCla.nome}
                      </span>
                    }
                  />
                  <InfoTile label="Descrição" value={nivelPrestigioCla.descricao} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Técnica inata */}
      <div>
        <h3 className="text-sm font-semibold text-app-fg mb-3 flex items-center gap-2">
          <Icon name="sparkles" className="w-4 h-4 text-app-primary" />
          Técnica inata
        </h3>

        <div className="space-y-3">
          {origemRequerTecnicaHeriditaria && (
            <Alert variant="warning">
              <div className="flex items-start gap-2">
                <Icon name="warning" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold">Origem exige técnica hereditária</p>
                  <p className="text-app-muted mt-1">
                    Selecione uma técnica hereditária vinculada ao seu clã.
                  </p>
                </div>
              </div>
            </Alert>
          )}

          {origemBloqueiaTecnicaHeriditaria && (
            <Alert variant="warning">
              <div className="flex items-start gap-2">
                <Icon name="warning" className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold">Origem bloqueia técnica hereditária</p>
                  <p className="text-app-muted mt-1">
                    Técnicas hereditárias não podem ser selecionadas para esta origem.
                  </p>
                </div>
              </div>
            </Alert>
          )}

          <SelectModal
            label="Selecionar técnica"
            value={tecnicaInataId}
            options={tecnicasOptions}
            onChange={(v) => onChangeTecnicaInataId(String(v))}
            placeholder="Nenhuma técnica"
            helperText={
              claId
                ? 'Técnica inata do personagem (opcional)'
                : 'Selecione um clã primeiro para ver técnicas hereditárias'
            }
            disabled={!claId}
            emptyText={
              claId
                ? 'Nenhuma técnica disponível para as regras da sua origem/clã'
                : 'Selecione um clã primeiro'
            }
          />

          {tecnicaSelecionada ? (
            <div className="rounded border border-app-border bg-app-surface p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-app-fg">
                  Pacote da tecnica selecionada
                </p>
                <span className="text-[11px] text-app-muted">
                  {habilidadesTecnicaSelecionada.length}{' '}
                  {habilidadesTecnicaSelecionada.length === 1
                    ? 'habilidade'
                    : 'habilidades'}
                </span>
              </div>

              {habilidadesTecnicaSelecionada.length === 0 ? (
                <p className="text-[11px] text-app-muted">
                  Esta tecnica ainda nao possui habilidades cadastradas.
                </p>
              ) : (
                <div className="space-y-2">
                  {habilidadesTecnicaSelecionada.slice(0, 4).map((habilidade) => (
                    <div
                      key={habilidade.id}
                      className="rounded border border-app-border bg-app-bg px-2 py-1.5"
                    >
                      <p className="text-xs font-medium text-app-fg">
                        {habilidade.nome}
                      </p>
                      <p className="text-[11px] text-app-muted">
                        {habilidade.execucao}
                        {habilidade.alcance ? ` | Alcance: ${habilidade.alcance}` : ''}
                        {habilidade.duracao ? ` | Duracao: ${habilidade.duracao}` : ''}
                      </p>
                      <p className="text-[11px] text-app-muted">
                        Custo: {formatarCustoEAePE(habilidade.custoEA, habilidade.custoPE)}
                      </p>
                    </div>
                  ))}

                  {habilidadesTecnicaSelecionada.length > 4 ? (
                    <p className="text-[11px] text-app-muted">
                      +{habilidadesTecnicaSelecionada.length - 4} habilidade(s) adicional(is)
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
