import { Prisma } from '@prisma/client';
import { TecnicaDetalhadaDto } from './dto/tecnica-detalhada.dto';
export declare const tecnicaDetalhadaInclude: {
    clas: {
        include: {
            cla: {
                select: {
                    id: true;
                    nome: true;
                    grandeCla: true;
                };
            };
        };
    };
    habilidades: {
        include: {
            variacoes: {
                orderBy: {
                    ordem: "asc";
                };
            };
        };
        orderBy: {
            ordem: "asc";
        };
    };
    suplemento: true;
};
export type TecnicaDetalhadaPayload = Prisma.TecnicaAmaldicoadaGetPayload<{
    include: typeof tecnicaDetalhadaInclude;
}>;
export declare const tecnicaUsoInclude: {
    _count: {
        select: {
            personagensBaseComInata: true;
            personagensCampanhaComInata: true;
            personagensBaseAprendeu: true;
            personagensCampanhaAprendeu: true;
        };
    };
};
export declare class TecnicasAmaldicoadasMapper {
    mapTecnicaToDto(tecnica: TecnicaDetalhadaPayload, options?: {
        incluirClas?: boolean;
        incluirHabilidades?: boolean;
    }): TecnicaDetalhadaDto;
}
