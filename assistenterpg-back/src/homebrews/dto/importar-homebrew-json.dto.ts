import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class ImportarHomebrewJsonDto {
  @IsString()
  @MaxLength(64)
  exportType!: string;

  @IsInt()
  @Min(1)
  schemaVersion!: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  exportedAt?: string;

  @IsOptional()
  @IsObject()
  item?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  group?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  items?: Record<string, unknown>[];
}
