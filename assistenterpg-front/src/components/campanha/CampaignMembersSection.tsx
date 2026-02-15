'use client';

import { Card } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Badge } from '@/components/ui/Badge';

type Membro = {
  id: number;
  papel: string;
  usuarioId: number;
  usuario: { id: number; apelido: string };
};

type Props = {
  membros: Membro[];
  donoId: number;
};

export function CampaignMembersSection({ membros, donoId }: Props) {
  return (
    <section>
      <SectionTitle>Membros</SectionTitle>
      <Card>
        {membros.length === 0 ? (
          <p className="text-sm text-app-muted">
            Nenhum membro cadastrado ainda.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {membros.map((m) => {
              const isOwner = m.usuarioId === donoId;
              const papel = isOwner ? 'MESTRE' : m.papel;
              const corPapel =
                papel === 'MESTRE'
                  ? 'purple'
                  : papel === 'JOGADOR'
                  ? 'blue'
                  : 'gray';

              return (
                <li
                  key={m.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-app-fg">{m.usuario.apelido}</span>
                    {isOwner && (
                      <span className="text-xs text-app-muted">
                        Dono da campanha
                      </span>
                    )}
                  </div>
                  <Badge color={corPapel}>{papel}</Badge>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </section>
  );
}
