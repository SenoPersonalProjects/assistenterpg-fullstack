// src/compendio/compendio.module.ts
import { Module } from '@nestjs/common';
import { CompendioController } from './compendio.controller';
import { CompendioService } from './compendio.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompendioController],
  providers: [CompendioService],
  exports: [CompendioService],
})
export class CompendioModule {}
