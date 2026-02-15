// src/suplementos/suplementos.module.ts

import { Module } from '@nestjs/common';
import { SuplementosController } from './suplementos.controller';
import { SuplementosService } from './suplementos.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SuplementosController],
  providers: [SuplementosService],
  exports: [SuplementosService], // ✅ Exportar para uso em outros módulos
})
export class SuplementosModule {}
