import { CampoPersonagemCampanhaNumerico, CampoRecursoAtual } from './campanha.engine.types';
export declare function lerCampoNumerico(personagem: Record<string, number | null>, campo: CampoPersonagemCampanhaNumerico | CampoRecursoAtual): number;
export declare function clamp(valor: number, minimo: number, maximo: number): number;
export declare function normalizarEmail(email: string): string;
export declare function gerarCodigoConvite(): string;
export declare function isUniqueConstraintViolation(error: unknown, campos: string[]): boolean;
