import { PartialType } from '@nestjs/mapped-types';
import { CreateNpcAmeacaDto } from './create-npc-ameaca.dto';

export class UpdateNpcAmeacaDto extends PartialType(CreateNpcAmeacaDto) {}
