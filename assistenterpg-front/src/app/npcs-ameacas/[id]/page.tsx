'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGetNpcAmeaca } from '@/lib/api/npcs-ameacas';
import type { NpcAmeacaDetalhe } from '@/lib/types';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import { NpcAmeacaPageHeader } from '@/components/npc-ameaca/NpcAmeacaPageHeader';
import {
  corBadgeFichaTipo,
  labelFichaTipo,
  labelTamanhoNpc,
  labelTipoNpc,
} from '@/components/npc-ameaca/npcAmeacaUi';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';
import { SectionCard } from '@/components/ui/SectionCard';

function formatarTestePericia(dados: number, bonus: number): string {
  return `${dados}d20 ${bonus >= 0 ? `+${bonus}` : bonus}`;
}

export default function NpcAmeacaDetalhePage() {
  const params = useParams<{ id?: string | string[] }>();
  const router = useRouter();
  const idParam = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = Number(idParam);
  const idValido = Number.isFinite(id);

  const [item, setItem] = useState<NpcAmeacaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!idValido) {
      setErro('ID inválido.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        setErro(null);
        const dados = await apiGetNpcAmeaca(id);
        setItem(dados);
      } catch (error) {
        setErro(extrairMensagemErro(error));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, idValido]);

  const valoresAtributos = useMemo(
    () =>
      item
        ? [
            ['AGI', item.agilidade],
            ['FOR', item.forca],
            ['INT', item.intelecto],
            ['PRE', item.presenca],
            ['VIG', item.vigor],
          ]
        : [],
    [item],
  );

  if (loading) {
    return (
      <div className="npc-page-shell min-h-screen p-6">
        <Loading message="Carregando ficha..." className="text-app-fg" />
      </div>
    );
  }

  if (erro || !item) {
    return (
      <div className="npc-page-shell min-h-screen p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <ErrorAlert message={erro ?? 'Ficha não encontrada.'} />
          <Button variant="secondary" onClick={() => router.push('/npcs-ameacas')}>
            <Icon name="back" className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="npc-page-shell min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <NpcAmeacaPageHeader
          title={item.nome}
          description={`${labelTipoNpc(item.tipo)} • Tamanho ${labelTamanhoNpc(item.tamanho)}`}
          badge={<Badge color={corBadgeFichaTipo(item.fichaTipo)}>{labelFichaTipo(item.fichaTipo)}</Badge>}
          actions={
            <>
              <Button
                variant="secondary"
                onClick={() => router.push(`/npcs-ameacas/${item.id}/editar`)}
              >
                <Icon name="edit" className="mr-2 h-4 w-4" />
                Editar
              </Button>
              <Button variant="ghost" onClick={() => router.push('/npcs-ameacas')}>
                <Icon name="back" className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </>
          }
        />

        {item.descricao && (
          <SectionCard title="Descrição" className="npc-panel">
            <p className="text-sm leading-relaxed text-app-fg">{item.descricao}</p>
          </SectionCard>
        )}

        <SectionCard title="Resumo rápido" className="npc-panel" contentClassName="space-y-3">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="npc-stat-tile p-3">
              <p className="text-xs text-app-muted">VD</p>
              <p className="text-xl font-semibold text-app-fg">{item.vd}</p>
            </div>
            <div className="npc-stat-tile p-3">
              <p className="text-xs text-app-muted">Defesa</p>
              <p className="text-xl font-semibold text-app-fg">{item.defesa}</p>
            </div>
            <div className="npc-stat-tile p-3">
              <p className="text-xs text-app-muted">PV</p>
              <p className="text-xl font-semibold text-app-fg">{item.pontosVida}</p>
            </div>
            <div className="npc-stat-tile p-3">
              <p className="text-xs text-app-muted">Deslocamento</p>
              <p className="text-xl font-semibold text-app-fg">{item.deslocamentoMetros}m</p>
            </div>
          </div>
          {item.machucado !== null ? (
            <p className="text-sm text-app-muted">Machucado: {item.machucado}</p>
          ) : null}
        </SectionCard>

        <SectionCard
          title="Atributos e perícias"
          className="npc-panel"
          contentClassName="space-y-3"
        >
          <div className="grid gap-3 sm:grid-cols-5">
            {valoresAtributos.map(([label, valor]) => (
              <div key={label} className="npc-stat-tile p-3">
                <p className="text-xs text-app-muted">{label}</p>
                <p className="text-lg font-semibold text-app-fg">{valor}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-2 text-sm text-app-fg sm:grid-cols-2 lg:grid-cols-4">
            <p>Percepção: {formatarTestePericia(item.percepcaoDados, item.percepcao)}</p>
            <p>Iniciativa: {formatarTestePericia(item.iniciativaDados, item.iniciativa)}</p>
            <p>Fortitude: {formatarTestePericia(item.fortitudeDados, item.fortitude)}</p>
            <p>Reflexos: {formatarTestePericia(item.reflexosDados, item.reflexos)}</p>
            <p>Vontade: {formatarTestePericia(item.vontadeDados, item.vontade)}</p>
            <p>Luta: {formatarTestePericia(item.lutaDados, item.luta)}</p>
            <p>Jujutsu: {formatarTestePericia(item.jujutsuDados, item.jujutsu)}</p>
          </div>

          {item.periciasEspeciais.length > 0 ? (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-app-fg">Perícias especiais</h3>
              <ul className="space-y-1 text-sm text-app-fg">
                {item.periciasEspeciais.map((pericia, index) => (
                  <li key={`pericia-${index}`} className="rounded border border-app-border px-3 py-2">
                    <span className="font-medium">
                      {String(pericia.nome)} ({String(pericia.codigo)})
                    </span>
                    {typeof pericia.dados === 'number' &&
                      typeof pericia.bonus === 'number' &&
                      ` | ${formatarTestePericia(pericia.dados, pericia.bonus)}`}
                    {typeof pericia.dados === 'number' &&
                      typeof pericia.bonus !== 'number' &&
                      ` | ${pericia.dados}d20`}
                    {pericia.descricao ? ` | ${String(pericia.descricao)}` : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </SectionCard>

        <SectionCard
          title="Resistências e vulnerabilidades"
          className="npc-panel"
          contentClassName="grid gap-3 sm:grid-cols-2"
        >
          <div>
            <p className="mb-2 text-sm font-medium text-app-fg">Resistências</p>
            {item.resistencias.length === 0 ? (
              <p className="text-sm text-app-muted">Nenhuma resistência cadastrada.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {item.resistencias.map((resistencia) => (
                  <Badge key={resistencia} color="blue" size="sm">
                    {resistencia}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-app-fg">Vulnerabilidades</p>
            {item.vulnerabilidades.length === 0 ? (
              <p className="text-sm text-app-muted">Nenhuma vulnerabilidade cadastrada.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {item.vulnerabilidades.map((vulnerabilidade) => (
                  <Badge key={vulnerabilidade} color="red" size="sm">
                    {vulnerabilidade}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Passivas" className="npc-panel">
          {item.passivas.length === 0 ? (
            <p className="text-sm text-app-muted">Sem passivas cadastradas.</p>
          ) : (
            <div className="space-y-2">
              {item.passivas.map((passiva, index) => (
                <div key={`passiva-${index}`} className="rounded border border-app-border p-3">
                  <p className="text-sm font-semibold text-app-fg">{String(passiva.nome)}</p>
                  {[passiva.gatilho, passiva.alcance, passiva.alvo, passiva.duracao]
                    .filter(Boolean)
                    .length > 0 ? (
                    <p className="mt-1 text-xs text-app-muted">
                      {[passiva.gatilho, passiva.alcance, passiva.alvo, passiva.duracao]
                        .filter(Boolean)
                        .join(' | ')}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm text-app-muted">{String(passiva.descricao)}</p>
                  {passiva.requisitos ? (
                    <p className="mt-1 text-xs text-app-muted">
                      Requisitos: {String(passiva.requisitos)}
                    </p>
                  ) : null}
                  {passiva.efeitoGuia ? (
                    <p className="mt-1 text-xs text-app-muted">
                      Efeito guia: {String(passiva.efeitoGuia)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Ações" className="npc-panel">
          {item.acoes.length === 0 ? (
            <p className="text-sm text-app-muted">Sem ações cadastradas.</p>
          ) : (
            <div className="space-y-2">
              {item.acoes.map((acao, index) => (
                <div key={`acao-${index}`} className="space-y-1 rounded border border-app-border p-3">
                  <p className="text-sm font-semibold text-app-fg">{String(acao.nome)}</p>
                  <p className="text-xs text-app-muted">
                    {[
                      acao.tipoExecucao,
                      acao.alcance,
                      acao.alvo,
                      acao.duracao,
                      acao.resistencia,
                      acao.dtResistencia ? `DT ${acao.dtResistencia}` : null,
                      typeof acao.custoPE === 'number' ? `PE ${acao.custoPE}` : null,
                      typeof acao.custoEA === 'number' ? `EA ${acao.custoEA}` : null,
                      acao.teste,
                      acao.dano,
                      acao.critico,
                    ]
                      .filter(Boolean)
                      .join(' | ')}
                  </p>
                  {acao.efeito ? <p className="text-sm text-app-muted">{String(acao.efeito)}</p> : null}
                  {acao.requisitos ? (
                    <p className="text-xs text-app-muted">Requisitos: {String(acao.requisitos)}</p>
                  ) : null}
                  {acao.descricao ? (
                    <p className="text-sm text-app-muted">{String(acao.descricao)}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {item.usoTatico ? (
          <SectionCard title="Uso tático" className="npc-panel">
            <p className="text-sm leading-relaxed text-app-fg">{item.usoTatico}</p>
          </SectionCard>
        ) : null}
      </div>
    </div>
  );
}
