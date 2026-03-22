import { CreateHabilidadeTecnicaDto } from './create-habilidade-tecnica.dto';
declare const UpdateHabilidadeTecnicaDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateHabilidadeTecnicaDto, "codigo" | "tecnicaId">>>;
export declare class UpdateHabilidadeTecnicaDto extends UpdateHabilidadeTecnicaDto_base {
}
export {};
