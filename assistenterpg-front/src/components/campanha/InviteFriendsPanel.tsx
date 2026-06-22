'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  apiCriarConvite,
  apiListarAmigosConvidaveisCampanha,
  criarErroUsuario,
} from '@/lib/api';
import type { AmigoConvidavelCampanha , UserErrorState } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { Icon } from '@/components/ui/Icon';
import { Select } from '@/components/ui/Select';

type PapelCampanha = 'MESTRE' | 'JOGADOR' | 'OBSERVADOR';

type Props = {
  campanhaId: number;
  onInvite?: () => void;
};

const PAPEL_OPTIONS = [
  { value: 'JOGADOR', label: 'Jogador' },
  { value: 'OBSERVADOR', label: 'Observador' },
  { value: 'MESTRE', label: 'Mestre' },
];

export function InviteFriendsPanel({ campanhaId, onInvite }: Props) {
  const [amigos, setAmigos] = useState<AmigoConvidavelCampanha[]>([]);
  const [papel, setPapel] = useState<PapelCampanha>('JOGADOR');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<UserErrorState | null>(null);
  const [usuarioEmAcao, setUsuarioEmAcao] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const data = await apiListarAmigosConvidaveisCampanha(campanhaId);
      setAmigos(data);
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setLoading(false);
    }
  }, [campanhaId]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function convidar(amigo: AmigoConvidavelCampanha) {
    setUsuarioEmAcao(amigo.id);
    setErro(null);
    try {
      await apiCriarConvite(campanhaId, {
        usuarioId: amigo.id,
        papel,
      });
      onInvite?.();
      await carregar();
    } catch (error) {
      setErro(criarErroUsuario(error));
    } finally {
      setUsuarioEmAcao(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-app-muted">Carregando amigos...</p>;
  }

  if (erro) {
    return <ErrorAlert message={erro} />;
  }

  if (amigos.length === 0) {
    return (
      <EmptyState
        variant="plain"
        size="sm"
        icon="characters"
        description="Você ainda não tem amigos para convidar."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Select
        label="Papel dos convites"
        value={papel}
        options={PAPEL_OPTIONS}
        onChange={(event) => setPapel(event.target.value as PapelCampanha)}
      />

      <div className="space-y-2">
        {amigos.map((amigo) => {
          const bloqueado = amigo.jaMembro || amigo.convitePendente;
          const textoBotao = amigo.jaMembro
            ? 'Já participa'
            : amigo.convitePendente
              ? 'Convite pendente'
              : 'Convidar';

          return (
            <div
              key={amigo.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-app-border bg-app-bg/40 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-app-fg">
                  {amigo.apelido}
                </p>
                <Badge color={amigo.online ? 'green' : 'gray'} size="sm">
                  {amigo.online ? 'Online' : 'Offline'}
                </Badge>
              </div>

              <Button
                type="button"
                size="sm"
                variant={bloqueado ? 'secondary' : 'primary'}
                disabled={bloqueado || usuarioEmAcao === amigo.id}
                onClick={() => convidar(amigo)}
              >
                {!bloqueado && <Icon name="add" className="mr-2 h-4 w-4" />}
                {usuarioEmAcao === amigo.id ? 'Enviando...' : textoBotao}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
