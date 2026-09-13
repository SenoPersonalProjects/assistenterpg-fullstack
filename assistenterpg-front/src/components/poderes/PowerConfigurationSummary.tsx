import { Badge } from '@/components/ui/Badge';

type PoderConfig = Record<string, unknown>;

type Reference = {
  id: number;
  nome: string;
};

type Props = {
  config?: PoderConfig | null;
  periciasMap?: Map<string, { nome: string }>;
  tiposGrauMap?: Map<string, string>;
  habilidadesTecnica?: Reference[];
  vinculados?: Reference[];
  className?: string;
};

const CONFIG_LABELS: Record<string, string> = {
  habilidadeTecnicaId: 'Habilidade escolhida',
  periciasCodigos: 'Perícias escolhidas',
  shikigamiId: 'Shikigami favorito',
  tipoGrauCodigo: 'Tipo de grau escolhido',
  valor: 'Escolha',
};

function formatarChave(chave: string) {
  return CONFIG_LABELS[chave] ?? chave
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (letra) => letra.toUpperCase());
}

function formatarValor(valor: unknown): string | null {
  if (typeof valor === 'string' || typeof valor === 'number') {
    return String(valor).trim() || null;
  }

  if (typeof valor === 'boolean') {
    return valor ? 'Sim' : 'Não';
  }

  if (Array.isArray(valor)) {
    const itens = valor
      .map((item) => formatarValor(item))
      .filter((item): item is string => Boolean(item));
    return itens.length > 0 ? itens.join(', ') : null;
  }

  return valor && typeof valor === 'object' ? 'Configurado' : null;
}

export function PowerConfigurationSummary({
  config,
  periciasMap,
  tiposGrauMap,
  habilidadesTecnica = [],
  vinculados = [],
  className,
}: Props) {
  if (!config || Object.keys(config).length === 0) {
    return null;
  }

  const referenciasHabilidade = new Map(habilidadesTecnica.map((item) => [item.id, item.nome]));
  const referenciasVinculado = new Map(vinculados.map((item) => [item.id, item.nome]));
  const itens = Object.entries(config).flatMap(([chave, valor]) => {
    if (chave === 'periciasCodigos' && Array.isArray(valor)) {
      const pericias = valor
        .filter((codigo): codigo is string => typeof codigo === 'string' && codigo.trim().length > 0)
        .map((codigo) => periciasMap?.get(codigo)?.nome ?? codigo);
      return pericias.length > 0 ? [{ chave, valor: pericias.join(', ') }] : [];
    }

    if (chave === 'tipoGrauCodigo' && typeof valor === 'string') {
      return [{ chave, valor: tiposGrauMap?.get(valor) ?? valor }];
    }

    if (chave === 'habilidadeTecnicaId') {
      const id = Number(valor);
      return Number.isInteger(id) && id > 0
        ? [{ chave, valor: referenciasHabilidade.get(id) ?? 'Habilidade configurada' }]
        : [];
    }

    if (chave === 'shikigamiId') {
      const id = Number(valor);
      return Number.isInteger(id) && id > 0
        ? [{ chave, valor: referenciasVinculado.get(id) ?? 'Shikigami configurado' }]
        : [];
    }

    const valorFormatado = formatarValor(valor);
    return valorFormatado ? [{ chave, valor: valorFormatado }] : [];
  });

  if (itens.length === 0) {
    return null;
  }

  return (
    <div className={className ?? 'mt-2 space-y-1.5'}>
      <p className="text-xs font-medium text-app-muted">Configuração</p>
      <div className="flex flex-wrap gap-1.5">
        {itens.map((item) => (
          <Badge key={item.chave} color="blue" size="sm">
            {formatarChave(item.chave)}: {item.valor}
          </Badge>
        ))}
      </div>
    </div>
  );
}
