import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';

type SessionAccessNoticeProps = {
  papel: string | undefined;
  sessaoEncerrada: boolean;
  elencoControladoPeloMestre: boolean;
  personagem: { nome: string; delegado: boolean } | null;
  npcsControlados: string[];
};

function rotuloPapel(papel: string | undefined): string {
  if (papel === 'OBSERVADOR') return 'Observador';
  if (papel === 'MESTRE') return 'Mestre';
  return 'Jogador';
}

export function SessionAccessNotice({
  papel,
  sessaoEncerrada,
  elencoControladoPeloMestre,
  personagem,
  npcsControlados,
}: SessionAccessNoticeProps) {
  const observador = papel === 'OBSERVADOR';
  const possuiControleDelegado = personagem?.delegado || npcsControlados.length > 0;
  const participantesControlados = [
    ...(personagem ? [personagem.nome] : []),
    ...npcsControlados,
  ];

  const mensagem = sessaoEncerrada
    ? 'A sessão foi encerrada. A ficha e o histórico permanecem disponíveis apenas para consulta.'
    : observador
      ? 'Você está observando esta cena. Recursos, ações e alterações estruturais ficam disponíveis somente ao mestre ou ao controlador delegado.'
      : possuiControleDelegado
        ? 'Você pode operar recursos atuais, habilidades, ações e rolagens dos participantes indicados. O mestre mantém a edição estrutural, condições e composição da cena.'
        : elencoControladoPeloMestre
          ? 'Esta sessão usa elenco do mestre. Aguarde uma delegação para operar um personagem ou NPC na cena.'
          : 'Associe ou adicione seu personagem à cena para operar recursos, habilidades e rolagens.';

  return (
    <section className="rounded-xl border border-app-primary/25 bg-app-primary/5 px-3 py-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-app-primary/15 text-app-primary">
          <Icon name={observador ? 'eye' : 'id'} className="h-4 w-4" />
        </span>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-app-fg">Seu acesso nesta sessão</p>
            <Badge color={observador ? 'gray' : sessaoEncerrada ? 'yellow' : 'blue'} size="sm">
              {sessaoEncerrada ? 'Modo leitura' : rotuloPapel(papel)}
            </Badge>
            {elencoControladoPeloMestre ? (
              <Badge color="purple" size="sm">Elenco do mestre</Badge>
            ) : null}
          </div>
          <p className="text-xs leading-relaxed text-app-muted">{mensagem}</p>
          {participantesControlados.length > 0 && !observador ? (
            <div className="flex flex-wrap gap-1.5">
              {participantesControlados.map((nome) => (
                <Badge key={nome} color="green" size="sm">
                  Controla: {nome}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
