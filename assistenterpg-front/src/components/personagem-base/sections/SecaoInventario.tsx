'use client';

import { useMemo } from 'react';

import type {
  PersonagemBaseDetalhe,
  EquipamentoCatalogo,
  ModificacaoCatalogo,
  ItemInventarioDto,
} from '@/lib/api';

import { 
  getGrauXamaPorPrestigio, 
  formatarGrauXama 
} from '@/lib/utils/prestigio';

import {
  getIconeTipo,
  getIconeCategoria,
  formatarPercentualCarga,
  getCorBarraProgresso,
  getCorTextoProgresso,
  isCategoriaBloquada,
  formatarIncrementoEspacos,
  contarItensVestiveis,
  LIMITES_VESTIR,
  CATEGORIA_GRAU_LABELS,
  normalizarCategoria,
} from '@/lib/utils/inventario';

import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';

type Props = {
  personagem: PersonagemBaseDetalhe;
  equipamentos?: EquipamentoCatalogo[];
  modificacoes?: ModificacaoCatalogo[];
};

export function SecaoInventario({ 
  personagem,
  equipamentos = [],
}: Props) {
  const itensInventario = useMemo<ItemInventarioDto[]>(
    () => personagem.itensInventario ?? [],
    [personagem.itensInventario],
  );

  // Usar dados do backend.
  const espacosBase = personagem.espacosInventarioBase;
  const espacosExtra = personagem.espacosInventarioExtra || 0;
  const espacosOcupados = personagem.espacosOcupados || 0;
  const sobrecarregado = personagem.sobrecarregado || false;
  
  const espacosTotal = espacosBase + espacosExtra;
  const espacosRestantes = espacosTotal - espacosOcupados;
  const espacosPercentual = formatarPercentualCarga(espacosOcupados, espacosTotal);

  // Grau Xamã
  const grauXama = useMemo(
    () => getGrauXamaPorPrestigio(personagem.prestigioBase),
    [personagem.prestigioBase],
  );

  // Normalizar categorias do backend.
  const itensPorCategoria = useMemo(() => {
    const contagem: Record<string, number> = {
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      'ESPECIAL': 0,
    };

    itensInventario.forEach((item) => {
      const categoriaRaw = item.categoriaCalculada || item.equipamento?.categoria || '0';
      const categoria = normalizarCategoria(categoriaRaw);
      contagem[categoria] = (contagem[categoria] || 0) + item.quantidade;
    });

    return contagem;
  }, [itensInventario]);

  // Sistema de vestir agora detecta FERRAMENTA_AMALDICOADA.
  const { vestiveis, vestimentas } = useMemo(() => {
    if (!itensInventario || itensInventario.length === 0) {
      return { vestiveis: 0, vestimentas: 0 };
    }

    return contarItensVestiveis(itensInventario, equipamentos);
  }, [itensInventario, equipamentos]);

  // Stats equipados (placeholder)
  const statsEquipados = useMemo(() => {
    return {
      defesaTotal: 0,
      penalidadeCarga: 0,
      danosTotais: [],
      reducoesDano: [],
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* ===== GRAU XAMÃ ===== */}
      <div className="card">
        <div className="card__body">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="star" className="w-5 h-5 text-app-primary" />
            Grau de Xamã
          </h3>
          <p className="text-sm mb-4">
            {formatarGrauXama(grauXama.grau)} ({personagem.prestigioBase} prestígio)
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {['4', '3', '2', '1', 'ESPECIAL'].map((cat) => {
              const limite = grauXama.limitesPorCategoria[cat] ?? 0;
              const atual = itensPorCategoria[cat] || 0;
              const bloqueado = isCategoriaBloquada(cat, itensPorCategoria, grauXama.limitesPorCategoria);

              return (
                <div
                  key={cat}
                  className={`p-3 rounded border transition-all ${
                    bloqueado
                      ? 'border-app-danger/30 bg-app-danger/5'
                      : 'border-app-border bg-app-surface'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Icon
                      name={getIconeCategoria(cat)}
                      className={`w-5 h-5 ${
                        bloqueado ? 'text-app-danger' : 'text-app-primary'
                      }`}
                    />
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          bloqueado ? 'text-app-danger' : 'text-app-fg'
                        }`}
                      >
                        {atual}/{limite}
                      </p>
                      <p className="text-xs text-app-muted">Cat. {cat}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {itensPorCategoria['0'] > 0 && (
            <div className="mt-3 p-3 bg-app-primary/10 border border-app-primary/30 rounded text-sm">
              <div className="flex items-center gap-2">
                <Icon name="refresh" className="w-4 h-4 text-app-primary" />
                <span>
                  <strong>Categoria 0:</strong> {itensPorCategoria['0']} itens (ilimitada)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== CAPACIDADE DE CARGA ===== */}
      <div className="card">
        <div className="card__body">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Icon name="briefcase" className="w-5 h-5 text-app-primary" />
              Capacidade de Carga
            </h3>
            <Badge
              color={espacosPercentual >= 90 ? 'red' : espacosPercentual >= 70 ? 'yellow' : 'green'}
              size="sm"
            >
              {espacosPercentual}%
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div>
              <div className="text-xs text-app-muted uppercase tracking-wide">Total</div>
              <div className="text-2xl font-bold text-app-fg">{espacosTotal}</div>
              {espacosExtra > 0 && (
                <div className="text-xs text-app-success">
                  <Icon name="add" className="w-3 h-3 inline mr-1" />
                  +{espacosExtra} (itens)
                </div>
              )}
            </div>
            <div>
              <div className="text-xs text-app-muted uppercase tracking-wide">Ocupados</div>
              <div className="text-2xl font-bold text-app-fg">{espacosOcupados}</div>
            </div>
            <div>
              <div className="text-xs text-app-muted uppercase tracking-wide">Restantes</div>
              <div className={`text-2xl font-bold ${getCorTextoProgresso(espacosPercentual)}`}>
                {espacosRestantes}
              </div>
            </div>
            <div>
              <div className="text-xs text-app-muted uppercase tracking-wide">Ocupação</div>
              <div className={`text-2xl font-bold ${getCorTextoProgresso(espacosPercentual)}`}>
                {espacosPercentual}%
              </div>
            </div>
          </div>

          <div className="w-full bg-app-muted-surface rounded-full h-3 overflow-hidden mb-4">
            <div
              className={`h-full transition-all ${getCorBarraProgresso(espacosPercentual)}`}
              style={{ width: `${Math.min(espacosPercentual, 100)}%` }}
            />
          </div>

          <p className="text-xs text-app-muted">
            Base: {espacosBase} (Força × 5)
            {espacosExtra > 0 && (
              <span className="text-app-success ml-2">
                + {espacosExtra} de itens especiais
              </span>
            )}
          </p>

          {sobrecarregado && (
            <Alert variant="error" className="mt-3">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="error" className="w-5 h-5" />
                <div>
                  <strong>⚠️ Personagem Sobrecarregado!</strong>
                  <br />
                  Você está carregando {espacosOcupados - espacosTotal} espaço(s) acima da capacidade.
                </div>
              </div>
            </Alert>
          )}

          {!sobrecarregado && espacosPercentual >= 90 && (
            <Alert variant="warning" className="mt-3">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="warning" className="w-5 h-5" />
                <span>Capacidade quase esgotada! Apenas {espacosRestantes} espaço(s) restante(s).</span>
              </div>
            </Alert>
          )}
        </div>
      </div>

      {/* SISTEMA DE VESTIR */}
      <div className="card">
        <div className="card__body">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="shield" className="w-5 h-5 text-app-primary" />
            Sistema de Vestir
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div
              className={`p-4 rounded border ${
                vestiveis > LIMITES_VESTIR.MAX_VESTIVEIS
                  ? 'border-app-danger/30 bg-app-danger/5'
                  : 'border-app-border bg-app-surface'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-app-muted">Itens Vestidos</span>
                <Icon name="shield" className="w-5 h-5 text-app-primary" />
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-bold ${
                    vestiveis > LIMITES_VESTIR.MAX_VESTIVEIS
                      ? 'text-app-danger'
                      : 'text-app-fg'
                  }`}
                >
                  {vestiveis}
                </span>
                <span className="text-sm text-app-muted">
                  / {LIMITES_VESTIR.MAX_VESTIVEIS}
                </span>
              </div>
              <p className="text-xs text-app-muted mt-1">
                Proteções + Acessórios + Amaldiçoadas
              </p>
            </div>

            <div
              className={`p-4 rounded border ${
                vestimentas > LIMITES_VESTIR.MAX_VESTIMENTAS
                  ? 'border-app-danger/30 bg-app-danger/5'
                  : 'border-app-border bg-app-surface'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-app-muted">Vestimentas</span>
                <Icon name="sparkles" className="w-5 h-5 text-app-primary" />
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-bold ${
                    vestimentas > LIMITES_VESTIR.MAX_VESTIMENTAS
                      ? 'text-app-danger'
                      : 'text-app-fg'
                  }`}
                >
                  {vestimentas}
                </span>
                <span className="text-sm text-app-muted">
                  / {LIMITES_VESTIR.MAX_VESTIMENTAS}
                </span>
              </div>
              <p className="text-xs text-app-muted mt-1">
                Apenas acessórios vestimenta
              </p>
            </div>
          </div>

          {(vestiveis > LIMITES_VESTIR.MAX_VESTIVEIS ||
            vestimentas > LIMITES_VESTIR.MAX_VESTIMENTAS) && (
            <Alert variant="error" className="mt-3">
              <div className="text-sm">
                <Icon name="error" className="w-4 h-4 inline mr-2" />
                <strong>Limite de vestir excedido!</strong> Desequipe alguns itens.
              </div>
            </Alert>
          )}
        </div>
      </div>

      {/* STATS EQUIPADOS */}
      {itensInventario.some((item) => item.equipado) && (
        <div className="card">
          <div className="card__body">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="bolt" className="w-5 h-5 text-app-primary" />
              Stats Equipados
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded border border-app-border bg-app-surface">
                <div className="text-xs text-app-muted mb-1">Defesa Total</div>
                <div className="text-2xl font-bold text-app-fg">
                  {statsEquipados.defesaTotal}
                </div>
              </div>

              <div className="p-3 rounded border border-app-border bg-app-surface">
                <div className="text-xs text-app-muted mb-1">Penalidade de Carga</div>
                <div className="text-2xl font-bold text-app-warning">
                  {statsEquipados.penalidadeCarga > 0 ? '-' : ''}
                  {statsEquipados.penalidadeCarga}
                </div>
              </div>

              <div className="p-3 rounded border border-app-border bg-app-surface">
                <div className="text-xs text-app-muted mb-1">Danos</div>
                <div className="text-lg font-bold text-app-fg">
                  {statsEquipados.danosTotais.length || 0}
                </div>
              </div>
            </div>

            <p className="text-xs text-app-muted mt-3">
              <Icon name="info" className="w-3 h-3 inline mr-1" />
              Cálculo detalhado de stats será implementado em breve.
            </p>
          </div>
        </div>
      )}

      {/* ===== ITENS NO INVENTÁRIO ===== */}
      <div className="card">
        <div className="card__body">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Icon name="briefcase" className="w-5 h-5 text-app-primary" />
            Itens no Inventário
            <span className="text-sm font-normal text-app-muted ml-2">
              ({itensInventario.length} {itensInventario.length === 1 ? 'item' : 'itens'})
            </span>
          </h3>

          {itensInventario.length === 0 ? (
            <div className="text-center py-8 text-app-muted">
              <Icon name="briefcase" className="mx-auto mb-2 w-8 h-8 opacity-50" />
              <p>Inventário vazio</p>
            </div>
          ) : (
            <div className="space-y-4">
              {itensInventario.map((item, index) => {
                const equip = item.equipamento;

                if (!equip) {
                  return (
                    <div key={index} className="p-3 bg-app-warning/10 border border-app-warning/30 rounded">
                      ⚠️ Equipamento não carregado para o item ID {item.id}
                    </div>
                  );
                }

                const espacosPorUnidade = item.espacosCalculados;
                const espacosTotal = espacosPorUnidade * item.quantidade;
                const modsAplicadas = item.modificacoes || [];

                const categoriaRaw = item.categoriaCalculada || equip.categoria || '0';
                const categoriaFinal = normalizarCategoria(categoriaRaw);
                
                const categoriaLabel = CATEGORIA_GRAU_LABELS[categoriaFinal] || {
                  nome: `Grau ${categoriaFinal}`,
                  cor: 'text-app-muted',
                };
                
                const categoriaAlterada = item.categoriaCalculada && 
                  normalizarCategoria(item.categoriaCalculada) !== normalizarCategoria(equip.categoria);

                return (
                  <div
                    key={index}
                    className="p-4 border border-app-border rounded-lg bg-app-card hover:bg-app-muted-surface transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2 text-app-fg">
                          <Icon name={getIconeTipo(equip.tipo)} className="w-5 h-5 text-app-primary" />
                          {item.nomeCustomizado || equip.nome}
                        </div>
                        <div className="text-xs text-app-muted">({equip.codigo})</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge color="blue" size="sm">
                            {equip.tipo}
                          </Badge>
                          <Badge 
                            color={categoriaAlterada ? "purple" : "blue"} 
                            size="sm"
                          >
                            {categoriaLabel.nome}
                            {categoriaAlterada && (
                              <Icon name="sparkles" className="w-3 h-3 inline ml-1" />
                            )}
                          </Badge>
                        </div>
                      </div>
                      {item.equipado && (
                        <Badge color="green" size="sm">
                          <Icon name="check" className="w-3 h-3 inline mr-1" />
                          equipado
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-3">
                      <div className="text-app-fg">
                        <span className="text-app-muted">Quantidade:</span> {item.quantidade}x
                      </div>
                      <div className="text-app-fg">
                        <span className="text-app-muted">Espaços/un:</span> {espacosPorUnidade}
                      </div>
                      <div className="text-app-fg">
                        <span className="text-app-muted">Total:</span> {espacosTotal} espaço(s)
                      </div>
                    </div>

                    {modsAplicadas.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-app-border">
                        <div className="text-xs font-semibold text-app-fg mb-2 flex items-center gap-2">
                          <Icon name="sparkles" className="w-4 h-4" />
                          Modificações
                        </div>
                        <div className="space-y-1">
                          {modsAplicadas.map((mod) => (
                            <div key={mod.id} className="text-sm text-app-muted flex items-center gap-2">
                              <Badge color="purple" size="sm">
                                {mod.nome}
                              </Badge>
                              {mod.incrementoEspacos !== 0 && (
                                <span className="text-xs text-app-muted">
                                  {formatarIncrementoEspacos(mod.incrementoEspacos)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.notas && (
                      <div className="mt-3 p-2 bg-app-muted-surface rounded text-sm text-app-muted">
                        <Icon name="info" className="w-4 h-4 inline mr-1" />
                        <strong className="text-app-fg">Notas:</strong> {item.notas}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
