// components/personagem-base/create/wizard/PersonagemBaseStepClasseOrigem.tsx
'use client';

import type { ClasseCatalogo, OrigemCatalogo } from '@/lib/api';
import { SelectModal, type SelectModalOption } from '@/components/ui/SelectModal';
import { Select } from '@/components/ui/Select';
import { Icon } from '@/components/ui/Icon';
import { Alert } from '@/components/ui/Alert';

type Props = {
  classes: ClasseCatalogo[];
  origens: OrigemCatalogo[];
  classeId: string;
  origemId: string;
  periciasClasseEscolhidasCodigos: string[];
  periciasOrigemEscolhidasCodigos: string[];
  onChangeClasseId: (v: string) => void;
  onChangeOrigemId: (v: string) => void;
  onChangePericiasClasse: (codigos: string[]) => void;
  onChangePericiasOrigem: (codigos: string[]) => void;
};

export function PersonagemBaseStepClasseOrigem({
  classes,
  origens,
  classeId,
  origemId,
  periciasClasseEscolhidasCodigos,
  periciasOrigemEscolhidasCodigos,
  onChangeClasseId,
  onChangeOrigemId,
  onChangePericiasClasse,
  onChangePericiasOrigem,
}: Props) {
  const origemSelecionada = origens.find((o) => String(o.id) === origemId);
  const classeSelecionada = classes.find((c) => String(c.id) === classeId);

  const habilidadesOrigem =
    origemSelecionada?.habilidadesIniciais ??
    origemSelecionada?.habilidadesOrigem?.map((r) => r.habilidade) ??
    [];

  const habilidadesClasse = classeSelecionada?.habilidadesIniciais ?? [];

  const periciasOrigem = origemSelecionada?.pericias ?? [];
  const periciasOrigemFixas =
    periciasOrigem.filter((op) => op.tipo === 'FIXA').map((op) => op.pericia) ?? [];

  const gruposEscolhaOrigem = Array.from(
    new Set(
      periciasOrigem
        .filter((op) => op.tipo === 'ESCOLHA' && op.grupoEscolha != null)
        .map((op) => op.grupoEscolha as number),
    ),
  ).sort((a, b) => a - b);

  const periciasClasse = classeSelecionada?.pericias ?? [];
  const periciasFixasClasse = periciasClasse.filter((cp) => cp.tipo === 'FIXA');

  const gruposEscolhaClasse = Array.from(
    new Set(
      periciasClasse
        .filter((cp) => cp.tipo === 'ESCOLHA' && cp.grupoEscolha != null)
        .map((cp) => cp.grupoEscolha as number),
    ),
  ).sort((a, b) => a - b);

  const escolhasOrigemPermitidasSet = new Set(
    periciasOrigem.filter((op) => op.tipo === 'ESCOLHA').map((op) => op.pericia.codigo),
  );
  const escolhasClassePermitidasSet = new Set(
    periciasClasse.filter((cp) => cp.tipo === 'ESCOLHA').map((cp) => cp.pericia.codigo),
  );

  const periciasOrigemEscolhidasSan = (periciasOrigemEscolhidasCodigos ?? []).filter((c) =>
    escolhasOrigemPermitidasSet.has(c),
  );
  const periciasClasseEscolhidasSan = (periciasClasseEscolhidasCodigos ?? []).filter((c) =>
    escolhasClassePermitidasSet.has(c),
  );

  function resolverEscolhasOrigemSemDuplicar(
    origem: OrigemCatalogo | undefined,
    escolhasOrigemAtuais: string[],
    escolhasClasse: string[],
  ): string[] {
    if (!origem) return [];

    const pericias = origem.pericias ?? [];
    const classeSet = new Set(escolhasClasse);

    const grupos = Array.from(
      new Set(
        pericias
          .filter((op) => op.tipo === 'ESCOLHA' && op.grupoEscolha != null)
          .map((op) => op.grupoEscolha as number),
      ),
    ).sort((a, b) => a - b);

    const resultado: string[] = [];

    for (const grupo of grupos) {
      const opcoesGrupo = pericias.filter(
        (op) => op.tipo === 'ESCOLHA' && op.grupoEscolha === grupo,
      );
      const codigosGrupo = opcoesGrupo.map((op) => op.pericia.codigo);

      const classeNoGrupo = escolhasClasse.find((c) => codigosGrupo.includes(c));
      const atualOrigem = escolhasOrigemAtuais.find((c) => codigosGrupo.includes(c));

      if (classeNoGrupo) {
        const alternativa = codigosGrupo.find(
          (c) => c !== classeNoGrupo && !classeSet.has(c),
        );
        if (alternativa) resultado.push(alternativa);
        continue;
      }

      if (atualOrigem) resultado.push(atualOrigem);
    }

    return resultado;
  }

  function setEscolhasOrigem(next: string[]) {
    onChangePericiasOrigem(next.filter((c) => escolhasOrigemPermitidasSet.has(c)));
  }

  function setEscolhasClasse(next: string[]) {
    onChangePericiasClasse(next.filter((c) => escolhasClassePermitidasSet.has(c)));
  }

  function handleChangeOrigem(novoId: string) {
    onChangeOrigemId(novoId);

    const origem = origens.find((o) => String(o.id) === novoId);
    if (!origem) {
      onChangePericiasOrigem([]);
      return;
    }

    const resolvidas = resolverEscolhasOrigemSemDuplicar(
      origem,
      [],
      periciasClasseEscolhidasSan,
    );
    onChangePericiasOrigem(resolvidas);
  }

  function handleChangeClasse(novoId: string) {
    onChangeClasseId(novoId);

    const classe = classes.find((c) => String(c.id) === novoId);
    if (!classe) {
      onChangePericiasClasse([]);
      return;
    }

    onChangePericiasClasse([]);

    if (origemSelecionada) {
      const resolvidas = resolverEscolhasOrigemSemDuplicar(
        origemSelecionada,
        periciasOrigemEscolhidasSan,
        [],
      );
      setEscolhasOrigem(resolvidas);
    }
  }

  function handleEscolhaPericiaGrupoOrigem(grupo: number, periciaCodigo: string) {
    if (!periciaCodigo) return;

    const codigosDeOutrosGrupos = periciasOrigem
      .filter(
        (op) =>
          op.tipo === 'ESCOLHA' &&
          op.grupoEscolha != null &&
          op.grupoEscolha !== grupo,
      )
      .map((op) => op.pericia.codigo);

    const baseOutros = periciasOrigemEscolhidasSan.filter((c) =>
      codigosDeOutrosGrupos.includes(c),
    );
    const tentativas = [...baseOutros, periciaCodigo];

    const resolvidas = resolverEscolhasOrigemSemDuplicar(
      origemSelecionada,
      tentativas,
      periciasClasseEscolhidasSan,
    );
    setEscolhasOrigem(resolvidas);
  }

  function handleEscolhaPericiaGrupoClasse(grupo: number, periciaCodigo: string) {
    if (!periciaCodigo) return;

    const codigosDeOutrosGrupos = periciasClasse
      .filter(
        (cp) =>
          cp.tipo === 'ESCOLHA' &&
          cp.grupoEscolha != null &&
          cp.grupoEscolha !== grupo,
      )
      .map((cp) => cp.pericia.codigo);

    const filtradas = periciasClasseEscolhidasSan.filter((codigo) =>
      codigosDeOutrosGrupos.includes(codigo),
    );
    const novasEscolhasClasse = [...filtradas, periciaCodigo];

    setEscolhasClasse(novasEscolhasClasse);

    if (origemSelecionada) {
      const resolvidas = resolverEscolhasOrigemSemDuplicar(
        origemSelecionada,
        periciasOrigemEscolhidasSan,
        novasEscolhasClasse,
      );
      setEscolhasOrigem(resolvidas);
    }
  }

  const profsClasse = classeSelecionada?.proficiencias ?? [];

  // ✅ Preparar opções para SelectModal - ORIGEM (COM KEYS ÚNICAS)
  const origensOptions: SelectModalOption<OrigemCatalogo>[] = origens.map((origem) => {
    const requisitos = [];
    if (origem.requerGrandeCla) requisitos.push('Requer Grande Clã');
    if (origem.requerTecnicaHeriditaria) requisitos.push('Requer Técnica Hereditária');
    if (origem.bloqueiaTecnicaHeriditaria) requisitos.push('Bloqueia Técnica Hereditária');

    const todasPericias = origem.pericias ?? [];
    const periciasFixas = todasPericias.filter((p) => p.tipo === 'FIXA');
    const periciasEscolha = todasPericias.filter((p) => p.tipo === 'ESCOLHA');
    
    const habilidades = [
      ...(origem.habilidadesIniciais ?? []),
      ...(origem.habilidadesOrigem?.map((r) => r.habilidade) ?? []),
    ];

    return {
      value: origem.id,
      label: origem.nome,
      description: origem.descricao,
      badges: requisitos.length > 0 ? requisitos.map((r) => ({ text: r, color: 'yellow' as const })) : [],
      details: (
        <div className="space-y-3">
          {/* Requisitos */}
          {requisitos.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-app-warning mb-1.5">⚠️ Requisitos</p>
              <ul className="space-y-0.5">
                {requisitos.map((req, idx) => (
                  <li key={`req-${idx}`} className="text-xs text-app-muted flex items-start gap-1.5">
                    <span className="text-app-warning">•</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Perícias Fixas */}
          {periciasFixas.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-app-fg mb-1.5 flex items-center gap-1">
                <Icon name="list" className="w-3 h-3" />
                Perícias garantidas
              </p>
              <ul className="space-y-0.5">
                {periciasFixas.map((p) => (
                  <li key={`orig-fixa-${p.id}`} className="text-xs text-app-muted flex items-start gap-1.5">
                    <span className="text-app-primary">•</span>
                    {p.pericia.nome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Perícias de Escolha */}
          {periciasEscolha.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-app-fg mb-1.5 flex items-center gap-1">
                <Icon name="list" className="w-3 h-3" />
                Perícias para escolher
              </p>
              <p className="text-xs text-app-muted mb-1">
                Escolha {gruposEscolhaOrigem.length} perícia{gruposEscolhaOrigem.length > 1 ? 's' : ''} das opções:
              </p>
              <ul className="space-y-0.5">
                {periciasEscolha.map((p) => (
                  <li key={`orig-escolha-${p.id}`} className="text-xs text-app-muted flex items-start gap-1.5">
                    <span className="text-app-primary">•</span>
                    {p.pericia.nome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Habilidades */}
          {habilidades.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-app-fg mb-1.5 flex items-center gap-1">
                <Icon name="sparkles" className="w-3 h-3" />
                Habilidades iniciais
              </p>
              <div className="space-y-2">
                {habilidades.map((h, idx) => (
                  <div key={`orig-hab-${h.id}-${idx}`} className="border border-app-border/50 rounded p-2 bg-app-surface/50">
                    <p className="text-xs font-medium text-app-fg">{h.nome}</p>
                    {h.descricao && (
                      <p className="text-[10px] text-app-muted mt-0.5 leading-relaxed">
                        {h.descricao}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
      data: origem,
    };
  });

  // ✅ Preparar opções para SelectModal - CLASSE (COM KEYS ÚNICAS)
  const classesOptions: SelectModalOption<ClasseCatalogo>[] = classes.map((classe) => {
    const todasPericias = classe.pericias ?? [];
    const periciasFixas = todasPericias.filter((p) => p.tipo === 'FIXA');
    const periciasEscolha = todasPericias.filter((p) => p.tipo === 'ESCOLHA');
    const habilidades = classe.habilidadesIniciais ?? [];
    const proficiencias = classe.proficiencias ?? [];
    const periciasLivres = classe.periciasLivresBase ?? 0;

    return {
      value: classe.id,
      label: classe.nome,
      description: classe.descricao,
      badges: periciasLivres > 0 
        ? [{ text: `+${periciasLivres} perícia${periciasLivres > 1 ? 's' : ''} livre${periciasLivres > 1 ? 's' : ''}`, color: 'green' as const }] 
        : [],
      details: (
        <div className="space-y-3">
          {/* Perícias Fixas */}
          {periciasFixas.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-app-fg mb-1.5 flex items-center gap-1">
                <Icon name="list" className="w-3 h-3" />
                Perícias garantidas
              </p>
              <ul className="space-y-0.5">
                {periciasFixas.map((p) => (
                  <li key={`classe-fixa-${p.id}`} className="text-xs text-app-muted flex items-start gap-1.5">
                    <span className="text-app-primary">•</span>
                    {p.pericia.nome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Perícias de Escolha */}
          {periciasEscolha.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-app-fg mb-1.5 flex items-center gap-1">
                <Icon name="list" className="w-3 h-3" />
                Perícias para escolher
              </p>
              <p className="text-xs text-app-muted mb-1">
                Escolha {gruposEscolhaClasse.length} perícia{gruposEscolhaClasse.length > 1 ? 's' : ''} das opções:
              </p>
              <ul className="space-y-0.5">
                {periciasEscolha.map((p) => (
                  <li key={`classe-escolha-${p.id}`} className="text-xs text-app-muted flex items-start gap-1.5">
                    <span className="text-app-primary">•</span>
                    {p.pericia.nome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Proficiências */}
          {proficiencias.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-app-fg mb-1.5 flex items-center gap-1">
                <Icon name="tools" className="w-3 h-3" />
                Proficiências
              </p>
              <ul className="space-y-0.5">
                {proficiencias.map((prof) => (
                  <li key={`prof-${prof.id}`} className="text-xs text-app-muted flex items-start gap-1.5">
                    <span className="text-app-primary">•</span>
                    {prof.nome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Habilidades */}
          {habilidades.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-app-fg mb-1.5 flex items-center gap-1">
                <Icon name="sparkles" className="w-3 h-3" />
                Habilidades iniciais
              </p>
              <div className="space-y-2">
                {habilidades.map((h, idx) => (
                  <div key={`classe-hab-${h.id}-${idx}`} className="border border-app-border/50 rounded p-2 bg-app-surface/50">
                    <p className="text-xs font-medium text-app-fg">{h.nome}</p>
                    {h.descricao && (
                      <p className="text-[10px] text-app-muted mt-0.5 leading-relaxed">
                        {h.descricao}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Perícias Livres */}
          {periciasLivres > 0 && (
            <div className="border border-app-success/30 rounded p-2 bg-app-success/5">
              <p className="text-xs font-semibold text-app-success flex items-center gap-1">
                <Icon name="sparkles" className="w-3 h-3" />
                +{periciasLivres} perícia{periciasLivres > 1 ? 's' : ''} livre{periciasLivres > 1 ? 's' : ''}
              </p>
              <p className="text-[10px] text-app-muted mt-0.5">
                Você poderá escolher livremente após a criação
              </p>
            </div>
          )}
        </div>
      ),
      data: classe,
    };
  });

  const renderCompactList = (items: { key: string | number; text: React.ReactNode }[]) => {
    if (!items || items.length === 0) return null;

    return (
      <ul className="space-y-1 text-sm text-app-muted">
        {items.map((i) => (
          <li key={i.key} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-app-primary/60" />
            <span>{i.text}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderHabilidades = (habs: Array<{ id: number; nome: string; descricao: string | null }>) => {
    if (!habs || habs.length === 0) return null;

    return (
      <div className="space-y-2">
        {habs.map((h, idx) => (
          <div
            key={`render-hab-${h.id}-${idx}`}
            className="rounded border border-app-border bg-app-surface p-3"
          >
            <p className="text-sm font-medium text-app-fg">{h.nome}</p>
            {h.descricao && (
              <p className="mt-1 text-xs text-app-muted leading-relaxed">
                {h.descricao}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Origem do Personagem */}
      <div>
        <h3 className="text-sm font-semibold text-app-fg mb-3 flex items-center gap-2">
          <Icon name="tag" className="w-4 h-4 text-app-primary" />
          Origem do personagem
        </h3>

        <div className="space-y-3">
          <SelectModal
            label="Origem *"
            value={origemId}
            options={origensOptions}
            onChange={(v) => handleChangeOrigem(String(v))}
            placeholder="Selecione uma origem..."
            helperText="Define background narrativo e perícias iniciais"
          />

          {origemSelecionada && (
            <>
              {periciasOrigemFixas.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-app-fg mb-2">
                    Perícias garantidas
                  </p>
                  {renderCompactList(
                    periciasOrigemFixas.map((p) => ({
                      key: p.id,
                      text: <span className="text-app-fg font-medium">{p.nome}</span>,
                    })),
                  )}
                </div>
              )}

              {habilidadesOrigem.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-app-fg mb-2">
                    Habilidades iniciais
                  </p>
                  {renderHabilidades(habilidadesOrigem)}
                </div>
              )}

              {gruposEscolhaOrigem.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-app-muted">
                    Escolha uma perícia por grupo. Duplicatas com a classe são
                    resolvidas automaticamente.
                  </p>

                  {gruposEscolhaOrigem.map((grupo) => {
                    const opcoesGrupo = periciasOrigem.filter(
                      (op) => op.tipo === 'ESCOLHA' && op.grupoEscolha === grupo,
                    );

                    const codigosGrupo = opcoesGrupo.map((op) => op.pericia.codigo);
                    const selecionadaGrupo = periciasOrigemEscolhidasSan.find((c) =>
                      codigosGrupo.includes(c),
                    );

                    const classeNoGrupo = periciasClasseEscolhidasSan.find((c) =>
                      codigosGrupo.includes(c),
                    );
                    const foiAuto =
                      !!classeNoGrupo &&
                      !!selecionadaGrupo &&
                      selecionadaGrupo !== classeNoGrupo;

                    const opcoesDisponiveis = opcoesGrupo.filter(
                      (op) =>
                        !periciasClasseEscolhidasSan.includes(op.pericia.codigo),
                    );

                    return (
                      <div
                        key={grupo}
                        className="rounded border border-app-border bg-app-surface p-3"
                      >
                        <Select
                          label={`Perícia – grupo ${grupo}`}
                          value={selecionadaGrupo ?? ''}
                          onChange={(e) =>
                            handleEscolhaPericiaGrupoOrigem(grupo, e.target.value)
                          }
                          disabled={
                            opcoesDisponiveis.length === 1 && !!selecionadaGrupo
                          }
                        >
                          <option value="">
                            {opcoesDisponiveis.length === 0
                              ? 'Todas já escolhidas pela classe'
                              : 'Selecione...'}
                          </option>

                          {opcoesGrupo.map((op) => {
                            const disabled = periciasClasseEscolhidasSan.includes(
                              op.pericia.codigo,
                            );
                            return (
                              <option
                                key={op.id}
                                value={op.pericia.codigo}
                                disabled={disabled}
                              >
                                {op.pericia.nome}
                              </option>
                            );
                          })}
                        </Select>

                        {foiAuto && (
                          <p className="mt-2 text-xs text-app-success flex items-center gap-2">
                            <Icon name="check" className="h-4 w-4" />
                            Escolhida automaticamente para evitar duplicar
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {periciasOrigemEscolhidasSan.length < gruposEscolhaOrigem.length && (
                    <Alert variant="warning">
                      <p className="text-xs">
                        Você ainda não escolheu todas as perícias da origem.
                      </p>
                    </Alert>
                  )}
                </div>
              )}

              {!periciasOrigemFixas.length &&
                !habilidadesOrigem.length &&
                !gruposEscolhaOrigem.length && (
                  <p className="text-xs text-app-muted">
                    Esta origem não possui perícias ou habilidades especiais.
                  </p>
                )}
            </>
          )}
        </div>
      </div>

      {/* Classe do Personagem */}
      <div>
        <h3 className="text-sm font-semibold text-app-fg mb-3 flex items-center gap-2">
          <Icon name="characters" className="w-4 h-4 text-app-primary" />
          Classe do personagem
        </h3>

        <div className="space-y-3">
          <SelectModal
            label="Classe *"
            value={classeId}
            options={classesOptions}
            onChange={(v) => handleChangeClasse(String(v))}
            placeholder="Selecione uma classe..."
            helperText="Define estilo de combate e proficiências"
          />

          {classeSelecionada && (
            <>
              {habilidadesClasse.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-app-fg mb-2">
                    Habilidades iniciais
                  </p>
                  {renderHabilidades(habilidadesClasse)}
                </div>
              )}

              {periciasFixasClasse.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-app-fg mb-2">
                    Perícias garantidas
                  </p>
                  {renderCompactList(
                    periciasFixasClasse.map((cp) => ({
                      key: cp.id,
                      text: (
                        <span className="text-app-fg font-medium">
                          {cp.pericia.nome}
                        </span>
                      ),
                    })),
                  )}
                </div>
              )}

              {gruposEscolhaClasse.length > 0 && (
                <div className="space-y-3">
                  {gruposEscolhaClasse.map((grupo) => {
                    const opcoesGrupo = periciasClasse.filter(
                      (cp) => cp.tipo === 'ESCOLHA' && cp.grupoEscolha === grupo,
                    );

                    const selecionadaGrupo = periciasClasseEscolhidasSan.find(
                      (codigo) =>
                        opcoesGrupo.some((cp) => cp.pericia.codigo === codigo),
                    );

                    return (
                      <div
                        key={grupo}
                        className="rounded border border-app-border bg-app-surface p-3"
                      >
                        <Select
                          label={`Perícia – grupo ${grupo}`}
                          value={selecionadaGrupo ?? ''}
                          onChange={(e) =>
                            handleEscolhaPericiaGrupoClasse(grupo, e.target.value)
                          }
                        >
                          <option value="">Selecione...</option>
                          {opcoesGrupo.map((cp) => (
                            <option key={cp.id} value={cp.pericia.codigo}>
                              {cp.pericia.nome}
                            </option>
                          ))}
                        </Select>
                      </div>
                    );
                  })}

                  {periciasClasseEscolhidasSan.length < gruposEscolhaClasse.length && (
                    <Alert variant="warning">
                      <p className="text-xs">
                        Você ainda não escolheu todas as perícias da classe.
                      </p>
                    </Alert>
                  )}
                </div>
              )}

              {profsClasse.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-app-fg mb-2">
                    Proficiências garantidas
                  </p>
                  {renderCompactList(
                    profsClasse.map((rel) => ({
                      key: rel.id,
                      text: <span className="text-app-fg font-medium">{rel.nome}</span>,
                    })),
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
