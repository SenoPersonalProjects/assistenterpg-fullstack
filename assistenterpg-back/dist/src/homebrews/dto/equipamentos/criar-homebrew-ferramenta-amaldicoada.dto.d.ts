import { TipoAmaldicoado } from '@prisma/client';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';
import { HomebrewArmaDto } from './criar-homebrew-arma.dto';
import { HomebrewProtecaoDto } from './criar-homebrew-protecao.dto';
declare const DadosArmaAmaldicoadaDto_base: import("@nestjs/mapped-types").MappedType<Omit<HomebrewArmaDto, "tipo" | "categoria" | "espacos" | "tipoUso">>;
export declare class DadosArmaAmaldicoadaDto extends DadosArmaAmaldicoadaDto_base {
}
declare const DadosProtecaoAmaldicoadaDto_base: import("@nestjs/mapped-types").MappedType<Omit<HomebrewProtecaoDto, "tipo" | "categoria" | "espacos" | "tipoUso">>;
export declare class DadosProtecaoAmaldicoadaDto extends DadosProtecaoAmaldicoadaDto_base {
}
export declare class ArtefatoAmaldicoadoDto {
    tipoBase: string;
    proficienciaRequerida: boolean;
    efeito: string;
    custoUso: string;
    manutencao: string;
}
export declare class ArmaAmaldicoadaDto {
    tipoBase: string;
    proficienciaRequerida: boolean;
    efeito: string;
    dadosArma: DadosArmaAmaldicoadaDto;
}
export declare class ProtecaoAmaldicoadaDto {
    tipoBase: string;
    proficienciaRequerida: boolean;
    efeito: string;
    dadosProtecao: DadosProtecaoAmaldicoadaDto;
}
export declare class HomebrewFerramentaAmaldicoadaDto extends EquipamentoBaseDto {
    tipoAmaldicoado: TipoAmaldicoado;
    armaAmaldicoada?: ArmaAmaldicoadaDto;
    protecaoAmaldicoada?: ProtecaoAmaldicoadaDto;
    artefatoAmaldicoado?: ArtefatoAmaldicoadoDto;
}
export {};
