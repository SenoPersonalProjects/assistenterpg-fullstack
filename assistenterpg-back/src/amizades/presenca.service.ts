import { Injectable } from '@nestjs/common';

type RemocaoPresenca = {
  usuarioId: number | null;
  mudouStatus: boolean;
};

@Injectable()
export class PresencaService {
  private readonly conexoesPorUsuario = new Map<number, Set<string>>();
  private readonly usuarioPorSocket = new Map<string, number>();

  registrarConexao(usuarioId: number, socketId: string): boolean {
    const conexoes =
      this.conexoesPorUsuario.get(usuarioId) ?? new Set<string>();
    const estavaOffline = conexoes.size === 0;

    conexoes.add(socketId);
    this.conexoesPorUsuario.set(usuarioId, conexoes);
    this.usuarioPorSocket.set(socketId, usuarioId);

    return estavaOffline;
  }

  removerConexao(socketId: string): RemocaoPresenca {
    const usuarioId = this.usuarioPorSocket.get(socketId) ?? null;
    if (!usuarioId) {
      return { usuarioId: null, mudouStatus: false };
    }

    this.usuarioPorSocket.delete(socketId);
    const conexoes = this.conexoesPorUsuario.get(usuarioId);
    if (!conexoes) {
      return { usuarioId, mudouStatus: false };
    }

    conexoes.delete(socketId);
    if (conexoes.size > 0) {
      return { usuarioId, mudouStatus: false };
    }

    this.conexoesPorUsuario.delete(usuarioId);
    return { usuarioId, mudouStatus: true };
  }

  estaOnline(usuarioId: number): boolean {
    return (this.conexoesPorUsuario.get(usuarioId)?.size ?? 0) > 0;
  }

  filtrarOnline(usuarioIds: number[]): number[] {
    return usuarioIds
      .filter((usuarioId) => this.estaOnline(usuarioId))
      .sort((a, b) => a - b);
  }
}
