import { TipoAmaldicoado } from '@prisma/client';
import { EquipamentoBaseDto } from '../base/equipamento-base.dto';
import { HomebrewArmaDto } from './criar-homebrew-arma.dto';
import { HomebrewProtecaoDto } from './criar-homebrew-protecao.dto';
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
    dadosArma: HomebrewArmaDto;
}
export declare class ProtecaoAmaldicoadaDto {
    tipoBase: string;
    proficienciaRequerida: boolean;
    efeito: string;
    dadosProtecao: HomebrewProtecaoDto;
}
export declare class HomebrewFerramentaAmaldicoadaDto extends EquipamentoBaseDto {
    tipoAmaldicoado: TipoAmaldicoado;
    armaAmaldicoada?: ArmaAmaldicoadaDto;
    protecaoAmaldicoada?: ProtecaoAmaldicoadaDto;
    artefatoAmaldicoado?: ArtefatoAmaldicoadoDto;
}
