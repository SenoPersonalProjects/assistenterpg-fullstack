// personagem-base/create/modal/InventarioModalModificacoes.tsx - COM DESCRIÇÃO EXPANSÍVEL

'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { validarCategoriaNaoExcedeEspecial } from '@/lib/utils/inventario';
import type { EquipamentoCatalogo, ModificacaoCatalogo } from '@/lib/api';

type Props = {
  equipamento: EquipamentoCatalogo;
  modificacoesCompativeis: ModificacaoCatalogo[];
  modificacoesSelecionadas: ModificacaoCatalogo[];
  onToggleModificacao: (mod: ModificacaoCatalogo, checked: boolean) => void;
};

export function InventarioModalModificacoes({
  equipamento,
  modificacoesCompativeis,
  modificacoesSelecionadas,
  onToggleModificacao,
}: Props) {
  // ✅ NOVO: Estado para controlar qual modificação está expandida
  const [modExpandida, setModExpandida] = useState<number | null>(null);

  const toggleExpandir = (modId: number) => {
    setModExpandida(modExpandida === modId ? null : modId);
  };

  // Validar cada modificação
  const modificacoesComValidacao = useMemo(() => {
    return modificacoesCompativeis.map((mod) => {
      const selecionada = modificacoesSelecionadas.some((m) => m.id === mod.id);

      if (selecionada) {
        return { mod, valida: true, erro: null };
      }

      const validacao = validarCategoriaNaoExcedeEspecial(equipamento.categoria, [
        ...modificacoesSelecionadas,
        mod,
      ]);

      return {
        mod,
        valida: validacao.valido,
        erro: validacao.erro || null,
      };
    });
  }, [equipamento, modificacoesCompativeis, modificacoesSelecionadas]);

  const handleToggle = (mod: ModificacaoCatalogo, checked: boolean) => {
    if (checked) {
      const validacao = validarCategoriaNaoExcedeEspecial(equipamento.categoria, [
        ...modificacoesSelecionadas,
        mod,
      ]);

      if (!validacao.valido) {
        alert(validacao.erro);
        return;
      }
    }

    onToggleModificacao(mod, checked);
  };

  if (modificacoesCompativeis.length === 0) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-app-primary/10 rounded-lg border border-app-primary/30">
          <div className="flex items-center gap-2 text-app-fg">
            <Icon name="info" className="w-5 h-5 text-app-primary" />
            <p className="text-sm font-semibold">Nenhuma modificação compatível com este equipamento</p>
          </div>
        </div>
        <p className="text-xs text-app-muted text-center">
          Clique em "Continuar" para prosseguir sem modificações
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com contador */}
      <div className="flex items-center justify-between p-3 bg-app-surface rounded-lg border border-app-border">
        <div className="flex items-center gap-2">
          <Icon name="sparkles" className="w-5 h-5 text-app-primary" />
          <span className="text-sm font-semibold text-app-fg">
            Modificações Disponíveis
          </span>
        </div>
        <Badge color="blue" size="md">
          {modificacoesSelecionadas.length} selecionada(s)
        </Badge>
      </div>

      {/* Lista de modificações */}
      <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
        {modificacoesComValidacao.map(({ mod, valida, erro }) => {
          const selecionada = modificacoesSelecionadas.some((m) => m.id === mod.id);
          const desabilitada = !valida && !selecionada;
          const expandida = modExpandida === mod.id;

          return (
            <div
              key={mod.id}
              className={`rounded-lg border-2 transition-all ${
                desabilitada
                  ? 'border-app-border bg-app-surface opacity-50'
                  : selecionada
                  ? 'border-app-primary bg-app-primary/10'
                  : 'border-app-border bg-app-surface hover:border-app-primary/50 hover:bg-app-primary/5'
              }`}
            >
              {/* ✅ Header com checkbox */}
              <label
                className={`flex gap-3 p-4 ${!desabilitada ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                title={desabilitada ? erro || 'Modificação não disponível' : undefined}
              >
                <Checkbox
                  checked={selecionada}
                  onChange={(e) => handleToggle(mod, e.target.checked)}
                  disabled={desabilitada}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-app-fg flex items-center gap-2">
                        {/* ✅ REMOVIDO: Código */}
                        {mod.nome}
                        {desabilitada && (
                          <Icon name="lock" className="w-4 h-4 text-app-danger" title={erro || ''} />
                        )}
                      </p>
                    </div>
                    {mod.incrementoEspacos !== 0 && (
                      <Badge
                        color={mod.incrementoEspacos > 0 ? 'red' : 'green'}
                        size="sm"
                        className="flex-shrink-0"
                      >
                        <Icon
                          name={mod.incrementoEspacos > 0 ? 'add' : 'minus'}
                          className="w-3 h-3 inline mr-1"
                        />
                        {Math.abs(mod.incrementoEspacos)} esp.
                      </Badge>
                    )}
                  </div>

                  {/* ✅ REMOVIDO: Descrição direta (agora é expansível) */}

                  {/* Mensagem de erro se desabilitada */}
                  {desabilitada && erro && (
                    <div className="mt-2 p-2 bg-app-danger/10 rounded border border-app-danger/20">
                      <p className="text-xs text-app-danger flex items-start gap-1">
                        <Icon name="warning" className="w-3 h-3 flex-shrink-0 mt-0.5" />
                        <span>{erro}</span>
                      </p>
                    </div>
                  )}

                  {/* ✅ REMOVIDO: Badges de tipo detalhado (CORPO_A_CORPO_E_DISPARO) */}
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {mod.apenasAmaldicoadas && (
                      <Badge color="orange" size="sm">
                        <Icon name="fire" className="w-3 h-3 inline mr-1" />
                        Apenas amaldiçoadas
                      </Badge>
                    )}
                    {mod.requerComplexidade && mod.requerComplexidade !== 'NENHUMA' && (
                      <Badge color="yellow" size="sm">
                        <Icon name="sparkles" className="w-3 h-3 inline mr-1" />
                        Requer {mod.requerComplexidade.toLowerCase()}
                      </Badge>
                    )}
                  </div>
                </div>
              </label>

              {/* ✅ NOVO: Botão para expandir descrição */}
              {(mod.descricao || mod.efeitosMecanicos) && (
                <div className="px-4 pb-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpandir(mod.id);
                    }}
                    className="flex items-center gap-2 text-xs text-app-primary hover:text-app-primary/80 transition-colors"
                  >
                    <Icon
                      name={expandida ? 'chevron-up' : 'chevron-down'}
                      className="w-4 h-4"
                    />
                    <span>{expandida ? 'Ocultar detalhes' : 'Ver detalhes'}</span>
                  </button>

                  {/* ✅ Descrição + Efeitos mecânicos expansíveis */}
                  {expandida && (
                    <div className="mt-2 space-y-2">
                      {/* Descrição */}
                      {mod.descricao && (
                        <div className="p-3 bg-app-bg rounded-lg border border-app-border">
                          <p className="text-xs font-semibold text-app-fg mb-1">Descrição</p>
                          <p className="text-xs text-app-muted leading-relaxed">{mod.descricao}</p>
                        </div>
                      )}

                      {/* Efeitos mecânicos */}
                      {mod.efeitosMecanicos && (
                        <div className="p-3 bg-app-primary/5 rounded-lg border border-app-primary/20">
                          <p className="text-xs font-semibold text-app-fg mb-2 flex items-center gap-1">
                            <Icon name="sparkles" className="w-3 h-3 text-app-primary" />
                            Efeitos Mecânicos
                          </p>
                          {mod.efeitosMecanicos.descricao && (
                            <p className="text-xs text-app-muted mb-2">
                              {mod.efeitosMecanicos.descricao}
                            </p>
                          )}
                          {mod.efeitosMecanicos.restricao && (
                            <p className="text-xs text-app-warning flex items-start gap-1">
                              <Icon name="warning" className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span>{mod.efeitosMecanicos.restricao}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Nota informativa */}
      <div className="p-3 bg-app-primary/5 rounded-lg border border-app-primary/20">
        <p className="text-xs text-app-muted flex items-start gap-2">
          <Icon name="info" className="w-4 h-4 text-app-primary flex-shrink-0 mt-0.5" />
          <span>
            Modificações podem alterar espaços, categoria e propriedades do equipamento. Clique em "Ver detalhes" para mais informações.
          </span>
        </p>
      </div>
    </div>
  );
}
