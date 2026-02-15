import { TipoHomebrewConteudo, StatusPublicacao } from '@prisma/client';
export declare class HomebrewDetalhadoDto {
    id: number;
    codigo: string;
    nome: string;
    descricao?: string;
    tipo: TipoHomebrewConteudo;
    status: StatusPublicacao;
    dados: any;
    tags?: string[];
    versao: string;
    usuarioId: number;
    usuarioApelido?: string;
    criadoEm: Date;
    atualizadoEm: Date;
}
