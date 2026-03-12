import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AtualizarPreferenciasDto } from './dto/atualizar-preferencias.dto';
import { AlterarSenhaDto } from './dto/alterar-senha.dto';
import {
  UsuarioNaoEncontradoException,
  UsuarioEmailDuplicadoException,
  UsuarioSenhaIncorretaException,
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

  async criarUsuario(apelido: string, email: string, senha: string) {
    try {
      const existente = await this.prisma.usuario.findUnique({
        where: { email },
      });

      if (existente) {
        throw new UsuarioEmailDuplicadoException(email);
      }

      const senhaHash = await bcrypt.hash(senha, 10);

      return this.prisma.usuario.create({
        data: {
          apelido,
          email,
          senhaHash,
        },
        select: {
          id: true,
          apelido: true,
          email: true,
          role: true,
          emailVerificadoEm: true,
          criadoEm: true,
        },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
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

  async alterarSenha(usuarioId: number, dto: AlterarSenhaDto) {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioId },
      });

      if (!usuario) {
        throw new UsuarioNaoEncontradoException(usuarioId);
      }

      const senhaValida = await bcrypt.compare(
        dto.senhaAtual,
        usuario.senhaHash,
      );

      if (!senhaValida) {
        throw new UsuarioSenhaIncorretaException('alteracao');
      }

      const novaSenhaHash = await bcrypt.hash(dto.novaSenha, 10);

      await this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { senhaHash: novaSenhaHash },
      });

      return { mensagem: 'Senha alterada com sucesso' };
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async atualizarSenhaHash(usuarioId: number, senhaHash: string) {
    try {
      await this.prisma.usuario.update({
        where: { id: usuarioId },
        data: { senhaHash },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async marcarEmailComoVerificado(usuarioId: number) {
    try {
      return await this.prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          emailVerificadoEm: new Date(),
        },
        select: {
          id: true,
          email: true,
          emailVerificadoEm: true,
        },
      });
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }

  async exportarDados(usuarioId: number) {
    try {
      const [usuario, personagens, campanhas, preferencias] = await Promise.all([
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
      ]);

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

  async excluirConta(usuarioId: number, senha: string) {
    try {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioId },
      });

      if (!usuario) {
        throw new UsuarioNaoEncontradoException(usuarioId);
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);

      if (!senhaValida) {
        throw new UsuarioSenhaIncorretaException('exclusao');
      }

      await this.prisma.usuario.delete({
        where: { id: usuarioId },
      });

      return { mensagem: 'Conta excluida com sucesso' };
    } catch (error: unknown) {
      this.tratarErroPrisma(error);
      throw error;
    }
  }
}
