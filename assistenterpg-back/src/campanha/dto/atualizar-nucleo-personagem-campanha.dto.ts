import { IsIn } from 'class-validator';

const NUCLEOS_VALIDOS = ['EQUILIBRIO', 'PODER', 'IMPULSO'] as const;

export class AtualizarNucleoPersonagemCampanhaDto {
  @IsIn(NUCLEOS_VALIDOS, {
    message: 'nucleo deve ser EQUILIBRIO, PODER ou IMPULSO',
  })
  nucleo!: (typeof NUCLEOS_VALIDOS)[number];
}
