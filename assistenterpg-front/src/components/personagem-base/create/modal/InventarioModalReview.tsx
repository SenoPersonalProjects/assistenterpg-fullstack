// personagem-base/create/modal/InventarioModalReview.tsx - ✅ CORRIGIDO COMPLETO

'use client';

import { useMemo } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { InventarioValidacaoFeedback } from '../InventarioValidacaoFeedback';
import {
  getIconeTipo,
  formatarPercentualCarga,
  getCorBarraProgresso,
  calcularEspacosExtraDeItens,
  validarCategoriaNaoExcedeEspecial,
  validarPodeVestir,
  podeSerVestido,
  LIMITES_VESTIR,
  SUBTIPO_VESTIMENTA,
  type ItemInventarioParaVestir,
} from '@/lib/utils/inventario';
import type {
  EquipamentoCatalogo,
  ModificacaoCatalogo,
  PreviewAdicionarItemResponse,
  ItemInventarioPayload, // ✅ MUDOU: ItemInventarioDto → ItemInventarioPayload
} from '@/lib/api';

type Props = {
  equipamento: EquipamentoCatalogo;
  modificacoesSelecionadas: ModificacaoCatalogo[];
  quantidade: number;
  equipado: boolean;
  ignorarLimites: boolean;
  nomeCustomizado: string;
  preview: PreviewAdicionarItemResponse | null;
  carregandoPreview: boolean;
  erroValidacao: string | null;
  espacosOcupados: number;
  espacosTotal: number;
  equipamentos: EquipamentoCatalogo[];
  itensInventario: ItemInventarioPayload[]; // ✅ MUDOU: ItemInventarioDto[] → ItemInventarioPayload[]
  onQuantidadeChange: (qtd: number) => void;
  onEquipadoChange: (equipado: boolean) => void;
  onIgnorarLimitesChange: (ignorar: boolean) => void;
  onNomeCustomizadoChange: (nome: string) => void;
};

