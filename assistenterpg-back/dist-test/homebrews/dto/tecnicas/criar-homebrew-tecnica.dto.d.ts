import { TipoTecnicaAmaldicoada } from '@prisma/client';
import { HabilidadeTecnicaDto } from './habilidade-tecnica.dto';
export declare class HomebrewTecnicaDto {
    tipo: TipoTecnicaAmaldicoada;
    hereditaria?: boolean;
    linkExterno?: string;
    requisitos?: any;
    habilidades: HabilidadeTecnicaDto[];
}
