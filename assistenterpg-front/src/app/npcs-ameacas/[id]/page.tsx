'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGetNpcAmeaca } from '@/lib/api/npcs-ameacas';
import type { NpcAmeacaDetalhe } from '@/lib/types';
import { extrairMensagemErro } from '@/lib/api/error-handler';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/ui/Loading';

function traduzirFichaTipo(tipo: NpcAmeacaDetalhe['fichaTipo']) {
  return tipo === 'NPC' ? 'NPC' : 'Ameaca';
}

function traduzirTipo(tipo: NpcAmeacaDetalhe['tipo']) {
  const mapa: Record<NpcAmeacaDetalhe['tipo'], string> = {
    PESSOA: 'Pessoa',
    FEITICEIRO: 'Feiticeiro',
    MALDICAO: 'Maldicao',
    ANIMAL: 'Animal',
    HIBRIDO: 'Hibrido',
    ESPIRITO: 'Espirito',
    OUTRO: 'Outro',
  };
  return mapa[tipo];
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
      setErro('ID invalido.');
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
      <div className="min-h-screen bg-app-bg p-6">
        <Loading message="Carregando ficha..." className="text-app-fg" />
      </div>
    );
  }

  if (erro || !item) {
    return (
      <div className="min-h-screen bg-app-bg p-6">
        <div className="mx-auto max-w-4xl space-y-4">
          <ErrorAlert message={erro ?? 'Ficha nao encontrada.'} />
          <Button variant="secondary" onClick={() => router.push('/npcs-ameacas')}>
            <Icon name="back" className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-app-primary/10">
              <Icon name="curse" className="h-6 w-6 text-app-primary" />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <h1 className="text-3xl font-bold text-app-fg">{item.nome}</h1>
                <Badge color={item.fichaTipo === 'NPC' ? 'blue' : 'red'} size="sm">
                  {traduzirFichaTipo(item.fichaTipo)}
                </Badge>
              </div>
              <p className="text-sm text-app-muted">
                {traduzirTipo(item.tipo)} | Tamanho {item.tamanho}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push(`/npcs-ameacas/${item.id}/editar`)}
            >
              <Icon name="edit" className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="ghost" onClick={() => router.push('/npcs-ameacas')}>
              <Icon name="back" className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </header>

        {item.descricao && (
          <Card>
            <p className="text-sm leading-relaxed text-app-fg">{item.descricao}</p>
          </Card>
        )}

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-app-fg">Resumo rapido</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded border border-app-border bg-app-base p-3">
              <p className="text-xs text-app-muted">VD</p>
              <p className="text-xl font-semibold text-app-fg">{item.vd}</p>
            </div>
            <div className="rounded border border-app-border bg-app-base p-3">
              <p className="text-xs text-app-muted">Defesa</p>
              <p className="text-xl font-semibold text-app-fg">{item.defesa}</p>
            </div>
            <div className="rounded border border-app-border bg-app-base p-3">
              <p className="text-xs text-app-muted">PV</p>
              <p className="text-xl font-semibold text-app-fg">{item.pontosVida}</p>
            </div>
            <div className="rounded border border-app-border bg-app-base p-3">
              <p className="text-xs text-app-muted">Deslocamento</p>
              <p className="text-xl font-semibold text-app-fg">{item.deslocamentoMetros}m</p>
            </div>
          </div>
          {item.machucado !== null && (
            <p className="text-sm text-app-muted">Machucado: {item.machucado}</p>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-app-fg">Atributos e pericias</h2>
          <div className="grid gap-3 sm:grid-cols-5">
            {valoresAtributos.map(([label, valor]) => (
              <div key={label} className="rounded border border-app-border bg-app-base p-3">
                <p className="text-xs text-app-muted">{label}</p>
                <p className="text-lg font-semibold text-app-fg">{valor}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm text-app-fg">
            <p>Percepcao: {item.percepcao}</p>
            <p>Iniciativa: {item.iniciativa}</p>
            <p>Fortitude: {item.fortitude}</p>
            <p>Reflexos: {item.reflexos}</p>
            <p>Vontade: {item.vontade}</p>
            <p>Luta: {item.luta}</p>
            <p>Jujutsu: {item.jujutsu}</p>
          </div>
          {item.periciasEspeciais.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-app-fg">Pericias especiais</h3>
              <ul className="space-y-1 text-sm text-app-fg">
                {item.periciasEspeciais.map((pericia, index) => (
                  <li key={`pericia-${index}`} className="rounded border border-app-border px-3 py-2">
                    <span className="font-medium">{String(pericia.nome)}</span>
                    {typeof pericia.bonus === 'number' && ` | bonus ${pericia.bonus}`}
                    {pericia.descricao && ` | ${String(pericia.descricao)}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-app-fg">Resistencias e vulnerabilidades</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-app-fg">Resistencias</p>
              {item.resistencias.length === 0 ? (
                <p className="text-sm text-app-muted">Nenhuma resistencia cadastrada.</p>
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
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-app-fg">Passivas</h2>
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
        </Card>

        <Card className="space-y-3">
          <h2 className="text-lg font-semibold text-app-fg">Acoes</h2>
          {item.acoes.length === 0 ? (
            <p className="text-sm text-app-muted">Sem acoes cadastradas.</p>
          ) : (
            <div className="space-y-2">
              {item.acoes.map((acao, index) => (
                <div key={`acao-${index}`} className="rounded border border-app-border p-3 space-y-1">
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
                  {acao.efeito && (
                    <p className="text-sm text-app-muted">{String(acao.efeito)}</p>
                  )}
                  {acao.requisitos && (
                    <p className="text-xs text-app-muted">
                      Requisitos: {String(acao.requisitos)}
                    </p>
                  )}
                  {acao.descricao && (
                    <p className="text-sm text-app-muted">{String(acao.descricao)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {item.usoTatico && (
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-app-fg">Uso tatico</h2>
            <p className="text-sm leading-relaxed text-app-fg">{item.usoTatico}</p>
          </Card>
        )}
      </div>
    </div>
  );
}
