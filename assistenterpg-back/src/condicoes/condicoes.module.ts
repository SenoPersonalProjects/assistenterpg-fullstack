// src/condicoes/condicoes.module.ts

import { Module } from '@nestjs/common';
import { CondicoesService } from './condicoes.service';
import { CondicoesController } from './condicoes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CondicoesController],
  providers: [CondicoesService],
  exports: [CondicoesService],
})
export class CondicoesModule {}
