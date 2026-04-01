import { IsIn, IsOptional } from 'class-validator';

const MODOS_VALIDOS = ['ATUAL', 'OUTRO'] as const;
const NUCLEOS_VALIDOS = ['EQUILIBRIO', 'PODER', 'IMPULSO'] as const;

export class SacrificarNucleoPersonagemCampanhaDto {
  @IsIn(MODOS_VALIDOS, { message: 'modo deve ser ATUAL ou OUTRO' })
  modo!: (typeof MODOS_VALIDOS)[number];

  @IsOptional()
  @IsIn(NUCLEOS_VALIDOS, { message: 'nucleo deve ser EQUILIBRIO, PODER ou IMPULSO' })
  nucleo?: (typeof NUCLEOS_VALIDOS)[number];
}

