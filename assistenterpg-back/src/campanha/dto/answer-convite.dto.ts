import { IsBoolean } from 'class-validator';

export class AnswerConviteDto {
  @IsBoolean({ message: 'aceitar deve ser booleano' })
  aceitar: boolean;
}
