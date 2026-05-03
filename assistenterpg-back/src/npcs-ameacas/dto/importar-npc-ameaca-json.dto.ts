import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ImportarNpcAmeacaJsonDto {
  @IsString()
  exportType!: string;

  @IsInt()
  @Min(1)
  schemaVersion!: number;

  @IsOptional()
  @IsString()
  exportedAt?: string;

  @IsOptional()
  @IsObject()
  item?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  group?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  items?: Record<string, unknown>[];
}
