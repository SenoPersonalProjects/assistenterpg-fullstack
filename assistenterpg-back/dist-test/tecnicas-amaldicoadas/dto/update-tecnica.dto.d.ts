import { CreateTecnicaDto } from './create-tecnica.dto';
declare const UpdateTecnicaDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateTecnicaDto, "codigo">>>;
export declare class UpdateTecnicaDto extends UpdateTecnicaDto_base {
}
export {};
