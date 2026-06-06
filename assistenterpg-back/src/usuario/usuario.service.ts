import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AtualizarPreferenciasDto } from './dto/atualizar-preferencias.dto';
import {
  UsuarioNaoEncontradoException,
  UsuarioEmailNaoEncontradoException,
  UsuarioApelidoNaoEncontradoException,
} from 'src/common/exceptions/usuario.exception';
import { handlePrismaError } from 'src/common/exceptions/database.exception';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  private tratarErroPrisma(error: unknown): void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      handlePrismaError(error);
    }
  }

  async buscarPorEmail(email: string) {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { email },
        select: {
          id: true,
          apelido: true,
          email: true,
          senhaHash: true,
          role: true,
          status: true,
          emailVerificadoEm: true,
          criadoEm: true,
          atualizadoEm: true,
        },
      });

      if (!usuario) {
        throw new UsuarioEmailNaoEncontradoException(email);
      }

      return usuario;
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async buscarPorEmailOpcional(email: string) {
    try {
      return await this.prisma.usuario.findUnique({
        where: { email },
        select: {
          id: true,
          apelido: true,
          email: true,
          senhaHash: true,
          role: true,
          status: true,
          emailVerificadoEm: true,
          criadoEm: true,
          atualizadoEm: true,
        },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async buscarPorId(id: number) {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id },
        select: {
          id: true,
          apelido: true,
          email: true,
          role: true,
          status: true,
          senhaHash: true,
          emailVerificadoEm: true,
          criadoEm: true,
          atualizadoEm: true,
        },
      });

      if (!usuario) {
        throw new UsuarioNaoEncontradoException(id);
      }

      return usuario;
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async buscarPorApelido(apelido: string) {
    try {
      const usuario = await this.prisma.usuario.findFirst({
        where: { apelido },
        select: {
          id: true,
          apelido: true,
          email: true,
          role: true,
          status: true,
          emailVerificadoEm: true,
          criadoEm: true,
        },
      });

      if (!usuario) {
        throw new UsuarioApelidoNaoEncontradoException(apelido);
      }

      return usuario;
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async obterEstatisticas(usuarioId: number) {
    try {
      const [totalCampanhas, totalPersonagens] = await Promise.all([
        this.prisma.campanha.count({
          where: {
            OR: [{ donoId: usuarioId }, { membros: { some: { usuarioId } } }],
          },
        }),
        this.prisma.personagemBase.count({
          where: { donoId: usuarioId },
        }),
      ]);

      return {
        campanhas: totalCampanhas,
        personagens: totalPersonagens,
        artigosLidos: 0,
      };
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async obterPreferencias(usuarioId: number) {
    try {
      let preferencias = await this.prisma.preferenciaUsuario.findUnique({
        where: { usuarioId },
      });

      if (!preferencias) {
        preferencias = await this.prisma.preferenciaUsuario.create({
          data: { usuarioId },
        });
      }

      return preferencias;
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async atualizarPreferencias(
    usuarioId: number,
    dto: AtualizarPreferenciasDto,
  ) {
    try {
      return this.prisma.preferenciaUsuario.upsert({
        where: { usuarioId },
        update: dto,
        create: { usuarioId, ...dto },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async exportarDados(usuarioId: number) {
    try {
      const [usuario, personagens, campanhas, preferencias] = await Promise.all(
        [
          this.prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: {
              id: true,
              apelido: true,
              email: true,
              role: true,
              emailVerificadoEm: true,
              criadoEm: true,
            },
          }),
          this.prisma.personagemBase.findMany({
            where: { donoId: usuarioId },
            include: {
              classe: true,
              origem: true,
              cla: true,
              trilha: true,
              caminho: true,
              tecnicaInata: true,
            },
          }),
          this.prisma.campanha.findMany({
            where: {
              OR: [{ donoId: usuarioId }, { membros: { some: { usuarioId } } }],
            },
            include: {
              membros: {
                include: {
                  usuario: { select: { apelido: true } },
                },
              },
            },
          }),
          this.prisma.preferenciaUsuario.findUnique({
            where: { usuarioId },
          }),
        ],
      );

      return {
        exportadoEm: new Date().toISOString(),
        usuario,
        personagens,
        campanhas,
        preferencias,
      };
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }
}
