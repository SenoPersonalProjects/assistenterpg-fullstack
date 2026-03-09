import { OmitType, PartialType } from '@nestjs/mapped-types';
import { AdicionarNpcSessaoDto } from './adicionar-npc-sessao.dto';

export class AtualizarNpcSessaoDto extends PartialType(
  OmitType(AdicionarNpcSessaoDto, ['npcAmeacaId'] as const),
) {}
