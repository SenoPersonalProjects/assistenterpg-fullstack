import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class NpcAmeacaNaoEncontradaException extends BaseException {
  constructor(identificador?: number) {
    super(
      'NPC/Ameaca nao encontrado',
      HttpStatus.NOT_FOUND,
      'NPC_AMEACA_NOT_FOUND',
      { identificador },
    );
  }
}
