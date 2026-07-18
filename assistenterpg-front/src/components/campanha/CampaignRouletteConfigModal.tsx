'use client';

import { useMemo, useState } from 'react';
import type {
  CampanhaRoletaConfig,
  CampanhaRoletaEstado,
  CampanhaRoletaModo,
  CampanhaRoletaPool,
  CampanhaRoletaPreset,
} from '@/lib/api/campanha-roleta';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Icon } from '@/components/ui/Icon';
import { agruparRepeticoesRoleta } from '@/lib/campanhas/campaign-roulette.helpers';

function copiarConfig(config: CampanhaRoletaConfig): CampanhaRoletaConfig {
  return JSON.parse(JSON.stringify(config)) as CampanhaRoletaConfig;
}

function alternarNumero(lista: number[], valor: number): number[] {
  return lista.includes(valor)
    ? lista.filter((item) => item !== valor)
    : [...lista, valor];
}

function alternarTexto(lista: string[], valor: string): string[] {
  return lista.includes(valor)
    ? lista.filter((item) => item !== valor)
    : [...lista, valor];
}

export function CampaignRouletteConfigModal({
  campanhaId,
  preset,
  estado,
  onClose,
  onSave,
  onPreview,
  onPermission,
}: {
  campanhaId: number;
  preset: CampanhaRoletaPreset;
  estado: CampanhaRoletaEstado;
  onClose: () => void;
  onSave: (
    modo: CampanhaRoletaModo,
    config: CampanhaRoletaConfig,
  ) => Promise<void>;
  onPreview: (
    modo: CampanhaRoletaModo,
    config: CampanhaRoletaConfig,
  ) => Promise<CampanhaRoletaPool>;
  onPermission: (
    usuarioId: number,
    permissao: { podeConfigurar: boolean; podeGirar: boolean },
  ) => Promise<void>;
}) {
  const [modo, setModo] = useState<CampanhaRoletaModo>(preset.modo);
  const [config, setConfig] = useState(() => copiarConfig(preset.config));
  const [busca, setBusca] = useState('');
  const [preview, setPreview] = useState<CampanhaRoletaPool | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);
  const repetidos = useMemo(
    () => agruparRepeticoesRoleta(config.listaManualTexto),
    [config.listaManualTexto],
  );
  const catalogoFiltrado = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    return estado.catalogo.itens
      .filter((item) => {
        if (modo === 'CLA') return item.categoria === 'CLA';
        if (modo === 'TECNICA') return item.categoria === 'TECNICA';
        return true;
      })
      .filter((item) => !termo || item.nome.toLocaleLowerCase('pt-BR').includes(termo))
      .slice(0, 80);
  }, [busca, estado.catalogo.itens, modo]);
  const clas = estado.catalogo.itens.filter((item) => item.categoria === 'CLA');
  const tecnicasHomebrewHereditarias = estado.catalogo.itens.filter(
    (item) =>
      item.categoria === 'TECNICA' &&
      item.fonte === 'HOMEBREW' &&
      item.hereditaria,
  );

  const alterarConfig = (atualizacao: Partial<CampanhaRoletaConfig>) => {
    setConfig((atual) => ({ ...atual, ...atualizacao }));
    setPreview(null);
  };

  const executar = async (acao: () => Promise<void>) => {
    setPendente(true);
    setErro(null);
    try {
      await acao();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Falha ao salvar a roleta.');
    } finally {
      setPendente(false);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Configurar preset ${preset.slot}`}
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={pendente}>
            Cancelar
          </Button>
          <Button
            onClick={() => void executar(async () => onSave(modo, config))}
            disabled={pendente}
          >
            <Icon name={pendente ? 'spinner' : 'save'} className="mr-2 h-4 w-4" />
            Salvar configuração
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {erro ? (
          <div className="rounded-xl border border-app-danger/40 bg-app-danger/10 p-3 text-sm text-app-danger">
            {erro}
          </div>
        ) : null}

        <section className="space-y-3">
          <h3 className="font-bold text-app-fg">Modo e fontes</h3>
          <label className="block text-sm font-semibold text-app-fg">
            Modo do preset
            <select
              value={modo}
              disabled={preset.slot !== 'CUSTOMIZADO'}
              onChange={(event) => setModo(event.target.value as CampanhaRoletaModo)}
              className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2"
            >
              <option value="CLA">Clã pela regra</option>
              <option value="TECNICA">Técnica pela regra</option>
              <option value="SIMPLES">Customizado simples</option>
            </select>
          </label>
          <Checkbox
            checked={config.fontes.sistemaBase}
            onChange={(event) =>
              alterarConfig({
                fontes: { ...config.fontes, sistemaBase: event.target.checked },
              })
            }
            label="Sistema base"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-app-border p-3">
              <p className="mb-2 text-sm font-bold text-app-fg">Suplementos publicados</p>
              <div className="max-h-40 space-y-2 overflow-auto">
                {estado.catalogo.suplementos.map((suplemento) => (
                  <Checkbox
                    key={suplemento.id}
                    checked={config.fontes.suplementoIds.includes(suplemento.id)}
                    onChange={() =>
                      alterarConfig({
                        fontes: {
                          ...config.fontes,
                          suplementoIds: alternarNumero(
                            config.fontes.suplementoIds,
                            suplemento.id,
                          ),
                        },
                      })
                    }
                    label={suplemento.nome}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-app-border p-3">
              <p className="mb-2 text-sm font-bold text-app-fg">Homebrews publicados</p>
              <div className="max-h-40 space-y-2 overflow-auto">
                {estado.catalogo.homebrews.map((homebrew) => (
                  <Checkbox
                    key={homebrew.id}
                    checked={config.fontes.homebrewIds.includes(homebrew.id)}
                    onChange={() =>
                      alterarConfig({
                        fontes: {
                          ...config.fontes,
                          homebrewIds: alternarNumero(
                            config.fontes.homebrewIds,
                            homebrew.id,
                          ),
                        },
                      })
                    }
                    label={`${homebrew.nome} — ${homebrew.autor.apelido}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <h3 className="font-bold text-app-fg">Catálogo e ajustes</h3>
            <p className="text-sm text-app-muted">
              Exclua itens das fontes ou force inclusões individuais no preset.
            </p>
          </div>
          <Input
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            icon="search"
            placeholder="Pesquisar clã ou técnica"
          />
          <div className="max-h-64 space-y-2 overflow-auto rounded-xl border border-app-border p-2">
            {catalogoFiltrado.map((item) => {
              const excluido = config.exclusoes.includes(item.chave);
              const incluido = config.inclusoesCatalogo.includes(item.chave);
              return (
                <div
                  key={item.chave}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-app-bg/50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-app-fg">{item.nome}</p>
                    <p className="text-xs text-app-muted">
                      {item.fonte} {item.hereditaria ? '· hereditária' : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="xs"
                      variant={excluido ? 'destructive' : 'ghost'}
                      onClick={() =>
                        alterarConfig({
                          exclusoes: alternarTexto(config.exclusoes, item.chave),
                          inclusoesCatalogo: config.inclusoesCatalogo.filter(
                            (chave) => chave !== item.chave,
                          ),
                        })
                      }
                    >
                      {excluido ? 'Excluído' : 'Excluir'}
                    </Button>
                    <Button
                      size="xs"
                      variant={incluido ? 'secondary' : 'ghost'}
                      onClick={() =>
                        alterarConfig({
                          inclusoesCatalogo: alternarTexto(
                            config.inclusoesCatalogo,
                            item.chave,
                          ),
                          exclusoes: config.exclusoes.filter(
                            (chave) => chave !== item.chave,
                          ),
                        })
                      }
                    >
                      {incluido ? 'Incluído' : 'Incluir'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-2">
          <label className="text-sm font-bold text-app-fg" htmlFor="roleta-lista-manual">
            Lista customizada, separada por ponto e vírgula
          </label>
          <textarea
            id="roleta-lista-manual"
            value={config.listaManualTexto}
            maxLength={10_000}
            onChange={(event) => alterarConfig({ listaManualTexto: event.target.value })}
            rows={5}
            placeholder="Exemplo A; Exemplo B; Exemplo A"
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-app-fg"
          />
          {repetidos.length > 0 ? (
            <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 p-3">
              <p className="mb-2 text-sm font-bold text-amber-300">
                Itens repetidos aumentam o peso
              </p>
              <div className="flex flex-wrap gap-2">
                {repetidos.map((item) => (
                  <Badge key={item.nome} color="yellow">
                    {item.nome} ×{item.quantidade}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {modo === 'TECNICA' && tecnicasHomebrewHereditarias.length > 0 ? (
          <section className="space-y-3">
            <div>
              <h3 className="font-bold text-app-fg">Compatibilidade hereditária</h3>
              <p className="text-sm text-app-muted">
                Técnicas compatíveis recebem peso 2×; inclusões sem compatibilidade ficam em 1×.
              </p>
            </div>
            {tecnicasHomebrewHereditarias.map((tecnica) => {
              const mapeamento = config.compatibilidadesHereditarias.find(
                (item) => item.tecnicaChave === tecnica.chave,
              ) ?? { tecnicaChave: tecnica.chave, claChaves: [] };
              return (
                <details key={tecnica.chave} className="rounded-xl border border-app-border p-3">
                  <summary className="cursor-pointer text-sm font-bold text-app-fg">
                    {tecnica.nome} · {mapeamento.claChaves.length} clã(s)
                  </summary>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {clas.map((cla) => (
                      <Checkbox
                        key={cla.chave}
                        checked={mapeamento.claChaves.includes(cla.chave)}
                        onChange={() => {
                          const proximo = alternarTexto(
                            mapeamento.claChaves,
                            cla.chave,
                          );
                          alterarConfig({
                            compatibilidadesHereditarias: [
                              ...config.compatibilidadesHereditarias.filter(
                                (item) => item.tecnicaChave !== tecnica.chave,
                              ),
                              { tecnicaChave: tecnica.chave, claChaves: proximo },
                            ].filter((item) => item.claChaves.length > 0),
                          });
                        }}
                        label={cla.nome}
                      />
                    ))}
                  </div>
                </details>
              );
            })}
          </section>
        ) : null}

        <section className="space-y-3 rounded-xl border border-app-border p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-app-fg">Prévia autoritativa</h3>
              <p className="text-sm text-app-muted">Resolve as fontes sem iniciar um sorteio.</p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              disabled={pendente}
              onClick={() =>
                void executar(async () => setPreview(await onPreview(modo, config)))
              }
            >
              <Icon name="eye" className="mr-2 h-4 w-4" />
              Gerar prévia
            </Button>
          </div>
          {preview ? (
            <div>
              <p className="mb-2 text-sm text-app-muted">
                {preview.quantidadeResultados} resultados · peso total {preview.pesoTotal}
              </p>
              <div className="flex max-h-36 flex-wrap gap-2 overflow-auto">
                {preview.itens.map((item) => (
                  <Badge key={item.chave} color={item.pesoTotal > 1 ? 'yellow' : 'gray'}>
                    {item.nome} {item.ocorrencias > 1 ? `×${item.ocorrencias}` : ''}
                    {item.pesoUnitario > 1 ? ` · peso ${item.pesoUnitario}×` : ''}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {estado.capacidades.podeGerenciarPermissoes ? (
          <section className="space-y-3">
            <div>
              <h3 className="font-bold text-app-fg">Permissões delegadas</h3>
              <p className="text-sm text-app-muted">
                Somente membros JOGADOR podem receber acesso. Observadores continuam somente leitura.
              </p>
            </div>
            <div className="space-y-2">
              {estado.catalogo.participantes
                .filter((participante) => participante.papel === 'JOGADOR')
                .map((participante) => {
                  const permissao = estado.permissoes.find(
                    (item) => item.usuarioId === participante.id,
                  );
                  return (
                    <div
                      key={participante.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-app-border px-3 py-2"
                    >
                      <span className="text-sm font-semibold text-app-fg">
                        {participante.apelido}
                      </span>
                      <div className="flex gap-4">
                        <Checkbox
                          checked={permissao?.podeConfigurar ?? false}
                          onChange={(event) =>
                            void executar(() =>
                              onPermission(participante.id, {
                                podeConfigurar: event.target.checked,
                                podeGirar: permissao?.podeGirar ?? false,
                              }),
                            )
                          }
                          label="Configurar"
                        />
                        <Checkbox
                          checked={permissao?.podeGirar ?? false}
                          onChange={(event) =>
                            void executar(() =>
                              onPermission(participante.id, {
                                podeConfigurar: permissao?.podeConfigurar ?? false,
                                podeGirar: event.target.checked,
                              }),
                            )
                          }
                          label="Girar"
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        ) : null}
        <p className="text-xs text-app-muted">Campanha #{campanhaId} · configuração V1</p>
      </div>
    </Modal>
  );
}
