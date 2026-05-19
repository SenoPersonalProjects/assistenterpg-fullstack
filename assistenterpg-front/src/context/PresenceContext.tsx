'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  conectarSocketPresenca,
  type EventoPresencaAmigos,
} from '@/lib/realtime/presenca-socket';

type PresenceContextType = {
  onlineFriendIds: Set<number>;
  synced: boolean;
  isFriendOnline: (usuarioId: number) => boolean;
};

const PresenceContext = createContext<PresenceContextType | undefined>(
  undefined,
);

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { usuario } = useAuth();
  const [snapshot, setSnapshot] = useState<{
    usuarioId: number | null;
    onlineIds: number[];
    synced: boolean;
  }>({
    usuarioId: null,
    onlineIds: [],
    synced: false,
  });

  useEffect(() => {
    if (!usuario) {
      return;
    }

    const socket = conectarSocketPresenca();
    const usuarioId = usuario.id;

    const handlePresenca = (evento: EventoPresencaAmigos) => {
      setSnapshot({
        usuarioId,
        onlineIds: Array.isArray(evento.onlineUsuarioIds)
          ? evento.onlineUsuarioIds
          : [],
        synced: true,
      });
    };

    const handleConnect = () => {
      socket.emit('presenca:sync');
    };

    socket.on('connect', handleConnect);
    socket.on('presenca:amigos', handlePresenca);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('presenca:amigos', handlePresenca);
      socket.disconnect();
    };
  }, [usuario]);

  const value = useMemo<PresenceContextType>(() => {
    const snapshotValido = snapshot.usuarioId === usuario?.id;
    const onlineFriendIds = new Set(
      snapshotValido ? snapshot.onlineIds : [],
    );
    return {
      onlineFriendIds,
      synced: snapshotValido && snapshot.synced,
      isFriendOnline: (usuarioId: number) => onlineFriendIds.has(usuarioId),
    };
  }, [snapshot, usuario?.id]);

  return (
    <PresenceContext.Provider value={value}>
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const ctx = useContext(PresenceContext);
  if (!ctx) {
    throw new Error('usePresence deve ser usado dentro de PresenceProvider');
  }
  return ctx;
}
