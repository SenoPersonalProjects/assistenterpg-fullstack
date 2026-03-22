import { TipoTecnicaAmaldicoada, TipoFonte } from '@prisma/client';
import type { Prisma } from '@prisma/client';
export declare class CreateTecnicaDto {
    codigo: string;
    nome: string;
    descricao: string;
    tipo: TipoTecnicaAmaldicoada;
    hereditaria?: boolean;
    clasHereditarios?: string[];
    linkExterno?: string;
    fonte?: TipoFonte;
    suplementoId?: number;
    requisitos?: Prisma.JsonValue;
}
