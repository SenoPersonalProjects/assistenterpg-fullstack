import {
  IsDateString,
  IsIn,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class RegistrarErroClienteDto {
  @IsIn(['ERRO_JAVASCRIPT', 'PROMISE_REJEITADA'])
  tipo: 'ERRO_JAVASCRIPT' | 'PROMISE_REJEITADA';

  @IsString()
  @MaxLength(500)
  mensagem: string;

  @IsString()
  @MaxLength(240)
  @Matches(/^\//, { message: 'rota deve iniciar com /' })
  rota: string;

  @IsString()
  @MaxLength(120)
  versao: string;

  @IsDateString()
  em: string;
}
