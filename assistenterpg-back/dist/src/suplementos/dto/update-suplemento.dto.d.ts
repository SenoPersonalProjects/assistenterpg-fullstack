import { CreateSuplementoDto } from './create-suplemento.dto';
declare const UpdateSuplementoDto_base: import("@nestjs/mapped-types").MappedType<Partial<Omit<CreateSuplementoDto, "codigo">>>;
export declare class UpdateSuplementoDto extends UpdateSuplementoDto_base {
}
export {};
