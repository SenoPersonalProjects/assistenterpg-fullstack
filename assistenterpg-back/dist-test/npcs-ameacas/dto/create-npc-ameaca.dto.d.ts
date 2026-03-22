import { TamanhoNpcAmeaca, TipoFichaNpcAmeaca, TipoNpcAmeaca } from '@prisma/client';
declare class NpcAmeacaPericiaEspecialDto {
    codigo: string;
    dados?: number;
    bonus?: number;
    descricao?: string;
}
declare class NpcAmeacaPassivaDto {
    nome: string;
    descricao: string;
    gatilho?: string;
    alcance?: string;
    alvo?: string;
    duracao?: string;
    requisitos?: string;
    efeitoGuia?: string;
}
declare class NpcAmeacaAcaoDto {
    nome: string;
    tipoExecucao?: string;
    alcance?: string;
    alvo?: string;
    duracao?: string;
    resistencia?: string;
    dtResistencia?: string;
    custoPE?: number;
    custoEA?: number;
    teste?: string;
    dano?: string;
    critico?: string;
    efeito?: string;
    requisitos?: string;
    descricao?: string;
}
export declare class CreateNpcAmeacaDto {
    nome: string;
    descricao?: string;
    fichaTipo?: TipoFichaNpcAmeaca;
    tipo: TipoNpcAmeaca;
    tamanho?: TamanhoNpcAmeaca;
    vd?: number;
    agilidade?: number;
    forca?: number;
    intelecto?: number;
    presenca?: number;
    vigor?: number;
    percepcao?: number;
    iniciativa?: number;
    fortitude?: number;
    reflexos?: number;
    vontade?: number;
    luta?: number;
    jujutsu?: number;
    percepcaoDados?: number;
    iniciativaDados?: number;
    fortitudeDados?: number;
    reflexosDados?: number;
    vontadeDados?: number;
    lutaDados?: number;
    jujutsuDados?: number;
    defesa?: number;
    pontosVida?: number;
    machucado?: number | null;
    deslocamentoMetros?: number;
    periciasEspeciais?: NpcAmeacaPericiaEspecialDto[];
    resistencias?: string[];
    vulnerabilidades?: string[];
    passivas?: NpcAmeacaPassivaDto[];
    acoes?: NpcAmeacaAcaoDto[];
    usoTatico?: string;
}
export {};
