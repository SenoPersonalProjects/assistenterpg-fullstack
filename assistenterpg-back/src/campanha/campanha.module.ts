// src/campanha/campanha.module.ts
import { Module } from '@nestjs/common';
import { CampanhaService } from './campanha.service';
import { CampanhaController } from './campanha.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CampanhaService],
  controllers: [CampanhaController],
})
export class CampanhaModule {}
