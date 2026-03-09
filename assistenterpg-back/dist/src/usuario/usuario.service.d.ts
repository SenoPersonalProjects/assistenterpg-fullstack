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
        apelido: string;
        email: string;
        criadoEm: Date;
        role: import("@prisma/client").$Enums.RoleUsuario;
    }>;
    buscarPorEmail(email: string): Promise<{
        id: number;
        apelido: string;
        email: string;
        senhaHash: string;
        criadoEm: Date;
        atualizadoEm: Date;
        role: import("@prisma/client").$Enums.RoleUsuario;
    }>;
    buscarPorId(id: number): Promise<{
        id: number;
        apelido: string;
        email: string;
        senhaHash: string;
        criadoEm: Date;
        atualizadoEm: Date;
        role: import("@prisma/client").$Enums.RoleUsuario;
    }>;
    buscarPorApelido(apelido: string): Promise<{
        id: number;
        apelido: string;
        email: string;
        criadoEm: Date;
        role: import("@prisma/client").$Enums.RoleUsuario;
    }>;
    obterEstatisticas(usuarioId: number): Promise<{
        campanhas: number;
        personagens: number;
        artigosLidos: number;
    }>;
    obterPreferencias(usuarioId: number): Promise<{
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        usuarioId: number;
        notificacoesEmail: boolean;
        notificacoesPush: boolean;
        notificacoesConvites: boolean;
        notificacoesAtualizacoes: boolean;
        idioma: string;
    }>;
    atualizarPreferencias(usuarioId: number, dto: AtualizarPreferenciasDto): Promise<{
        id: number;
        criadoEm: Date;
        atualizadoEm: Date;
        usuarioId: number;
        notificacoesEmail: boolean;
        notificacoesPush: boolean;
        notificacoesConvites: boolean;
        notificacoesAtualizacoes: boolean;
        idioma: string;
    }>;
    alterarSenha(usuarioId: number, dto: AlterarSenhaDto): Promise<{
        mensagem: string;
    }>;
    exportarDados(usuarioId: number): Promise<{
        exportadoEm: string;
        usuario: {
            id: number;
            apelido: string;
            email: string;
            criadoEm: Date;
            role: import("@prisma/client").$Enums.RoleUsuario;
        } | null;
        personagens: ({
            origem: {
                id: number;
                nome: string;
                descricao: string | null;
                requisitosTexto: string | null;
                requerGrandeCla: boolean;
                requerTecnicaHeriditaria: boolean;
                bloqueiaTecnicaHeriditaria: boolean;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
            };
            classe: {
                id: number;
                nome: string;
                descricao: string | null;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                periciasLivresBase: number;
            };
            trilha: {
                id: number;
                nome: string;
                descricao: string | null;
                classeId: number;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                requisitos: Prisma.JsonValue | null;
            } | null;
            caminho: {
                id: number;
                nome: string;
                descricao: string | null;
                trilhaId: number;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
            } | null;
            cla: {
                id: number;
                nome: string;
                descricao: string | null;
                grandeCla: boolean;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
            };
            tecnicaInata: {
                id: number;
                criadoEm: Date;
                atualizadoEm: Date;
                nome: string;
                descricao: string;
                tipo: import("@prisma/client").$Enums.TipoTecnicaAmaldicoada;
                codigo: string;
                fonte: import("@prisma/client").$Enums.TipoFonte;
                suplementoId: number | null;
                requisitos: Prisma.JsonValue | null;
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
            tecnicaInataId: number | null;
            estudouEscolaTecnica: boolean;
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
                campanhaId: number;
                usuarioId: number;
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
            id: number;
            criadoEm: Date;
            atualizadoEm: Date;
            usuarioId: number;
            notificacoesEmail: boolean;
            notificacoesPush: boolean;
            notificacoesConvites: boolean;
            notificacoesAtualizacoes: boolean;
            idioma: string;
        } | null;
    }>;
    excluirConta(usuarioId: number, senha: string): Promise<{
        mensagem: string;
    }>;
}
