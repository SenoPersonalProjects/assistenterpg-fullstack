import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AtualizarPreferenciasDto } from './dto/atualizar-preferencias.dto';
import { AlterarSenhaDto } from './dto/alterar-senha.dto';
export declare class UsuarioService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private tratarErroPrisma;
    criarUsuario(apelido: string, email: string, senha: string): Promise<{
        id: number;
        email: string;
        apelido: string;
        emailVerificadoEm: Date | null;
        role: import("@prisma/client").$Enums.RoleUsuario;
        criadoEm: Date;
    }>;
    buscarPorEmail(email: string): Promise<{
        id: number;
        email: string;
        apelido: string;
        senhaHash: string;
        emailVerificadoEm: Date | null;
        role: import("@prisma/client").$Enums.RoleUsuario;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
    buscarPorEmailOpcional(email: string): Promise<{
        id: number;
        email: string;
        apelido: string;
        senhaHash: string;
        emailVerificadoEm: Date | null;
        role: import("@prisma/client").$Enums.RoleUsuario;
        criadoEm: Date;
        atualizadoEm: Date;
    } | null>;
    buscarPorId(id: number): Promise<{
        id: number;
        email: string;
        apelido: string;
        senhaHash: string;
        emailVerificadoEm: Date | null;
        role: import("@prisma/client").$Enums.RoleUsuario;
        criadoEm: Date;
        atualizadoEm: Date;
    }>;
    buscarPorApelido(apelido: string): Promise<{
        id: number;
        email: string;
        apelido: string;
        emailVerificadoEm: Date | null;
        role: import("@prisma/client").$Enums.RoleUsuario;
        criadoEm: Date;
    }>;
    obterEstatisticas(usuarioId: number): Promise<{
        campanhas: number;
        personagens: number;
        artigosLidos: number;
    }>;
    obterPreferencias(usuarioId: number): Promise<{
        notificacoesEmail: boolean;
        notificacoesPush: boolean;
        notificacoesConvites: boolean;
        notificacoesAtualizacoes: boolean;
        idioma: string;
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        usuarioId: number;
    }>;
    atualizarPreferencias(usuarioId: number, dto: AtualizarPreferenciasDto): Promise<{
        notificacoesEmail: boolean;
        notificacoesPush: boolean;
        notificacoesConvites: boolean;
        notificacoesAtualizacoes: boolean;
        idioma: string;
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        usuarioId: number;
    }>;
    alterarSenha(usuarioId: number, dto: AlterarSenhaDto): Promise<{
        mensagem: string;
    }>;
    atualizarSenhaHash(usuarioId: number, senhaHash: string): Promise<void>;
    marcarEmailComoVerificado(usuarioId: number): Promise<{
        id: number;
        email: string;
        emailVerificadoEm: Date | null;
    }>;
    exportarDados(usuarioId: number): Promise<{
        exportadoEm: string;
        usuario: {
            id: number;
            email: string;
            apelido: string;
            emailVerificadoEm: Date | null;
            role: import("@prisma/client").$Enums.RoleUsuario;
            criadoEm: Date;
        } | null;
        personagens: ({
            classe: {
                id: number;
                nome: string;
                descricao: string | null;
                periciasLivresBase: number;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
            };
            trilha: {
                id: number;
                nome: string;
                classeId: number;
                descricao: string | null;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                requisitos: Prisma.JsonValue | null;
            } | null;
            caminho: {
                id: number;
                nome: string;
                trilhaId: number;
                descricao: string | null;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
            } | null;
            cla: {
                id: number;
                nome: string;
                descricao: string | null;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                grandeCla: boolean;
            };
            origem: {
                id: number;
                nome: string;
                descricao: string | null;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                requisitosTexto: string | null;
                requerGrandeCla: boolean;
                requerTecnicaHeriditaria: boolean;
                bloqueiaTecnicaHeriditaria: boolean;
            };
            tecnicaInata: {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                requisitos: Prisma.JsonValue | null;
                codigo: string;
                tipo: import("@prisma/client").$Enums.TipoTecnicaAmaldicoada;
                hereditaria: boolean;
                linkExterno: string | null;
            } | null;
        } & {
            id: number;
            donoId: number;
            nome: string;
            nivel: number;
            claId: number;
            origemId: number;
            classeId: number;
            trilhaId: number | null;
            caminhoId: number | null;
            agilidade: number;
            forca: number;
            intelecto: number;
            presenca: number;
            vigor: number;
            estudouEscolaTecnica: boolean;
            tecnicaInataId: number | null;
            passivasAtributosAtivos: Prisma.JsonValue | null;
            passivasAtributosConfig: Prisma.JsonValue | null;
            proficienciasExtrasCodigos: Prisma.JsonValue | null;
            idade: number | null;
            prestigioBase: number;
            prestigioClaBase: number | null;
            alinhamentoId: number | null;
            background: string | null;
            atributoChaveEa: import("@prisma/client").$Enums.AtributoBaseEA;
            espacosInventarioBase: number;
            espacosInventarioExtra: number;
            espacosOcupados: number;
            sobrecarregado: boolean;
            periciasClasseEscolhidasCodigos: Prisma.JsonValue | null;
            periciasOrigemEscolhidasCodigos: Prisma.JsonValue | null;
            periciasLivresCodigos: Prisma.JsonValue | null;
            pvMaximo: number;
            peMaximo: number;
            eaMaximo: number;
            sanMaximo: number;
            defesaBase: number;
            defesaEquipamento: number;
            defesaOutros: number;
            deslocamento: number;
            limitePeEaPorTurno: number;
            reacoesBasePorTurno: number;
            turnosMorrendo: number;
            turnosEnlouquecendo: number;
            bloqueio: number;
            esquiva: number;
        })[];
        campanhas: ({
            membros: ({
                usuario: {
                    apelido: string;
                };
            } & {
                id: number;
                usuarioId: number;
                campanhaId: number;
                papel: string;
                entrouEm: Date;
            })[];
        } & {
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            donoId: number;
            nome: string;
            descricao: string | null;
            status: string;
        })[];
        preferencias: {
            notificacoesEmail: boolean;
            notificacoesPush: boolean;
            notificacoesConvites: boolean;
            notificacoesAtualizacoes: boolean;
            idioma: string;
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            usuarioId: number;
        } | null;
    }>;
    excluirConta(usuarioId: number, senha: string): Promise<{
        mensagem: string;
    }>;
}
