export declare class DanoDetalhadoDto {
    empunhadura: string | null;
    tipoDano: string;
    rolagem: string;
    valorFlat: number;
}
export declare class ReducaoDanoDetalhadaDto {
    tipoReducao: string;
    valor: number;
}
export declare class ArmaAmaldicoadaDto {
    tipoBase: string;
    proficienciaRequerida: boolean;
    efeito: string | null;
}
export declare class ProtecaoAmaldicoadaDto {
    tipoBase: string;
    bonusDefesa: number;
    penalidadeCarga: number;
    proficienciaRequerida: boolean;
    efeito: string | null;
}
export declare class ArtefatoAmaldicoadoDto {
    tipoBase: string;
    proficienciaRequerida: boolean;
    efeito: string | null;
    custoUso: string | null;
    manutencao: string | null;
}
export declare class ModificacaoDisponivelDto {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
    tipo: string;
    incrementoEspacos: number;
}
export declare class EquipamentoDetalhadoDto {
    id: number;
    codigo: string;
    nome: string;
    descricao: string | null;
    tipo: string;
    fonte: string;
    suplementoId: number | null;
    categoria: number;
    espacos: number;
    complexidadeMaldicao: string;
    proficienciaArma?: string | null;
    empunhaduras?: string[] | null;
    tipoArma?: string | null;
    subtipoDistancia?: string | null;
    agil?: boolean;
    criticoValor?: number | null;
    criticoMultiplicador?: number | null;
    alcance?: string | null;
    tipoMunicaoCodigo?: string | null;
    habilidadeEspecial?: string | null;
    danos?: DanoDetalhadoDto[];
    proficienciaProtecao?: string | null;
    tipoProtecao?: string | null;
    bonusDefesa?: number;
    penalidadeCarga?: number;
    reducoesDano?: ReducaoDanoDetalhadaDto[];
    duracaoCenas?: number | null;
    recuperavel?: boolean | null;
    tipoAcessorio?: string | null;
    periciaBonificada?: string | null;
    bonusPericia?: number;
    requereEmpunhar?: boolean;
    maxVestimentas?: number;
    tipoExplosivo?: string | null;
    efeito?: string | null;
    tipoUso?: string | null;
    tipoAmaldicoado?: string | null;
    efeitoMaldicao?: string | null;
    requerFerramentasAmaldicoadas?: boolean;
    armaAmaldicoada?: ArmaAmaldicoadaDto | null;
    protecaoAmaldicoada?: ProtecaoAmaldicoadaDto | null;
    artefatoAmaldicoado?: ArtefatoAmaldicoadoDto | null;
    modificacoesDisponiveis?: ModificacaoDisponivelDto[];
}
