import { IsBoolean } from 'class-validator';

export class AtualizarElencoSessaoDto {
  @IsBoolean()
  elencoControladoPeloMestre!: boolean;
}
