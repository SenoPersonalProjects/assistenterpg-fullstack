import { PartialType } from '@nestjs/mapped-types';
import { CreateAnotacaoDto } from './create-anotacao.dto';

export class UpdateAnotacaoDto extends PartialType(CreateAnotacaoDto) {}