export function InventarioModalReview({
  equipamento,
  modificacoesSelecionadas,
  quantidade,
  equipado,
  ignorarLimites,
  nomeCustomizado,
  preview,
  carregandoPreview,
  erroValidacao,
  espacosOcupados,
  espacosTotal,
  equipamentos,
  itensInventario,
  onQuantidadeChange,
  onEquipadoChange,
  onIgnorarLimitesChange,
  onNomeCustomizadoChange,
}: Props) {
  // ✅ Verificar se equipamento pode ser vestido (considera tipoUso)
  const podeVestir = useMemo(() => podeSerVestido(equipamento), [equipamento]);

  // ✅ Validações complexas executadas a cada mudança
  const validacoes = useMemo(() => {
    const erros: string[] = [];
    const avisos: string[] = [];

    // 1. Validar categoria não excede ESPECIAL
    if (modificacoesSelecionadas.length > 0) {
      const validacaoCategoria = validarCategoriaNaoExcedeEspecial(
        equipamento.categoria,
        modificacoesSelecionadas,
      );

      if (!validacaoCategoria.valido) {
        erros.push(validacaoCategoria.erro || 'Categoria inválida');
      }
    }

    // 2. Validar limites de vestido (se equipado E se pode vestir)
    if (equipado && podeVestir) {
      // ✅ CORRIGIDO: Converter ItemInventarioPayload[] para formato esperado
      const itensConvertidos = itensInventario
        .map((item): ItemInventarioParaVestir => {
          const equip = equipamentos.find((e) => e.id === item.equipamentoId);
          return {
            equipamentoId: item.equipamentoId,
            quantidade: item.quantidade,
            equipado: item.equipado,
            equipamento: equip
              ? {
                  id: equip.id,
                  codigo: equip.codigo,
                  nome: equip.nome,
                  tipo: equip.tipo,
                  categoria: equip.categoria,
                  espacos: equip.espacos,
                  descricao: equip.descricao || null,
                  complexidadeMaldicao: equip.complexidadeMaldicao || 'NENHUMA',
                }
              : undefined,
          };
        });

      const validacaoVestir = validarPodeVestir(
        equipamento,
        quantidade,
        itensConvertidos,
        equipamentos,
      );

      if (!validacaoVestir.valido) {
        erros.push(...validacaoVestir.erros);
      }
    }

    return { erros, avisos };
  }, [
    equipamento,
    modificacoesSelecionadas,
    equipado,
    quantidade,
    itensInventario,
    equipamentos,
    podeVestir,
  ]);

  // ✅ Calcular totais de vestir (para indicador visual)
  const totaisVestir = useMemo(() => {
    if (!equipado || !podeVestir) {
      return null;
    }

    // ✅ CORRIGIDO: Contar manualmente sem usar contarItensVestiveis
    let vestiveisAtual = 0;
    let vestimentasAtual = 0;

    itensInventario
      .filter((item) => item.equipado)
      .forEach((item) => {
        const equip = equipamentos.find((e) => e.id === item.equipamentoId);
        if (!equip) return;

        if (!podeSerVestido(equip)) return;

        vestiveisAtual += item.quantidade;

        const tipoAcessorio = equip.tipoAcessorio;
        if (equip.tipo === 'ACESSORIO' && tipoAcessorio === SUBTIPO_VESTIMENTA) {
          vestimentasAtual += item.quantidade;
        }
      });

    const ehVestimenta =
      equipamento.tipo === 'ACESSORIO' && equipamento.tipoAcessorio === SUBTIPO_VESTIMENTA;

    return {
      vestiveisAtual,
      vestimentasAtual,
      vestiveisNovo: vestiveisAtual + quantidade,
      vestimentasNovo: vestimentasAtual + (ehVestimenta ? quantidade : 0),
    };
  }, [equipado, equipamento, quantidade, itensInventario, equipamentos, podeVestir]);

  if (carregandoPreview) {
    return (
      <div className="text-center py-8">
        <Icon name="spinner" className="w-6 h-6 mx-auto mb-2 text-app-muted animate-spin" />
        <p className="text-app-muted">Validando adição...</p>
      </div>
    );
  }

  const espacosExtraItem = calcularEspacosExtraDeItens(
    [{ equipamentoId: equipamento.id, quantidade: 1 }],
    equipamentos,
  );

  return (
    <div className="space-y-4">
      {/* Card do equipamento */}
      <div className="p-4 bg-app-primary/10 rounded-lg border border-app-primary/30">
        <div className="flex items-start gap-3">
          <Icon name={getIconeTipo(equipamento.tipo)} className="w-8 h-8 text-app-primary mt-1" />
          <div className="flex-1">
            <p className="font-bold text-app-fg">{equipamento.nome}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge color="purple" size="sm">
                {equipamento.tipo}
              </Badge>
              <Badge color="blue" size="sm">
                <Icon name="briefcase" className="w-3 h-3 inline mr-1" />
                {equipamento.espacos} esp./un
              </Badge>
              {modificacoesSelecionadas.length > 0 && (
                <Badge color="purple" size="sm">
                  <Icon name="sparkles" className="w-3 h-3 inline mr-1" />
                  {modificacoesSelecionadas.length} mod(s)
                </Badge>
              )}
              {espacosExtraItem > 0 && (
                <Badge color="green" size="sm">
                  <Icon name="add" className="w-3 h-3 inline mr-1" />
                  +{espacosExtraItem * quantidade} espaços extras
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Feedbacks de validação (ANTES dos campos) */}
      {validacoes.erros.length > 0 && (
        <InventarioValidacaoFeedback
          tipo="erro"
          titulo="❌ Não é possível adicionar este item"
          mensagens={validacoes.erros}
        />
      )}

      {validacoes.avisos.length > 0 && (
        <InventarioValidacaoFeedback
          tipo="aviso"
          titulo="⚠️ Atenção"
          mensagens={validacoes.avisos}
        />
      )}

      <div className="space-y-3">
        {/* Campo de nome personalizado */}
        <div>
          <label className="block text-sm font-semibold text-app-fg mb-2 flex items-center gap-2">
            <Icon name="edit" className="w-4 h-4" />
            Nome personalizado (opcional)
          </label>
          <Input
            type="text"
            placeholder={equipamento.nome}
            value={nomeCustomizado}
            onChange={(e) => onNomeCustomizadoChange(e.target.value)}
            maxLength={100}
          />
          <p className="text-xs text-app-muted mt-1 flex items-center gap-1">
            <Icon name="info" className="w-3 h-3" />
            Deixe vazio para usar o nome padrão. Ex: &quot;Katana +1&quot;, &quot;Mochila do João&quot;
          </p>
        </div>

        {/* Campo de quantidade com botões */}
        <div>
          <label className="block text-sm font-semibold text-app-fg mb-2">Quantidade</label>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onQuantidadeChange(Math.max(1, quantidade - 1))}
              variant="secondary"
              size="md"
              disabled={quantidade <= 1}
              className="flex-shrink-0"
            >
              <Icon name="minus" className="w-4 h-4" />
            </Button>
            <Input
              type="number"
              min="1"
              max="999"
              value={quantidade}
              onChange={(e) => onQuantidadeChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="text-center font-semibold"
            />
            <Button
              onClick={() => onQuantidadeChange(quantidade + 1)}
              variant="secondary"
              size="md"
              disabled={quantidade >= 999}
              className="flex-shrink-0"
            >
              <Icon name="add" className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-app-muted mt-1">
            Espaços totais: {equipamento.espacos * quantidade} ({equipamento.espacos} × {quantidade}
            )
          </p>
        </div>

        {/* ✅ Checkbox "Vestir agora" - Só exibe se podeVestir */}
        {podeVestir && (
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox checked={equipado} onChange={(e) => onEquipadoChange(e.target.checked)} />
            <span className="text-sm text-app-fg">Vestir agora</span>
            <Icon name="shield" className="w-4 h-4 text-app-primary" />
          </label>
        )}

        {/* ✅ Checkbox "Ignorar limites" */}
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={ignorarLimites}
            onChange={(e) => onIgnorarLimitesChange(e.target.checked)}
          />
          <span className="text-sm text-app-fg">Ignorar limites de grau</span>
          <Icon name="warning" className="w-4 h-4 text-app-warning" />
        </label>
      </div>

      {/* ✅ Indicador de limites vestidos (MELHORADO) */}
      {equipado && totaisVestir && (
        <div
          className={`p-3 rounded-lg border ${
            totaisVestir.vestiveisNovo > LIMITES_VESTIR.MAX_VESTIVEIS ||
            totaisVestir.vestimentasNovo > LIMITES_VESTIR.MAX_VESTIMENTAS
              ? 'bg-app-danger/10 border-app-danger/30'
              : 'bg-app-info/10 border-app-info/30'
          }`}
        >
          <p className="text-xs font-semibold text-app-fg mb-2 flex items-center gap-1">
            <Icon name="shield" className="w-4 h-4" />
            Limites de Itens Vestidos
          </p>
          <div className="space-y-1 text-xs">
            {/* Limite geral */}
            <div className="flex items-center justify-between">
              <span className="text-app-muted">🛡️ Itens vestidos:</span>
              <span
                className={`font-semibold ${
                  totaisVestir.vestiveisNovo > LIMITES_VESTIR.MAX_VESTIVEIS
                    ? 'text-app-danger'
                    : 'text-app-fg'
                }`}
              >
                {totaisVestir.vestiveisAtual} → {totaisVestir.vestiveisNovo} /{' '}
                {LIMITES_VESTIR.MAX_VESTIVEIS}
              </span>
            </div>

            {/* Limite de vestimentas (se aplicável) */}
            {equipamento.tipo === 'ACESSORIO' &&
              equipamento.tipoAcessorio === SUBTIPO_VESTIMENTA && (
                <div className="flex items-center justify-between">
                  <span className="text-app-muted">👔 Vestimentas:</span>
                  <span
                    className={`font-semibold ${
                      totaisVestir.vestimentasNovo > LIMITES_VESTIR.MAX_VESTIMENTAS
                        ? 'text-app-danger'
                        : 'text-app-fg'
                    }`}
                  >
                    {totaisVestir.vestimentasAtual} → {totaisVestir.vestimentasNovo} /{' '}
                    {LIMITES_VESTIR.MAX_VESTIMENTAS}
                  </span>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Preview de impacto */}
      {preview && (
        <div className="p-3 rounded-lg border border-app-border bg-app-surface">
          <p className="text-xs font-semibold text-app-muted mb-2 flex items-center gap-1">
            <Icon name="briefcase" className="w-3 h-3" />
            Impacto no Inventário
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-app-muted">Espaços ocupados</p>
              <p className="text-app-fg font-semibold">
                {espacosOcupados} → {preview.espacos.espacosOcupados}
              </p>
            </div>
            <div>
              <p className="text-app-muted">Espaços totais</p>
              <p className="text-app-fg font-semibold">
                {espacosTotal} → {preview.espacos.espacosTotal}
                {preview.espacos.espacosTotal > espacosTotal && (
                  <span className="text-app-success ml-1">
                    (+{preview.espacos.espacosTotal - espacosTotal})
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-app-border rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  preview.espacos.sobrecarregado
                    ? 'bg-app-danger'
                    : getCorBarraProgresso(
                        formatarPercentualCarga(
                          preview.espacos.espacosOcupados,
                          preview.espacos.espacosTotal,
                        ),
                      )
                }`}
                style={{
                  width: `${Math.min(
                    formatarPercentualCarga(
                      preview.espacos.espacosOcupados,
                      preview.espacos.espacosTotal,
                    ),
                    100,
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Alertas de validação do preview */}
      {preview && !preview.grauXama.valido && !ignorarLimites && (
        <Alert variant="warning">
          <div className="text-xs">
            <Icon name="warning" className="w-4 h-4 inline mr-2" />
            <strong>Atenção!</strong> Este item excede os limites de grau xamã.
            <ul className="list-disc list-inside mt-2 space-y-1">
              {preview.grauXama.erros.map((erro, idx) => (
                <li key={idx}>{erro}</li>
              ))}
            </ul>
          </div>
        </Alert>
      )}

      {preview && preview.espacos.sobrecarregado && (
        <Alert variant="warning">
          <div className="text-xs">
            <strong>Sobrecarga!</strong> Este item fará você exceder a capacidade normal.
            <p className="mt-1 text-app-muted">
              Você estará carregando {preview.espacos.espacosOcupados}/{preview.espacos.espacosTotal}{' '}
              espaços.
              {preview.espacos.espacosOcupados > preview.espacos.espacosTotal * 2 && (
                <span className="text-app-danger font-semibold"> Sobrecarga severa (&gt;2x)!</span>
              )}
            </p>
          </div>
        </Alert>
      )}

      {erroValidacao && (
        <Alert variant="error">
          <div className="flex items-start gap-2 text-xs">
            <Icon name="fail" className="w-4 h-4 mt-0.5" />
            <span className="whitespace-pre-line">{erroValidacao}</span>
          </div>
        </Alert>
      )}
    </div>
  );
}

